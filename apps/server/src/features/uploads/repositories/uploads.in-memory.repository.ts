import { randomUUID } from "node:crypto"

import { Injectable } from "@nestjs/common"
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@workspace/shared/upload"

import type {
  StoredImage,
  UploadsRepository,
} from "./uploads.repository.js"

type PendingUpload = {
  fileKey: string
  filename: string
  mimeType: string
  size: number
  completeToken: string
  expiresAtMs: number
  uploadedData?: ArrayBuffer
  uploadedMimeType?: string
}

type InternalStoredImage = StoredImage & {
  fileKey: string
  createdAt: string
}

@Injectable()
export class UploadsInMemoryRepository implements UploadsRepository {
  private readonly pendingUploads = new Map<string, PendingUpload>()
  private readonly images = new Map<string, InternalStoredImage>()
  private readonly fileKeyToImageId = new Map<string, string>()

  private nowIso() {
    return new Date().toISOString()
  }

  createPresignedUpload(
    payload: PresignUploadRequest,
    serverPublicOrigin: string
  ): PresignUploadResponse {
    const fileKey = `file_${randomUUID()}`
    const completeToken = `token_${randomUUID()}`
    const expiresAtMs = Date.now() + 10 * 60 * 1000
    const expiresAt = new Date(expiresAtMs).toISOString()

    this.pendingUploads.set(fileKey, {
      fileKey,
      filename: payload.filename,
      mimeType: payload.mimeType,
      size: payload.size,
      completeToken,
      expiresAtMs,
    })

    const uploadPath = `/api/mock/uploads/blob/${encodeURIComponent(fileKey)}?token=${encodeURIComponent(completeToken)}`

    return {
      fileKey,
      uploadUrl: new URL(uploadPath, serverPublicOrigin).toString(),
      completeToken,
      expiresAt,
    }
  }

  saveUploadBlob(params: {
    fileKey: string
    token: string
    data: ArrayBuffer
    contentType?: string
  }) {
    const pending = this.pendingUploads.get(params.fileKey)

    if (!pending) {
      throw new Error("업로드 세션을 찾을 수 없습니다.")
    }

    if (pending.completeToken !== params.token) {
      throw new Error("유효하지 않은 업로드 토큰입니다.")
    }

    if (pending.expiresAtMs < Date.now()) {
      throw new Error("업로드 세션이 만료되었습니다.")
    }

    pending.uploadedData = params.data.slice(0)
    pending.uploadedMimeType = params.contentType ?? pending.mimeType
    this.pendingUploads.set(params.fileKey, pending)
  }

  completeUpload(
    payload: CompleteUploadRequest,
    serverPublicOrigin: string
  ): CompleteUploadResponse {
    const pending = this.pendingUploads.get(payload.fileKey)

    if (!pending) {
      throw new Error("업로드 세션을 찾을 수 없습니다.")
    }

    if (pending.completeToken !== payload.completeToken) {
      throw new Error("유효하지 않은 완료 토큰입니다.")
    }

    if (!pending.uploadedData) {
      throw new Error("업로드된 파일이 없습니다.")
    }

    const existingImageId = this.fileKeyToImageId.get(payload.fileKey)
    if (existingImageId) {
      return {
        imageId: existingImageId,
        url: new URL(
          `/api/mock/uploads/file/${encodeURIComponent(existingImageId)}`,
          serverPublicOrigin
        ).toString(),
      }
    }

    const imageId = `img_${randomUUID()}`

    this.images.set(imageId, {
      imageId,
      fileKey: payload.fileKey,
      mimeType: pending.uploadedMimeType ?? pending.mimeType,
      bytes: pending.uploadedData,
      createdAt: this.nowIso(),
    })

    this.fileKeyToImageId.set(payload.fileKey, imageId)

    return {
      imageId,
      url: new URL(
        `/api/mock/uploads/file/${encodeURIComponent(imageId)}`,
        serverPublicOrigin
      ).toString(),
    }
  }

  getImageById(imageId: string): StoredImage | undefined {
    const image = this.images.get(imageId)

    if (!image) {
      return undefined
    }

    return {
      imageId: image.imageId,
      mimeType: image.mimeType,
      bytes: image.bytes,
    }
  }
}
