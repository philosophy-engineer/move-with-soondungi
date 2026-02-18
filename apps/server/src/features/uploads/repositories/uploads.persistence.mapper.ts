import { UploadSession } from "../entities/upload-session.entity.js";
import { UploadedImage } from "../entities/uploaded-image.entity.js";

export type UploadSessionRecord = {
  fileKey: string;
  objectKey: string;
  filename: string;
  mimeType: string;
  size: number;
  completeToken: string;
  expiresAtMs: number;
  uploadedData?: ArrayBuffer;
  uploadedMimeType?: string;
};

export type UploadedImageRecord = {
  imageId: string;
  fileKey: string;
  objectKey: string;
  mimeType: string;
  bytes?: ArrayBuffer;
  createdAt: string;
};

export function toUploadSessionRecord(entity: UploadSession): UploadSessionRecord {
  return {
    fileKey: entity.fileKey,
    objectKey: entity.objectKey,
    filename: entity.filename,
    mimeType: entity.mimeType,
    size: entity.size,
    completeToken: entity.completeToken,
    expiresAtMs: entity.expiresAtMs,
    uploadedData: entity.uploadedData,
    uploadedMimeType: entity.uploadedMimeType,
  };
}

export function toUploadSessionEntity(record: UploadSessionRecord): UploadSession {
  return UploadSession.rehydrate({
    fileKey: record.fileKey,
    objectKey: record.objectKey,
    filename: record.filename,
    mimeType: record.mimeType,
    size: record.size,
    completeToken: record.completeToken,
    expiresAtMs: record.expiresAtMs,
    uploadedData: record.uploadedData,
    uploadedMimeType: record.uploadedMimeType,
  });
}

export function toUploadedImageRecord(entity: UploadedImage): UploadedImageRecord {
  if (!entity.imageId) {
    throw new Error("imageId가 없는 이미지는 저장 레코드로 변환할 수 없습니다.");
  }

  return {
    imageId: entity.imageId,
    fileKey: entity.fileKey,
    objectKey: entity.objectKey,
    mimeType: entity.mimeType,
    bytes: entity.bytes,
    createdAt: entity.createdAt,
  };
}

export function toUploadedImageEntity(record: UploadedImageRecord): UploadedImage {
  return UploadedImage.rehydrate({
    imageId: record.imageId,
    fileKey: record.fileKey,
    objectKey: record.objectKey,
    mimeType: record.mimeType,
    bytes: record.bytes,
    createdAt: record.createdAt,
  });
}
