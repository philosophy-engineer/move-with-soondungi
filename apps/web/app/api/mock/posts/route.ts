import { NextResponse } from "next/server"

import { listPostSummaries, waitMockDelay } from "@/lib/mock-store"

export async function GET() {
  await waitMockDelay()

  return NextResponse.json({
    items: listPostSummaries(),
  })
}
