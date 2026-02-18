import { Injectable } from "@nestjs/common"

import type { UploadSession } from "../entities/upload-session.entity.js"
import type { UploadedImage } from "../entities/uploaded-image.entity.js"
import {
  type UploadSessionRecord,
  type UploadedImageRecord,
  toUploadSessionEntity,
  toUploadSessionRecord,
  toUploadedImageEntity,
  toUploadedImageRecord,
} from "./uploads.persistence.mapper.js"
import type { UploadsRepository } from "./uploads.repository.js"

@Injectable()
export class UploadsInMemoryRepository implements UploadsRepository {
  private readonly sessions = new Map<string, UploadSessionRecord>()
  private readonly images = new Map<string, UploadedImageRecord>()
  private readonly fileKeyToImageId = new Map<string, string>()

  saveSession(session: UploadSession): UploadSession {
    this.sessions.set(session.fileKey, toUploadSessionRecord(session))
    return session
  }

  findSessionByFileKey(fileKey: string): UploadSession | undefined {
    const record = this.sessions.get(fileKey)

    if (!record) {
      return undefined
    }

    return toUploadSessionEntity(record)
  }

  saveImage(image: UploadedImage): UploadedImage {
    this.images.set(image.imageId, toUploadedImageRecord(image))
    return image
  }

  findImageById(imageId: string): UploadedImage | undefined {
    const record = this.images.get(imageId)

    if (!record) {
      return undefined
    }

    return toUploadedImageEntity(record)
  }

  findImageIdByFileKey(fileKey: string): string | undefined {
    return this.fileKeyToImageId.get(fileKey)
  }

  saveImageLink(fileKey: string, imageId: string): void {
    this.fileKeyToImageId.set(fileKey, imageId)
  }
}
