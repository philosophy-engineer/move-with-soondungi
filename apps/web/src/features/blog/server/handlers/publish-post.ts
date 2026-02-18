import { NextResponse } from "next/server"

import {
  hasMeaningfulBody,
  postSaveResponseSchema,
  publishPostRequestSchema,
} from "@workspace/shared/blog"

import {
  publishPost,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { errorResponse, handleRouteError } from "@/src/features/blog/server/handlers/utils"

export async function POST(request: Request) {
  await waitMockDelay()

  try {
    const raw = (await request.json()) as unknown
    const payload = publishPostRequestSchema.parse(raw)

    if (!payload.title.trim()) {
      return errorResponse("제목은 필수입니다.", 400)
    }

    if (!hasMeaningfulBody(payload.contentHtml, payload.contentJson)) {
      return errorResponse("발행하려면 본문 내용을 입력해주세요.", 400)
    }

    const result = publishPost({
      ...payload,
      title: payload.title.trim(),
    })

    return NextResponse.json(postSaveResponseSchema.parse(result))
  } catch (error) {
    return handleRouteError(error)
  }
}
