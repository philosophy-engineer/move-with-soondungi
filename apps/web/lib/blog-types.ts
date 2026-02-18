export type PostStatus = "DRAFT" | "PUBLISHED"

export type JsonContent = {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  content?: JsonContent[]
} & Record<string, unknown>

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number]

export interface DraftPostRequest {
  postId?: string
  title: string
  contentHtml: string
  contentJson: JsonContent
}

export interface PublishPostRequest {
  postId?: string
  title: string
  contentHtml: string
  contentJson: JsonContent
}

export interface PostSaveResponse {
  postId: string
  status: PostStatus
  updatedAt: string
  publishedAt?: string
}

export interface PostSummary {
  postId: string
  title: string
  status: PostStatus
  updatedAt: string
  publishedAt?: string
}

export interface PresignUploadRequest {
  filename: string
  mimeType: string
  size: number
}

export interface PresignUploadResponse {
  fileKey: string
  uploadUrl: string
  completeToken: string
  expiresAt: string
}

export interface CompleteUploadRequest {
  fileKey: string
  completeToken: string
}

export interface CompleteUploadResponse {
  imageId: string
  url: string
}

export function hasNodeType(node: unknown, type: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false
  }

  const typedNode = node as {
    type?: unknown
    content?: unknown
  }

  if (typedNode.type === type) {
    return true
  }

  if (!Array.isArray(typedNode.content)) {
    return false
  }

  return typedNode.content.some((child) => hasNodeType(child, type))
}

export function hasMeaningfulBody(
  contentHtml: string,
  contentJson: JsonContent
): boolean {
  const text = contentHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

  return text.length > 0 || hasNodeType(contentJson, "image")
}
