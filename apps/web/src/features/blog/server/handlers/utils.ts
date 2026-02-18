import { NextResponse } from "next/server"

import { errorResponseSchema } from "@workspace/shared/blog"
import { ZodError } from "zod"

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(errorResponseSchema.parse({ message }), { status })
}

export function handleRouteError(
  error: unknown,
  fallback = "요청 처리 중 오류가 발생했습니다."
) {
  if (error instanceof ZodError) {
    return errorResponse("잘못된 요청입니다.", 400)
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 400)
  }

  return errorResponse(fallback, 400)
}
