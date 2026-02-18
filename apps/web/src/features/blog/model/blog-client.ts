import {
  listPostsResponseSchema,
  postSaveResponseSchema,
  type DraftPostRequest,
  type PublishPostRequest,
} from "@workspace/shared/blog"
import {
  completeUploadResponseSchema,
  presignUploadResponseSchema,
  type CompleteUploadRequest,
  type PresignUploadRequest,
} from "@workspace/shared/upload"

import { apiRoutes } from "@/src/shared/config/routes"
import { getJson, postJson } from "@/src/shared/lib/http"
import { readErrorMessage } from "@/src/shared/lib/response"

export function fetchPosts() {
  return getJson(apiRoutes.mockPosts, listPostsResponseSchema)
}

export function saveDraft(payload: DraftPostRequest) {
  return postJson(apiRoutes.mockPostsDraft, payload, postSaveResponseSchema)
}

export function publishPost(payload: PublishPostRequest) {
  return postJson(apiRoutes.mockPostsPublish, payload, postSaveResponseSchema)
}

export function createUploadPresign(payload: PresignUploadRequest) {
  return postJson(
    apiRoutes.mockUploadsPresign,
    payload,
    presignUploadResponseSchema
  )
}

export async function uploadBlob(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "content-type": file.type,
    },
    body: file,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
}

export function completeUpload(payload: CompleteUploadRequest) {
  return postJson(
    apiRoutes.mockUploadsComplete,
    payload,
    completeUploadResponseSchema
  )
}
