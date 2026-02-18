import type { z } from "zod";

import type { envSchema } from "./env.schema.js";

export type AppEnv = z.infer<typeof envSchema>;

export const ENV_KEYS = {
  NODE_ENV: "NODE_ENV",
  PORT: "PORT",
  WEB_ORIGIN: "WEB_ORIGIN",
  SERVER_PUBLIC_ORIGIN: "SERVER_PUBLIC_ORIGIN",
} as const;
