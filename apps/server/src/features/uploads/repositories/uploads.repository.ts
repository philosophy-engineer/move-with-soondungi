import type { UploadSession } from "../entities/upload-session.entity.js";
import type { UploadedImage } from "../entities/uploaded-image.entity.js";

export const UPLOADS_REPOSITORY = Symbol("UPLOADS_REPOSITORY");

export interface UploadsRepository {
  saveSession(session: UploadSession): UploadSession;
  findSessionByFileKey(fileKey: string): UploadSession | undefined;
  saveImage(image: UploadedImage): UploadedImage;
  findImageById(imageId: string): UploadedImage | undefined;
  findImageIdByFileKey(fileKey: string): string | undefined;
  saveImageLink(fileKey: string, imageId: string): void;
}
