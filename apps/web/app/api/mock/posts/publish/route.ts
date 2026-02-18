import { NextResponse } from "next/server"

import {
  hasMeaningfulBody,
  type PublishPostRequest,
} from "@/lib/blog-types"
import { publishPost, waitMockDelay } from "@/lib/mock-store"

export async function POST(request: Request) {
  await waitMockDelay()

  const payload = (await request.json()) as PublishPostRequest

  if (!payload?.title?.trim()) {
    return NextResponse.json(
      { message: "제목은 필수입니다." },
      { status: 400 }
    )
  }

  if (!hasMeaningfulBody(payload.contentHtml, payload.contentJson)) {
    return NextResponse.json(
      { message: "발행하려면 본문 내용을 입력해주세요." },
      { status: 400 }
    )
  }

  const result = publishPost({
    ...payload,
    title: payload.title.trim(),
  })

  return NextResponse.json(result)
}
