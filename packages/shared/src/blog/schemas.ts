import { z } from "zod"

import { ALLOWED_IMAGE_MIME_TYPES } from "./constants.js"

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"])

export const jsonContentSchema: z.ZodType<{
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: unknown[]
} & Record<string, unknown>> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      text: z.string().optional(),
      attrs: z.record(z.unknown()).optional(),
      content: z.array(jsonContentSchema).optional(),
    })
    .catchall(z.unknown())
)

const postPayloadSchema = z.object({
  postId: z.string().optional(),
  title: z.string(),
  contentHtml: z.string(),
  contentJson: jsonContentSchema,
})

export const draftPostRequestSchema = postPayloadSchema

export const publishPostRequestSchema = postPayloadSchema

export const postSaveResponseSchema = z.object({
  postId: z.string(),
  status: postStatusSchema,
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
})

export const postSummarySchema = z.object({
  postId: z.string(),
  title: z.string(),
  status: postStatusSchema,
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
})

export const listPostsResponseSchema = z.object({
  items: z.array(postSummarySchema),
})

export const presignUploadRequestSchema = z.object({
  filename: z.string(),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  size: z.number(),
})

export const presignUploadResponseSchema = z.object({
  fileKey: z.string(),
  uploadUrl: z.string(),
  completeToken: z.string(),
  expiresAt: z.string(),
})

export const completeUploadRequestSchema = z.object({
  fileKey: z.string(),
  completeToken: z.string(),
})

export const completeUploadResponseSchema = z.object({
  imageId: z.string(),
  url: z.string(),
})

export const errorResponseSchema = z.object({
  message: z.string(),
})
