import { NextResponse } from "next/server"

import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
  type PresignUploadRequest,
} from "@/lib/blog-types"
import { createPresignedUpload, waitMockDelay } from "@/lib/mock-store"

export async function POST(request: Request) {
  await waitMockDelay()

  const payload = (await request.json()) as PresignUploadRequest
  const mimeType = payload?.mimeType
  const size = payload?.size
  const filename = payload?.filename

  if (!filename || !mimeType || typeof size !== "number") {
    return NextResponse.json(
      { message: "잘못된 요청입니다." },
      { status: 400 }
    )
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType)) {
    return NextResponse.json(
      { message: "jpg/png/webp 형식만 업로드할 수 있습니다." },
      { status: 400 }
    )
  }

  if (size <= 0 || size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { message: "이미지 용량은 10MB 이하여야 합니다." },
      { status: 400 }
    )
  }

  const result = createPresignedUpload({ filename, mimeType, size })
  return NextResponse.json(result)
}
