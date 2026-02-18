import { opaqueCursorSchema } from "@workspace/shared/common";
import type { z } from "zod";

export function encodeOpaqueCursor<TPayload extends Record<string, unknown>>(
  payload: TPayload,
): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeOpaqueCursor<TSchema extends z.ZodType>(
  rawCursor: string,
  schema: TSchema,
): z.output<TSchema> | undefined {
  const safeCursor = opaqueCursorSchema.safeParse(rawCursor);

  if (!safeCursor.success) {
    return undefined;
  }

  try {
    const decoded = Buffer.from(safeCursor.data, "base64url").toString("utf-8");
    const rawPayload = JSON.parse(decoded) as unknown;
    const parsedPayload = schema.safeParse(rawPayload);

    if (!parsedPayload.success) {
      return undefined;
    }

    return parsedPayload.data;
  } catch {
    return undefined;
  }
}
