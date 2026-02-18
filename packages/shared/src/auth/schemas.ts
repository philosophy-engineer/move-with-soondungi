import { z } from "zod";

export const authLoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const authUserSchema = z.object({
  userId: z.string(),
  email: z.email(),
});

export const authLoginResponseSchema = authUserSchema;

export const authMeResponseSchema = authUserSchema;

export const authLogoutResponseSchema = z.object({});
