import type { z } from "zod";

import { ALLOWED_IMAGE_MIME_TYPES } from "./constants.js";
import type {
  draftPostRequestSchema,
  jsonContentSchema,
  listPublicPostsQuerySchema,
  listPublicPostsResponseSchema,
  listPostsResponseSchema,
  getPublicPostDetailResponseSchema,
  postSlugParamSchema,
  postFeedItemSchema,
  postSaveResponseSchema,
  postStatusSchema,
  postSummarySchema,
  publicPostDetailSchema,
  publishPostRequestSchema,
} from "./schemas.js";

export type PostStatus = z.infer<typeof postStatusSchema>;
export type JsonContent = z.infer<typeof jsonContentSchema>;

export type DraftPostRequest = z.infer<typeof draftPostRequestSchema>;
export type PublishPostRequest = z.infer<typeof publishPostRequestSchema>;
export type PostSaveResponse = z.infer<typeof postSaveResponseSchema>;
export type PostSummary = z.infer<typeof postSummarySchema>;
export type ListPostsResponse = z.infer<typeof listPostsResponseSchema>;
export type PostFeedItem = z.infer<typeof postFeedItemSchema>;
export type ListPublicPostsQuery = z.infer<typeof listPublicPostsQuerySchema>;
export type ListPublicPostsResponse = z.infer<typeof listPublicPostsResponseSchema>;
export type PostSlugParam = z.infer<typeof postSlugParamSchema>;
export type PublicPostDetail = z.infer<typeof publicPostDetailSchema>;
export type GetPublicPostDetailResponse = z.infer<typeof getPublicPostDetailResponseSchema>;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
