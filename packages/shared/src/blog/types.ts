import type { z } from "zod";

import { ALLOWED_IMAGE_MIME_TYPES } from "./constants.js";
import type {
  draftPostRequestSchema,
  jsonContentSchema,
  listPostsResponseSchema,
  postSaveResponseSchema,
  postStatusSchema,
  postSummarySchema,
  publishPostRequestSchema,
} from "./schemas.js";

export type PostStatus = z.infer<typeof postStatusSchema>;
export type JsonContent = z.infer<typeof jsonContentSchema>;

export type DraftPostRequest = z.infer<typeof draftPostRequestSchema>;
export type PublishPostRequest = z.infer<typeof publishPostRequestSchema>;
export type PostSaveResponse = z.infer<typeof postSaveResponseSchema>;
export type PostSummary = z.infer<typeof postSummarySchema>;
export type ListPostsResponse = z.infer<typeof listPostsResponseSchema>;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
