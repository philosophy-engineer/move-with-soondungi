import { errorResponseSchema } from "@workspace/shared/common";

export async function readErrorMessage(
  response: Response,
  fallback = "요청 처리 중 오류가 발생했습니다.",
): Promise<string> {
  try {
    const raw = await response.json();
    const parsed = errorResponseSchema.safeParse(raw);

    if (parsed.success) {
      return parsed.data.message;
    }
  } catch {
    // no-op
  }

  return fallback;
}

export function toErrorMessage(
  error: unknown,
  fallback = "요청 처리 중 오류가 발생했습니다.",
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
