import type { z } from "zod";

import type { errorResponseSchema } from "./schemas.js";

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
