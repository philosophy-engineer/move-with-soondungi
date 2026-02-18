import {
  saveUploadBlob,
  waitMockDelay,
} from "@/src/features/blog/server/store/mock-store"
import { errorResponse } from "@/src/features/blog/server/handlers/utils"

type UploadBlobRouteContext = {
  params: Promise<{
    fileKey: string
  }>
}

export async function PUT(request: Request, { params }: UploadBlobRouteContext) {
  await waitMockDelay()

  const { fileKey } = await params
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    return errorResponse("업로드 토큰이 필요합니다.", 400)
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

    return errorResponse(message, 400)
  }
}
