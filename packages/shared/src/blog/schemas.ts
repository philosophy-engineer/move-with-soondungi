import { z } from "zod";

export const postStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const jsonContentSchema: z.ZodType<
  {
    type?: string;
    text?: string;
    attrs?: Record<string, unknown>;
    content?: unknown[];
  } & Record<string, unknown>
> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      text: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(jsonContentSchema).optional(),
    })
    .catchall(z.unknown()),
);

const postPayloadSchema = z.object({
  postId: z.string().optional(),
  title: z.string(),
  contentHtml: z.string(),
  contentJson: jsonContentSchema,
});

export const draftPostRequestSchema = postPayloadSchema;

export const publishPostRequestSchema = postPayloadSchema;

export const postSaveResponseSchema = z.object({
  postId: z.string(),
  status: postStatusSchema,
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export const postSummarySchema = z.object({
  postId: z.string(),
  title: z.string(),
  status: postStatusSchema,
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
});

export const listPostsResponseSchema = z.object({
  items: z.array(postSummarySchema),
});

export const postFeedItemSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().nullable(),
  publishedAt: z.string(),
});

export const listPublicPostsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

export const listPublicPostsResponseSchema = z.object({
  items: z.array(postFeedItemSchema),
  nextCursor: z.string().nullable(),
});
