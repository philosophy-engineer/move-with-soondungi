import { NextResponse } from "next/server"

import { listPostsResponseSchema } from "@workspace/shared/blog"

import {
  listPostSummaries,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"

export async function GET() {
  await waitMockDelay()

  const payload = listPostsResponseSchema.parse({
    items: listPostSummaries(),
  })

  return NextResponse.json(payload)
}
