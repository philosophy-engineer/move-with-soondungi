import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@workspace/shared/upload"

export const UPLOADS_REPOSITORY = Symbol("UPLOADS_REPOSITORY")

export type StoredImage = {
  imageId: string
  mimeType: string
  bytes: ArrayBuffer
}

export interface UploadsRepository {
  createPresignedUpload(
    payload: PresignUploadRequest,
    serverPublicOrigin: string
  ): PresignUploadResponse
  saveUploadBlob(params: {
    fileKey: string
    token: string
    data: ArrayBuffer
    contentType?: string
  }): void
  completeUpload(
    payload: CompleteUploadRequest,
    serverPublicOrigin: string
  ): CompleteUploadResponse
  getImageById(imageId: string): StoredImage | undefined
}
