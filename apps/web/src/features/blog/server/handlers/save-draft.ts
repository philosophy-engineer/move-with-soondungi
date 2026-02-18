import { NextResponse } from "next/server"

import {
  draftPostRequestSchema,
  postSaveResponseSchema,
} from "@workspace/shared/blog"

import {
  saveDraftPost,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { errorResponse, handleRouteError } from "@/src/features/blog/server/handlers/utils"

export async function POST(request: Request) {
  await waitMockDelay()

  try {
    const raw = (await request.json()) as unknown
    const payload = draftPostRequestSchema.parse(raw)

    if (!payload.title.trim()) {
      return errorResponse("제목은 필수입니다.", 400)
    }

    const result = saveDraftPost({
      ...payload,
      title: payload.title.trim(),
    })

    return NextResponse.json(postSaveResponseSchema.parse(result))
  } catch (error) {
    return handleRouteError(error)
  }
}
