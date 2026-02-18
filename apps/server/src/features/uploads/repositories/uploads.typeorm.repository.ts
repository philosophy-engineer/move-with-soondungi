import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { UploadSession } from "../entities/upload-session.entity.js";
import type { UploadedImage } from "../entities/uploaded-image.entity.js";
import {
  toDomainUploadedImage,
  toDomainUploadSession,
  toUploadedImageOrmEntity,
  toUploadSessionOrmEntity,
} from "./uploads.typeorm.mapper.js";
import { UploadSessionOrmEntity } from "./typeorm/entities/upload-session.orm-entity.js";
import { UploadedImageOrmEntity } from "./typeorm/entities/uploaded-image.orm-entity.js";
import type { UploadsRepository } from "./uploads.repository.js";

@Injectable()
export class UploadsTypeormRepository implements UploadsRepository {
  constructor(
    @InjectRepository(UploadSessionOrmEntity)
    private readonly sessionsRepository: Repository<UploadSessionOrmEntity>,
    @InjectRepository(UploadedImageOrmEntity)
    private readonly imagesRepository: Repository<UploadedImageOrmEntity>,
  ) {}

  async saveSession(session: UploadSession): Promise<UploadSession> {
    const saved = await this.sessionsRepository.save(toUploadSessionOrmEntity(session));
    return toDomainUploadSession(saved);
  }

  async findSessionByFileKey(fileKey: string): Promise<UploadSession | undefined> {
    const found = await this.sessionsRepository.findOne({
      where: { fileKey },
    });

    if (!found) {
      return undefined;
    }

    return toDomainUploadSession(found);
  }

  async saveImage(image: UploadedImage): Promise<UploadedImage> {
    const saved = await this.imagesRepository.save(toUploadedImageOrmEntity(image));
    return toDomainUploadedImage(saved);
  }

  async findImageById(imageId: string): Promise<UploadedImage | undefined> {
    const found = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    if (!found) {
      return undefined;
    }

    return toDomainUploadedImage(found);
  }

  async findImageIdByFileKey(fileKey: string): Promise<string | undefined> {
    const found = await this.imagesRepository.findOne({
      select: { id: true },
      where: { fileKey },
    });

    return found?.id;
  }

  async saveImageLink(fileKey: string, imageId: string): Promise<void> {
    void fileKey;
    void imageId;
    // uploaded_images.file_key unique 제약으로 fileKey->imageId 매핑을 대체한다.
  }
}
