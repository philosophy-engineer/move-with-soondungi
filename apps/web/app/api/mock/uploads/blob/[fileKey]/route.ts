import { NextResponse } from "next/server"

import { saveUploadBlob, waitMockDelay } from "@/lib/mock-store"

type Params = {
  params: {
    fileKey: string
  }
}

export async function PUT(request: Request, { params }: Params) {
  await waitMockDelay()

  const { fileKey } = params
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { message: "업로드 토큰이 필요합니다." },
      { status: 400 }
    )
  }

  try {
    const data = await request.arrayBuffer()
    saveUploadBlob({
      fileKey,
      token,
      data,
      contentType: request.headers.get("content-type") ?? undefined,
    })

    return new Response(null, { status: 204 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업로드 처리 중 오류가 발생했습니다."

    return NextResponse.json({ message }, { status: 400 })
  }
}
