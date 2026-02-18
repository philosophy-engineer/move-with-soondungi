import { randomUUID } from "node:crypto";

import { Inject, Injectable } from "@nestjs/common";
import {
  hasMeaningfulBody,
  type DraftPostRequest,
  type PostSaveResponse,
  type PostSummary,
  type PublishPostRequest,
} from "@workspace/shared/blog";

import { throwBadRequest } from "../../../common/errors/error-response.js";
import { Post, type PostStatus } from "../entities/post.entity.js";
import { POSTS_REPOSITORY, type PostsRepository } from "../repositories/posts.repository.js";

@Injectable()
export class PostsService {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: PostsRepository,
  ) {}

  listPostSummaries(): PostSummary[] {
    return this.postsRepository
      .findAll()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((post) => this.toPostSummary(post));
  }

  saveDraftPost(payload: DraftPostRequest): PostSaveResponse {
    const title = payload.title.trim();

    if (!title) {
      throwBadRequest("제목은 필수입니다.");
    }

    return this.savePost({
      postId: payload.postId,
      title,
      contentHtml: payload.contentHtml,
      contentJson: payload.contentJson,
      status: "DRAFT",
    });
  }

  publishPost(payload: PublishPostRequest): PostSaveResponse {
    const title = payload.title.trim();

    if (!title) {
      throwBadRequest("제목은 필수입니다.");
    }

    if (!hasMeaningfulBody(payload.contentHtml, payload.contentJson)) {
      throwBadRequest("발행하려면 본문 내용을 입력해주세요.");
    }

    return this.savePost({
      postId: payload.postId,
      title,
      contentHtml: payload.contentHtml,
      contentJson: payload.contentJson,
      status: "PUBLISHED",
    });
  }

  private savePost(payload: {
    postId?: string;
    title: string;
    contentHtml: string;
    contentJson: unknown;
    status: PostStatus;
  }): PostSaveResponse {
    const existingPost = payload.postId ? this.postsRepository.findById(payload.postId) : undefined;

    const postId = existingPost?.postId ?? payload.postId ?? `post_${randomUUID()}`;
    const createdAt = existingPost?.createdAt ?? new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const publishedAt =
      payload.status === "PUBLISHED" ? (existingPost?.publishedAt ?? updatedAt) : undefined;

    const post = new Post({
      postId,
      title: payload.title,
      contentHtml: payload.contentHtml,
      contentJson: payload.contentJson,
      status: payload.status,
      createdAt,
      updatedAt,
      publishedAt,
    });

    try {
      const savedPost = this.postsRepository.save(post);
      return this.toPostSaveResponse(savedPost);
    } catch (error) {
      if (error instanceof Error) {
        throwBadRequest(error.message);
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.");
    }
  }

  private toPostSummary(post: Post): PostSummary {
    return {
      postId: post.postId,
      title: post.title,
      status: post.status,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    };
  }

  private toPostSaveResponse(post: Post): PostSaveResponse {
    return {
      postId: post.postId,
      status: post.status,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    };
  }
}
