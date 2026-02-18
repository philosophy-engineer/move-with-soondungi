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
import { PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS } from "../constants/uploads.constants.js";
import { UploadSession } from "../entities/upload-session.entity.js";
import { UploadedImage } from "../entities/uploaded-image.entity.js";
import { UPLOADS_REPOSITORY, type UploadsRepository } from "../repositories/uploads.repository.js";
import { UploadsS3Repository } from "../repositories/uploads.s3.repository.js";
import {
  buildUploadObjectKey,
  createUploadCompleteToken,
  createUploadFileKey,
} from "../utils/upload-keys.js";

@Injectable()
export class UploadsService {
  constructor(
    @Inject(UPLOADS_REPOSITORY)
    private readonly uploadsRepository: UploadsRepository,
    private readonly uploadsS3Repository: UploadsS3Repository,
  ) {}

  async createPresignedUpload(payload: PresignUploadRequest): Promise<PresignUploadResponse> {
    this.validateImageUploadPolicy(payload);

    const fileKey = createUploadFileKey();
    const completeToken = createUploadCompleteToken();
    const objectKey = buildUploadObjectKey(fileKey, payload.filename);
    const expiresAtMs = Date.now() + PRESIGNED_UPLOAD_EXPIRES_IN_SECONDS * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();

    const session = UploadSession.create({
      fileKey,
      objectKey,
      filename: payload.filename,
      mimeType: payload.mimeType,
      size: payload.size,
      completeToken,
      expiresAtMs,
    });

    await this.runRepository(async () => {
      await this.uploadsRepository.saveSession(session);
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
    const session = await this.runRepository(async () => {
      const found = await this.uploadsRepository.findSessionByFileKey(payload.fileKey);

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

    const existingImageId = await this.runRepository(() =>
      this.uploadsRepository.findImageIdByFileKey(payload.fileKey),
    );

    if (existingImageId) {
      const existingImage = await this.runRepository(() =>
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

    const image = UploadedImage.create({
      fileKey: session.fileKey,
      objectKey: session.objectKey,
      mimeType: session.mimeType,
      createdAt: new Date().toISOString(),
    });

    const savedImage = await this.runRepository(async () => {
      const storedImage = await this.uploadsRepository.saveImage(image);

      if (!storedImage.imageId) {
        throw new Error("이미지 ID 생성에 실패했습니다.");
      }

      await this.uploadsRepository.saveImageLink(payload.fileKey, storedImage.imageId);
      return storedImage;
    });

    if (!savedImage.imageId) {
      throwBadRequest("이미지 ID 생성에 실패했습니다.");
    }

    return {
      imageId: savedImage.imageId,
      url: this.uploadsS3Repository.buildPublicObjectUrl(savedImage.objectKey),
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

  private async runRepository<T>(runner: () => Promise<T>): Promise<T> {
    try {
      return await runner();
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
