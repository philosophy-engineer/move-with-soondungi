import type { z } from "zod";

import type { cursorPageQuerySchema } from "./schemas.js";

export type CursorPageQuery = z.infer<typeof cursorPageQuerySchema>;

export type CursorPageResponse<TItem> = {
  items: TItem[];
  nextCursor: string | null;
};
