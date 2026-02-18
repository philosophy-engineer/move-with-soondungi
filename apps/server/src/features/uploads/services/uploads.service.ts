import { randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
} from "@workspace/shared/blog";
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@workspace/shared/upload";

import { throwBadRequest } from "../../../common/errors/error-response.js";
import { UploadSession } from "../entities/upload-session.entity.js";
import { UploadedImage } from "../entities/uploaded-image.entity.js";
import { UPLOADS_REPOSITORY, type UploadsRepository } from "../repositories/uploads.repository.js";
import { UploadsS3Repository } from "../repositories/uploads.s3.repository.js";

const PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS = 10 * 60;

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

@Injectable()
export class UploadsService {
  constructor(
    @Inject(UPLOADS_REPOSITORY)
    private readonly uploadsRepository: UploadsRepository,
    private readonly uploadsS3Repository: UploadsS3Repository,
  ) {}

  async createPresignedUpload(payload: PresignUploadRequest): Promise<PresignUploadResponse> {
    this.validateImageUploadPolicy(payload);

    const fileKey = `file_${randomUUID()}`;
    const completeToken = `token_${randomUUID()}`;
    const objectKey = `uploads/${fileKey}_${sanitizeFilename(payload.filename)}`;
    const expiresAtMs = Date.now() + PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();

    const session = new UploadSession({
      fileKey,
      objectKey,
      filename: payload.filename,
      mimeType: payload.mimeType,
      size: payload.size,
      completeToken,
      expiresAtMs,
    });

    this.runRepository(() => {
      this.uploadsRepository.saveSession(session);
    });

    const uploadUrl = await this.runS3(() =>
      this.uploadsS3Repository.createPutObjectPresignedUrl({
        objectKey,
        contentType: payload.mimeType,
        expiresInSeconds: PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS,
      }),
    );

    return {
      fileKey,
      uploadUrl,
      completeToken,
      expiresAt,
    };
  }

  async completeUpload(payload: CompleteUploadRequest): Promise<CompleteUploadResponse> {
    const session = this.runRepository(() => {
      const found = this.uploadsRepository.findSessionByFileKey(payload.fileKey);

      if (!found) {
        throw new Error("업로드 세션을 찾을 수 없습니다.");
      }

      if (found.completeToken !== payload.completeToken) {
        throw new Error("유효하지 않은 완료 토큰입니다.");
      }

      if (found.expiresAtMs < Date.now()) {
        throw new Error("업로드 세션이 만료되었습니다.");
      }

      return found;
    });

    const existingImageId = this.runRepository(() =>
      this.uploadsRepository.findImageIdByFileKey(payload.fileKey),
    );

    if (existingImageId) {
      const existingImage = this.runRepository(() =>
        this.uploadsRepository.findImageById(existingImageId),
      );
      const objectKey = existingImage?.objectKey ?? session.objectKey;

      return {
        imageId: existingImageId,
        url: this.uploadsS3Repository.buildPublicObjectUrl(objectKey),
      };
    }

    const existsInStorage = await this.runS3(() =>
      this.uploadsS3Repository.headObject(session.objectKey),
    );

    if (!existsInStorage) {
      throwBadRequest("업로드된 파일이 없습니다.");
    }

    const image = new UploadedImage({
      imageId: `img_${randomUUID()}`,
      fileKey: session.fileKey,
      objectKey: session.objectKey,
      mimeType: session.mimeType,
      createdAt: new Date().toISOString(),
    });

    this.runRepository(() => {
      this.uploadsRepository.saveImage(image);
      this.uploadsRepository.saveImageLink(payload.fileKey, image.imageId);
    });

    return {
      imageId: image.imageId,
      url: this.uploadsS3Repository.buildPublicObjectUrl(image.objectKey),
    };
  }

  private validateImageUploadPolicy(payload: { mimeType: string; size: number }) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(payload.mimeType as AllowedImageMimeType)) {
      throwBadRequest("jpg/png/webp 형식만 업로드할 수 있습니다.");
    }

    if (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES) {
      throwBadRequest("이미지 용량은 10MB 이하여야 합니다.");
    }
  }

  private runRepository<T>(runner: () => T): T {
    try {
      return runner();
    } catch (error) {
      if (error instanceof Error) {
        throwBadRequest(error.message);
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.");
    }
  }

  private async runS3<T>(runner: () => Promise<T>): Promise<T> {
    try {
      return await runner();
    } catch {
      throwBadRequest("스토리지 처리 중 오류가 발생했습니다.");
    }
  }
}
