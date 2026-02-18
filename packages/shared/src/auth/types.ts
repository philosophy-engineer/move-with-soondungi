import type { z } from "zod";

import type {
  authLoginRequestSchema,
  authLoginResponseSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authUserSchema,
} from "./schemas.js";

export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>;
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;
export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>;
