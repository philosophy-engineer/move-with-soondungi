import { UploadSession } from "../entities/upload-session.entity.js";
import { UploadedImage } from "../entities/uploaded-image.entity.js";

export type UploadSessionRecord = {
  fileKey: string;
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
  mimeType: string;
  bytes: ArrayBuffer;
  createdAt: string;
};

export function toUploadSessionRecord(entity: UploadSession): UploadSessionRecord {
  return {
    fileKey: entity.fileKey,
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
  return new UploadSession({
    fileKey: record.fileKey,
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
  return {
    imageId: entity.imageId,
    fileKey: entity.fileKey,
    mimeType: entity.mimeType,
    bytes: entity.bytes,
    createdAt: entity.createdAt,
  };
}

export function toUploadedImageEntity(record: UploadedImageRecord): UploadedImage {
  return new UploadedImage({
    imageId: record.imageId,
    fileKey: record.fileKey,
    mimeType: record.mimeType,
    bytes: record.bytes,
    createdAt: record.createdAt,
  });
}
