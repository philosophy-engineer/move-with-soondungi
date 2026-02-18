import {
  getImageById,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { errorResponse } from "@/src/features/blog/server/handlers/utils"

type GetFileRouteContext = {
  params: Promise<{
    imageId: string
  }>
}

export async function GET(_request: Request, { params }: GetFileRouteContext) {
  await waitMockDelay()

  const { imageId } = await params
  const image = getImageById(imageId)

  if (!image) {
    return errorResponse("이미지를 찾을 수 없습니다.", 404)
  }

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "content-type": image.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
