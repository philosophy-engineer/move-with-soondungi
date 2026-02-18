import type {
  DraftPostRequest,
  PostSaveResponse,
  PostSummary,
  PublishPostRequest,
} from "@workspace/shared/blog"

export const POSTS_REPOSITORY = Symbol("POSTS_REPOSITORY")

export interface PostsRepository {
  saveDraftPost(payload: DraftPostRequest): PostSaveResponse
  publishPost(payload: PublishPostRequest): PostSaveResponse
  listPostSummaries(): PostSummary[]
}
