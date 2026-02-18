import { UploadSession } from "../entities/upload-session.entity.js";
import { UploadedImage } from "../entities/uploaded-image.entity.js";
import { UploadSessionOrmEntity } from "./typeorm/entities/upload-session.orm-entity.js";
import { UploadedImageOrmEntity } from "./typeorm/entities/uploaded-image.orm-entity.js";

export function toDomainUploadSession(ormEntity: UploadSessionOrmEntity): UploadSession {
  return UploadSession.rehydrate({
    fileKey: ormEntity.fileKey,
    objectKey: ormEntity.objectKey,
    filename: ormEntity.filename,
    mimeType: ormEntity.mimeType,
    size: ormEntity.size,
    completeToken: ormEntity.completeToken,
    expiresAtMs: ormEntity.expiresAt.getTime(),
  });
}

export function toUploadSessionOrmEntity(domainEntity: UploadSession): UploadSessionOrmEntity {
  const ormEntity = new UploadSessionOrmEntity();

  ormEntity.fileKey = domainEntity.fileKey;
  ormEntity.objectKey = domainEntity.objectKey;
  ormEntity.filename = domainEntity.filename;
  ormEntity.mimeType = domainEntity.mimeType;
  ormEntity.size = domainEntity.size;
  ormEntity.completeToken = domainEntity.completeToken;
  ormEntity.expiresAt = new Date(domainEntity.expiresAtMs);

  return ormEntity;
}

export function toDomainUploadedImage(ormEntity: UploadedImageOrmEntity): UploadedImage {
  return UploadedImage.rehydrate({
    imageId: ormEntity.id,
    fileKey: ormEntity.fileKey,
    objectKey: ormEntity.objectKey,
    mimeType: ormEntity.mimeType,
    createdAt: ormEntity.createdAt.toISOString(),
  });
}

export function toUploadedImageOrmEntity(domainEntity: UploadedImage): UploadedImageOrmEntity {
  const ormEntity = new UploadedImageOrmEntity();

  if (domainEntity.imageId) {
    ormEntity.id = domainEntity.imageId;
  }

  ormEntity.fileKey = domainEntity.fileKey;
  ormEntity.objectKey = domainEntity.objectKey;
  ormEntity.mimeType = domainEntity.mimeType;

  if (domainEntity.createdAt) {
    ormEntity.createdAt = new Date(domainEntity.createdAt);
  }

  return ormEntity;
}
