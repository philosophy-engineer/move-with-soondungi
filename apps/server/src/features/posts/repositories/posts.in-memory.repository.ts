import { randomUUID } from "node:crypto"

import { Injectable } from "@nestjs/common"
import type {
  DraftPostRequest,
  JsonContent,
  PostSaveResponse,
  PostStatus,
  PostSummary,
  PublishPostRequest,
} from "@workspace/shared/blog"

import type { PostsRepository } from "./posts.repository.js"

type StoredPost = {
  postId: string
  title: string
  contentHtml: string
  contentJson: JsonContent
  status: PostStatus
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

@Injectable()
export class PostsInMemoryRepository implements PostsRepository {
  private readonly posts = new Map<string, StoredPost>()

  private nowIso() {
    return new Date().toISOString()
  }

  private upsertPost(params: {
    payload: DraftPostRequest | PublishPostRequest
    status: PostStatus
  }): PostSaveResponse {
    const existing = params.payload.postId
      ? this.posts.get(params.payload.postId)
      : undefined

    const postId =
      existing?.postId ?? params.payload.postId ?? `post_${randomUUID()}`
    const createdAt = existing?.createdAt ?? this.nowIso()
    const updatedAt = this.nowIso()
    const publishedAt =
      params.status === "PUBLISHED"
        ? existing?.publishedAt ?? updatedAt
        : undefined

    this.posts.set(postId, {
      postId,
      title: params.payload.title,
      contentHtml: params.payload.contentHtml,
      contentJson: params.payload.contentJson,
      status: params.status,
      createdAt,
      updatedAt,
      publishedAt,
    })

    return {
      postId,
      status: params.status,
      updatedAt,
      publishedAt,
    }
  }

  saveDraftPost(payload: DraftPostRequest): PostSaveResponse {
    return this.upsertPost({ payload, status: "DRAFT" })
  }

  publishPost(payload: PublishPostRequest): PostSaveResponse {
    return this.upsertPost({ payload, status: "PUBLISHED" })
  }

  listPostSummaries(): PostSummary[] {
    return [...this.posts.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((post) => ({
        postId: post.postId,
        title: post.title,
        status: post.status,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt,
      }))
  }
}
