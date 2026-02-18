import type { UploadSession } from "../entities/upload-session.entity.js";
import type { UploadedImage } from "../entities/uploaded-image.entity.js";

export const UPLOADS_REPOSITORY = Symbol("UPLOADS_REPOSITORY");

export interface UploadsRepository {
  saveSession(session: UploadSession): Promise<UploadSession>;
  findSessionByFileKey(fileKey: string): Promise<UploadSession | undefined>;
  saveImage(image: UploadedImage): Promise<UploadedImage>;
  findImageById(imageId: string): Promise<UploadedImage | undefined>;
  findImageIdByFileKey(fileKey: string): Promise<string | undefined>;
  saveImageLink(fileKey: string, imageId: string): Promise<void>;
}
