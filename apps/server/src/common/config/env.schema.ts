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

const booleanString = (key: string) =>
  requiredString(key).transform((value, context) => {
    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    context.addIssue({
      code: "custom",
      message: `${key} 환경변수는 true 또는 false 여야 합니다.`,
    });

    return z.NEVER;
  });

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
  S3_ENDPOINT_URL: urlString("S3_ENDPOINT_URL"),
  S3_REGION: requiredString("S3_REGION"),
  S3_ACCESS_KEY_ID: requiredString("S3_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: requiredString("S3_SECRET_ACCESS_KEY"),
  S3_BUCKET: requiredString("S3_BUCKET"),
  S3_FORCE_PATH_STYLE: booleanString("S3_FORCE_PATH_STYLE"),
  S3_PUBLIC_BASE_URL: urlString("S3_PUBLIC_BASE_URL"),
  DB_HOST: requiredString("DB_HOST"),
  DB_PORT: requiredString("DB_PORT")
    .transform((value) => Number(value))
    .refine(
      (value) => Number.isInteger(value) && value > 0,
      "DB_PORT 환경변수는 양의 정수여야 합니다.",
    ),
  DB_USER: requiredString("DB_USER"),
  DB_PASSWORD: requiredString("DB_PASSWORD"),
  DB_NAME: requiredString("DB_NAME"),
});

export function validateEnv(raw: Record<string, unknown>) {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join("; ");
    throw new Error(`환경변수 검증 실패: ${details}`);
  }

  return parsed.data;
}
