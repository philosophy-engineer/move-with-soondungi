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

  async listPostSummaries(): Promise<PostSummary[]> {
    const posts = await this.postsRepository.findAll();

    return posts
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((post) => this.toPostSummary(post));
  }

  async saveDraftPost(payload: DraftPostRequest): Promise<PostSaveResponse> {
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

  async publishPost(payload: PublishPostRequest): Promise<PostSaveResponse> {
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

  private async savePost(payload: {
    postId?: string;
    title: string;
    contentHtml: string;
    contentJson: unknown;
    status: PostStatus;
  }): Promise<PostSaveResponse> {
    const existingPost = payload.postId
      ? await this.postsRepository.findById(payload.postId)
      : undefined;

    const postId = existingPost?.postId ?? payload.postId;
    const createdAt = existingPost?.createdAt ?? new Date().toISOString();
    const updatedAt = new Date().toISOString();
    const publishedAt =
      payload.status === "PUBLISHED" ? (existingPost?.publishedAt ?? updatedAt) : undefined;

    const post = Post.create({
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
      const savedPost = await this.postsRepository.save(post);
      return this.toPostSaveResponse(savedPost);
    } catch (error) {
      if (error instanceof Error) {
        throwBadRequest(error.message);
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.");
    }
  }

  private toPostSummary(post: Post): PostSummary {
    if (!post.postId) {
      throwBadRequest("게시글 ID 생성에 실패했습니다.");
    }

    return {
      postId: post.postId,
      title: post.title,
      status: post.status,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    };
  }

  private toPostSaveResponse(post: Post): PostSaveResponse {
    if (!post.postId) {
      throwBadRequest("게시글 ID 생성에 실패했습니다.");
    }

    return {
      postId: post.postId,
      status: post.status,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
    };
  }
}
