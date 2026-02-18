import { randomUUID } from "node:crypto"

import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
  DraftPostRequest,
  JsonContent,
  PostSaveResponse,
  PostSummary,
  PresignUploadRequest,
  PresignUploadResponse,
  PublishPostRequest,
} from "@/lib/blog-types"

type StoredPost = {
  postId: string
  title: string
  contentHtml: string
  contentJson: JsonContent
  status: "DRAFT" | "PUBLISHED"
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

type PendingUpload = {
  fileKey: string
  filename: string
  mimeType: string
  size: number
  completeToken: string
  expiresAtMs: number
  uploadedData?: ArrayBuffer
  uploadedMimeType?: string
}

type StoredImage = {
  imageId: string
  fileKey: string
  mimeType: string
  bytes: ArrayBuffer
  createdAt: string
}

type MockStore = {
  posts: Map<string, StoredPost>
  pendingUploads: Map<string, PendingUpload>
  images: Map<string, StoredImage>
  fileKeyToImageId: Map<string, string>
}

declare global {
  // eslint-disable-next-line no-var
  var __SOONDUNGI_MOCK_STORE__: MockStore | undefined
}

function createStore(): MockStore {
  return {
    posts: new Map(),
    pendingUploads: new Map(),
    images: new Map(),
    fileKeyToImageId: new Map(),
  }
}

function getStore(): MockStore {
  if (!globalThis.__SOONDUNGI_MOCK_STORE__) {
    globalThis.__SOONDUNGI_MOCK_STORE__ = createStore()
  }

  return globalThis.__SOONDUNGI_MOCK_STORE__
}

function nowIso(): string {
  return new Date().toISOString()
}

export async function waitMockDelay(minMs = 200, maxMs = 400) {
  const delayMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  await new Promise((resolve) => setTimeout(resolve, delayMs))
}

export function createPresignedUpload(
  payload: PresignUploadRequest
): PresignUploadResponse {
  const store = getStore()

  const fileKey = `file_${randomUUID()}`
  const completeToken = `token_${randomUUID()}`
  const expiresAtMs = Date.now() + 10 * 60 * 1000
  const expiresAt = new Date(expiresAtMs).toISOString()

  store.pendingUploads.set(fileKey, {
    fileKey,
    filename: payload.filename,
    mimeType: payload.mimeType,
    size: payload.size,
    completeToken,
    expiresAtMs,
  })

  return {
    fileKey,
    uploadUrl: `/api/mock/uploads/blob/${encodeURIComponent(fileKey)}?token=${encodeURIComponent(completeToken)}`,
    completeToken,
    expiresAt,
  }
}

export function saveUploadBlob({
  fileKey,
  token,
  data,
  contentType,
}: {
  fileKey: string
  token: string
  data: ArrayBuffer
  contentType?: string
}) {
  const store = getStore()
  const pending = store.pendingUploads.get(fileKey)

  if (!pending) {
    throw new Error("업로드 세션을 찾을 수 없습니다.")
  }

  if (pending.completeToken !== token) {
    throw new Error("유효하지 않은 업로드 토큰입니다.")
  }

  if (pending.expiresAtMs < Date.now()) {
    throw new Error("업로드 세션이 만료되었습니다.")
  }

  pending.uploadedData = data.slice(0)
  pending.uploadedMimeType = contentType ?? pending.mimeType
  store.pendingUploads.set(fileKey, pending)
}

export function completeUpload(
  payload: CompleteUploadRequest
): CompleteUploadResponse {
  const store = getStore()
  const pending = store.pendingUploads.get(payload.fileKey)

  if (!pending) {
    throw new Error("업로드 세션을 찾을 수 없습니다.")
  }

  if (pending.completeToken !== payload.completeToken) {
    throw new Error("유효하지 않은 완료 토큰입니다.")
  }

  if (!pending.uploadedData) {
    throw new Error("업로드된 파일이 없습니다.")
  }

  const existingImageId = store.fileKeyToImageId.get(payload.fileKey)
  if (existingImageId) {
    return {
      imageId: existingImageId,
      url: `/api/mock/uploads/file/${encodeURIComponent(existingImageId)}`,
    }
  }

  const imageId = `img_${randomUUID()}`

  store.images.set(imageId, {
    imageId,
    fileKey: payload.fileKey,
    mimeType: pending.uploadedMimeType ?? pending.mimeType,
    bytes: pending.uploadedData,
    createdAt: nowIso(),
  })

  store.fileKeyToImageId.set(payload.fileKey, imageId)

  return {
    imageId,
    url: `/api/mock/uploads/file/${encodeURIComponent(imageId)}`,
  }
}

export function getImageById(imageId: string): StoredImage | undefined {
  const store = getStore()
  return store.images.get(imageId)
}

function upsertPost({
  payload,
  status,
}: {
  payload: DraftPostRequest | PublishPostRequest
  status: "DRAFT" | "PUBLISHED"
}): PostSaveResponse {
  const store = getStore()
  const existing = payload.postId ? store.posts.get(payload.postId) : undefined

  const postId = existing?.postId ?? payload.postId ?? `post_${randomUUID()}`
  const createdAt = existing?.createdAt ?? nowIso()
  const updatedAt = nowIso()
  const publishedAt =
    status === "PUBLISHED" ? existing?.publishedAt ?? updatedAt : undefined

  store.posts.set(postId, {
    postId,
    title: payload.title,
    contentHtml: payload.contentHtml,
    contentJson: payload.contentJson,
    status,
    createdAt,
    updatedAt,
    publishedAt,
  })

  return {
    postId,
    status,
    updatedAt,
    publishedAt,
  }
}

export function saveDraftPost(payload: DraftPostRequest): PostSaveResponse {
  return upsertPost({ payload, status: "DRAFT" })
}

export function publishPost(payload: PublishPostRequest): PostSaveResponse {
  return upsertPost({ payload, status: "PUBLISHED" })
}

export function listPostSummaries(): PostSummary[] {
  const store = getStore()

  return [...store.posts.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((post) => ({
      postId: post.postId,
      title: post.title,
      status: post.status,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    }))
}
