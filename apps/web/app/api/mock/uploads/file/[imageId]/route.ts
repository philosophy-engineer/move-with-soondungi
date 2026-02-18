import { NextResponse } from "next/server"

import { getImageById } from "@/lib/mock-store"

type Params = {
  params: {
    imageId: string
  }
}

export async function GET(_request: Request, { params }: Params) {
  const { imageId } = params
  const image = getImageById(imageId)

  if (!image) {
    return NextResponse.json(
      { message: "이미지를 찾을 수 없습니다." },
      { status: 404 }
    )
  }

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "content-type": image.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
