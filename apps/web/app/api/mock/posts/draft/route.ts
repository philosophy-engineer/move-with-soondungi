import { NextResponse } from "next/server"

import type { DraftPostRequest } from "@/lib/blog-types"
import { saveDraftPost, waitMockDelay } from "@/lib/mock-store"

export async function POST(request: Request) {
  await waitMockDelay()

  const payload = (await request.json()) as DraftPostRequest

  if (!payload?.title?.trim()) {
    return NextResponse.json(
      { message: "제목은 필수입니다." },
      { status: 400 }
    )
  }

  const result = saveDraftPost({
    ...payload,
    title: payload.title.trim(),
  })

  return NextResponse.json(result)
}
