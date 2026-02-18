import { Inject, Injectable } from "@nestjs/common"
import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  PresignUploadRequest,
  PresignUploadResponse,
} from "@workspace/shared/upload"

import {
  UPLOADS_REPOSITORY,
  type StoredImage,
  type UploadsRepository,
} from "./repositories/uploads.repository.js"

@Injectable()
export class UploadsService {
  constructor(
    @Inject(UPLOADS_REPOSITORY)
    private readonly uploadsRepository: UploadsRepository
  ) {}

  createPresignedUpload(payload: PresignUploadRequest): PresignUploadResponse {
    return this.uploadsRepository.createPresignedUpload(
      payload,
      this.getServerPublicOrigin()
    )
  }

  saveUploadBlob(params: {
    fileKey: string
    token: string
    data: ArrayBuffer
    contentType?: string
  }) {
    this.uploadsRepository.saveUploadBlob(params)
  }

  completeUpload(payload: CompleteUploadRequest): CompleteUploadResponse {
    return this.uploadsRepository.completeUpload(
      payload,
      this.getServerPublicOrigin()
    )
  }

  getImageById(imageId: string): StoredImage | undefined {
    return this.uploadsRepository.getImageById(imageId)
  }

  private getServerPublicOrigin(): string {
    const origin = process.env.SERVER_PUBLIC_ORIGIN?.trim()

    if (!origin) {
      throw new Error("SERVER_PUBLIC_ORIGIN 환경변수를 찾을 수 없습니다.")
    }

    return origin
  }
}
