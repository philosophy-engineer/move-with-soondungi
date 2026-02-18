import type { z } from "zod";

import type {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
} from "./schemas.js";

export type PresignUploadRequest = z.infer<typeof presignUploadRequestSchema>;
export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>;
export type CompleteUploadRequest = z.infer<typeof completeUploadRequestSchema>;
export type CompleteUploadResponse = z.infer<typeof completeUploadResponseSchema>;
