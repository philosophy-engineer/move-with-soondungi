import { z } from "zod";

export const presignUploadRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const presignUploadResponseSchema = z.object({
  fileKey: z.string(),
  uploadUrl: z.string(),
  completeToken: z.string(),
  expiresAt: z.string(),
});

export const completeUploadRequestSchema = z.object({
  fileKey: z.string(),
  completeToken: z.string(),
});

export const completeUploadResponseSchema = z.object({
  imageId: z.string(),
  url: z.string(),
});
