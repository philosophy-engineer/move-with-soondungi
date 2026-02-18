import { z } from "zod";

const NODE_ENV_VALUES = ["development", "production", "test"] as const;

const requiredString = (key: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, `${key} 환경변수는 필수입니다.`),
  );

const urlString = (key: string) =>
  requiredString(key).refine((value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, `${key} 환경변수는 유효한 URL이어야 합니다.`);

const portSchema = requiredString("PORT")
  .transform((value) => Number(value))
  .refine((value) => Number.isInteger(value) && value > 0, "PORT 환경변수는 양의 정수여야 합니다.");

export const envSchema = z.looseObject({
  NODE_ENV: requiredString("NODE_ENV").refine(
    (value) => NODE_ENV_VALUES.includes(value as (typeof NODE_ENV_VALUES)[number]),
    "NODE_ENV 환경변수는 development, production, test 중 하나여야 합니다.",
  ),
  PORT: portSchema,
  WEB_ORIGIN: urlString("WEB_ORIGIN"),
  SERVER_PUBLIC_ORIGIN: urlString("SERVER_PUBLIC_ORIGIN"),
});

export function validateEnv(raw: Record<string, unknown>) {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`환경변수 검증 실패: ${details}`);
  }

  return parsed.data;
}
