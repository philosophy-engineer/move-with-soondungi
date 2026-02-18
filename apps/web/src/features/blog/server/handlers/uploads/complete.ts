import { NextResponse } from "next/server"

import {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
} from "@workspace/shared/blog"

import {
  completeUpload,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { handleRouteError } from "@/src/features/blog/server/handlers/utils"

export async function POST(request: Request) {
  await waitMockDelay()

  try {
    const raw = (await request.json()) as unknown
    const payload = completeUploadRequestSchema.parse(raw)
    const result = completeUpload(payload)

    return NextResponse.json(completeUploadResponseSchema.parse(result))
  } catch (error) {
    return handleRouteError(error, "업로드 완료 처리 중 오류가 발생했습니다.")
  }
}
