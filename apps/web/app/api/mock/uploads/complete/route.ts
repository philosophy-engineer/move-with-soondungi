import { NextResponse } from "next/server"

import type { CompleteUploadRequest } from "@/lib/blog-types"
import { completeUpload, waitMockDelay } from "@/lib/mock-store"

export async function POST(request: Request) {
  await waitMockDelay()

  const payload = (await request.json()) as CompleteUploadRequest

  if (!payload?.fileKey || !payload?.completeToken) {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    )
  }

  try {
    const result = completeUpload(payload)
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업로드 완료 처리 중 오류가 발생했습니다."

    return NextResponse.json({ message }, { status: 400 })
  }
}
