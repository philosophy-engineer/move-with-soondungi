import { z } from "zod";
import {
  cursorPageQuerySchema,
  cursorPageResponseSchema,
} from "../common/pagination/cursor/schemas.js";

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

export const listPublicPostsQuerySchema = cursorPageQuerySchema;

export const listPublicPostsResponseSchema = cursorPageResponseSchema(postFeedItemSchema);

export const postSlugParamSchema = z.object({
  slug: z.string().trim().min(1),
});

export const publicPostDetailSchema = z.object({
  postId: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().nullable(),
  contentHtml: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string(),
});

export const getPublicPostDetailResponseSchema = publicPostDetailSchema;
