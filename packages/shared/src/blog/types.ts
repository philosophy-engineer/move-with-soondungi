import type { z } from "zod"

import type {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
  draftPostRequestSchema,
  jsonContentSchema,
  listPostsResponseSchema,
  postSaveResponseSchema,
  postStatusSchema,
  postSummarySchema,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
  publishPostRequestSchema,
} from "./schemas.js"

export type PostStatus = z.infer<typeof postStatusSchema>
export type JsonContent = z.infer<typeof jsonContentSchema>

export type DraftPostRequest = z.infer<typeof draftPostRequestSchema>
export type PublishPostRequest = z.infer<typeof publishPostRequestSchema>
export type PostSaveResponse = z.infer<typeof postSaveResponseSchema>
export type PostSummary = z.infer<typeof postSummarySchema>
export type ListPostsResponse = z.infer<typeof listPostsResponseSchema>

export type PresignUploadRequest = z.infer<typeof presignUploadRequestSchema>
export type PresignUploadResponse = z.infer<typeof presignUploadResponseSchema>
export type CompleteUploadRequest = z.infer<typeof completeUploadRequestSchema>
export type CompleteUploadResponse = z.infer<typeof completeUploadResponseSchema>

export type AllowedImageMimeType = PresignUploadRequest["mimeType"]
