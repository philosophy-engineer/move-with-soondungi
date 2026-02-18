import { createNanoId } from "../../../common/utils/nanoid.js";

const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const ID_LENGTH = 12;
const UPLOAD_OBJECT_PREFIX = "uploads";

function createDatePrefix(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export function createUploadFileKey(): string {
  return `file_${createDatePrefix()}_${createNanoId(ID_LENGTH, ID_ALPHABET)}`;
}

export function createUploadCompleteToken(): string {
  return `token_${createDatePrefix()}_${createNanoId(ID_LENGTH, ID_ALPHABET)}`;
}

export function createUploadedImageId(): string {
  return `img_${createDatePrefix()}_${createNanoId(ID_LENGTH, ID_ALPHABET)}`;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildUploadObjectKey(fileKey: string, filename: string): string {
  return `${UPLOAD_OBJECT_PREFIX}/${fileKey}_${sanitizeFilename(filename)}`;
}
