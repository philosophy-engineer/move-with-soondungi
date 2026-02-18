import { z } from "zod";

export const opaqueCursorSchema = z.string().min(1);

export const cursorPageQuerySchema = z.object({
  cursor: opaqueCursorSchema.optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

export function cursorPageResponseSchema<TSchema extends z.ZodType>(itemSchema: TSchema) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
}
