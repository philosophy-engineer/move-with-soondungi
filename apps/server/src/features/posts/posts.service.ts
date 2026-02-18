import { Inject, Injectable } from "@nestjs/common"
import type {
  DraftPostRequest,
  PostSaveResponse,
  PostSummary,
  PublishPostRequest,
} from "@workspace/shared/blog"
import { hasMeaningfulBody } from "@workspace/shared/blog"

import {
  POSTS_REPOSITORY,
  type PostsRepository,
} from "./repositories/posts.repository.js"

@Injectable()
export class PostsService {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: PostsRepository
  ) {}

  listPostSummaries(): PostSummary[] {
    return this.postsRepository.listPostSummaries()
  }

  saveDraftPost(payload: DraftPostRequest): PostSaveResponse {
    const title = payload.title.trim()

    if (!title) {
      throw new Error("제목은 필수입니다.")
    }

    return this.postsRepository.saveDraftPost({
      ...payload,
      title,
    })
  }

  publishPost(payload: PublishPostRequest): PostSaveResponse {
    const title = payload.title.trim()

    if (!title) {
      throw new Error("제목은 필수입니다.")
    }

    if (!hasMeaningfulBody(payload.contentHtml, payload.contentJson)) {
      throw new Error("발행하려면 본문 내용을 입력해주세요.")
    }

    return this.postsRepository.publishPost({
      ...payload,
      title,
    })
  }
}
