import { randomUUID } from "node:crypto"

import { Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
} from "@workspace/shared/blog"
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@workspace/shared/upload"

import { ENV_KEYS, type AppEnv } from "../../../common/config/env.types.js"
import { throwBadRequest } from "../../../common/errors/error-response.js"
import { UploadSession } from "../entities/upload-session.entity.js"
import { UploadedImage } from "../entities/uploaded-image.entity.js"
import {
  UPLOADS_REPOSITORY,
  type UploadsRepository,
} from "../repositories/uploads.repository.js"

@Injectable()
export class UploadsService {
  constructor(
    @Inject(UPLOADS_REPOSITORY)
    private readonly uploadsRepository: UploadsRepository,
    private readonly configService: ConfigService<AppEnv, true>
  ) {}

  createPresignedUpload(payload: PresignUploadRequest): PresignUploadResponse {
    this.validateImageUploadPolicy(payload)

    const fileKey = `file_${randomUUID()}`
    const completeToken = `token_${randomUUID()}`
    const expiresAtMs = Date.now() + 10 * 60 * 1000
    const expiresAt = new Date(expiresAtMs).toISOString()

    const session = new UploadSession({
      fileKey,
      filename: payload.filename,
      mimeType: payload.mimeType,
      size: payload.size,
      completeToken,
      expiresAtMs,
    })

    this.runRepository(() => {
      this.uploadsRepository.saveSession(session)
    })

    const uploadPath = `/api/mock/uploads/blob/${encodeURIComponent(fileKey)}?token=${encodeURIComponent(completeToken)}`

    return {
      fileKey,
      uploadUrl: new URL(uploadPath, this.getServerPublicOrigin()).toString(),
      completeToken,
      expiresAt,
    }
  }

  saveUploadBlob(payload: {
    fileKey: string
    token: string
    data: ArrayBuffer
    contentType?: string
  }) {
    this.runRepository(() => {
      const session = this.uploadsRepository.findSessionByFileKey(payload.fileKey)

      if (!session) {
        throw new Error("업로드 세션을 찾을 수 없습니다.")
      }

      if (session.completeToken !== payload.token) {
        throw new Error("유효하지 않은 업로드 토큰입니다.")
      }

      if (session.expiresAtMs < Date.now()) {
        throw new Error("업로드 세션이 만료되었습니다.")
      }

      const updatedSession = new UploadSession({
        fileKey: session.fileKey,
        filename: session.filename,
        mimeType: session.mimeType,
        size: session.size,
        completeToken: session.completeToken,
        expiresAtMs: session.expiresAtMs,
        uploadedData: payload.data.slice(0),
        uploadedMimeType: payload.contentType ?? session.mimeType,
      })

      this.uploadsRepository.saveSession(updatedSession)
    })
  }

  completeUpload(payload: CompleteUploadRequest): CompleteUploadResponse {
    return this.runRepository(() => {
      const session = this.uploadsRepository.findSessionByFileKey(payload.fileKey)

      if (!session) {
        throw new Error("업로드 세션을 찾을 수 없습니다.")
      }

      if (session.completeToken !== payload.completeToken) {
        throw new Error("유효하지 않은 완료 토큰입니다.")
      }

      if (!session.uploadedData) {
        throw new Error("업로드된 파일이 없습니다.")
      }

      const existingImageId = this.uploadsRepository.findImageIdByFileKey(
        payload.fileKey
      )
      if (existingImageId) {
        return {
          imageId: existingImageId,
          url: this.buildFileUrl(existingImageId),
        }
      }

      const image = new UploadedImage({
        imageId: `img_${randomUUID()}`,
        fileKey: session.fileKey,
        mimeType: session.uploadedMimeType ?? session.mimeType,
        bytes: session.uploadedData,
        createdAt: new Date().toISOString(),
      })

      this.uploadsRepository.saveImage(image)
      this.uploadsRepository.saveImageLink(payload.fileKey, image.imageId)

      return {
        imageId: image.imageId,
        url: this.buildFileUrl(image.imageId),
      }
    })
  }

  getImageById(imageId: string): UploadedImage | undefined {
    return this.uploadsRepository.findImageById(imageId)
  }

  private validateImageUploadPolicy(payload: { mimeType: string; size: number }) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(payload.mimeType as AllowedImageMimeType)) {
      throwBadRequest("jpg/png/webp 형식만 업로드할 수 있습니다.")
    }

    if (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES) {
      throwBadRequest("이미지 용량은 10MB 이하여야 합니다.")
    }
  }

  private buildFileUrl(imageId: string): string {
    return new URL(
      `/api/mock/uploads/file/${encodeURIComponent(imageId)}`,
      this.getServerPublicOrigin()
    ).toString()
  }

  private getServerPublicOrigin(): string {
    return this.configService.getOrThrow<string>(ENV_KEYS.SERVER_PUBLIC_ORIGIN)
  }

  private runRepository<T>(runner: () => T): T {
    try {
      return runner()
    } catch (error) {
      if (error instanceof Error) {
        throwBadRequest(error.message)
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.")
    }
  }
}
