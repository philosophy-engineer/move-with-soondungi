import { Injectable } from "@nestjs/common";

import type { UploadSession } from "../entities/upload-session.entity.js";
import type { UploadedImage } from "../entities/uploaded-image.entity.js";
import {
  type UploadSessionRecord,
  type UploadedImageRecord,
  toUploadSessionEntity,
  toUploadSessionRecord,
  toUploadedImageEntity,
  toUploadedImageRecord,
} from "./uploads.persistence.mapper.js";
import type { UploadsRepository } from "./uploads.repository.js";

@Injectable()
export class UploadsInMemoryRepository implements UploadsRepository {
  private readonly sessions = new Map<string, UploadSessionRecord>();
  private readonly images = new Map<string, UploadedImageRecord>();
  private readonly fileKeyToImageId = new Map<string, string>();

  async saveSession(session: UploadSession): Promise<UploadSession> {
    this.sessions.set(session.fileKey, toUploadSessionRecord(session));
    return session;
  }

  async findSessionByFileKey(fileKey: string): Promise<UploadSession | undefined> {
    const record = this.sessions.get(fileKey);

    if (!record) {
      return undefined;
    }

    return toUploadSessionEntity(record);
  }

  async saveImage(image: UploadedImage): Promise<UploadedImage> {
    if (!image.imageId) {
      throw new Error("imageId가 없는 이미지는 저장할 수 없습니다.");
    }

    this.images.set(image.imageId, toUploadedImageRecord(image));
    return image;
  }

  async findImageById(imageId: string): Promise<UploadedImage | undefined> {
    const record = this.images.get(imageId);

    if (!record) {
      return undefined;
    }

    return toUploadedImageEntity(record);
  }

  async findImageIdByFileKey(fileKey: string): Promise<string | undefined> {
    return this.fileKeyToImageId.get(fileKey);
  }

  async saveImageLink(fileKey: string, imageId: string): Promise<void> {
    this.fileKeyToImageId.set(fileKey, imageId);
  }
}
