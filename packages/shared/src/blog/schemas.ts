import { z } from "zod"

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
      attrs: z.record(z.string(), z.unknown()).optional(),
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
