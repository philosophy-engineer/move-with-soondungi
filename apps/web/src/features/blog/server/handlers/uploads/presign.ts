import { NextResponse } from "next/server"

import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
} from "@workspace/shared/blog"

import {
  createPresignedUpload,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { errorResponse, handleRouteError } from "@/src/features/blog/server/handlers/utils"

export async function POST(request: Request) {
  await waitMockDelay()

  try {
    const raw = (await request.json()) as unknown
    const parsed = presignUploadRequestSchema.safeParse(raw)

    if (!parsed.success) {
      const payload = raw as {
        mimeType?: unknown
        size?: unknown
      }

      if (
        typeof payload.mimeType === "string" &&
        !ALLOWED_IMAGE_MIME_TYPES.includes(payload.mimeType as AllowedImageMimeType)
      ) {
        return errorResponse("jpg/png/webp 형식만 업로드할 수 있습니다.", 400)
      }

      if (
        typeof payload.size === "number" &&
        (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES)
      ) {
        return errorResponse("이미지 용량은 10MB 이하여야 합니다.", 400)
      }

      return errorResponse("잘못된 요청입니다.", 400)
    }

    const payload = parsed.data

    if (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES) {
      return errorResponse("이미지 용량은 10MB 이하여야 합니다.", 400)
    }

    const result = createPresignedUpload(payload)
    return NextResponse.json(presignUploadResponseSchema.parse(result))
  } catch (error) {
    return handleRouteError(error)
  }
}
