import { Inject, Injectable } from "@nestjs/common";
import {
  hasMeaningfulBody,
  type DraftPostRequest,
  type ListPublicPostsQuery,
  type ListPublicPostsResponse,
  type PostFeedItem,
  type PostSaveResponse,
  type PostSummary,
  type PublishPostRequest,
} from "@workspace/shared/blog";
import { z } from "zod";

import { throwBadRequest } from "../../../common/errors/error-response.js";
import { decodeOpaqueCursor, encodeOpaqueCursor } from "../../../common/pagination/cursor.js";
import { Post, type PostStatus } from "../entities/post.entity.js";
import {
  POSTS_REPOSITORY,
  type PostsRepository,
  type PublicPostsCursor,
} from "../repositories/posts.repository.js";
import {
  extractSummaryFromHtml,
  extractThumbnailUrlFromHtml,
  slugifyTitle,
} from "../utils/post-public-meta.js";

const publicPostsCursorSchema: z.ZodType<PublicPostsCursor> = z.object({
  publishedAt: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), "publishedAt must be a valid date string"),
  postId: z.string().min(1),
});

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

  async listPublicPosts(query: ListPublicPostsQuery): Promise<ListPublicPostsResponse> {
    const cursor = this.parseCursor(query.cursor);

    const posts = await this.postsRepository.findPublishedFeed({
      limit: query.limit + 1,
      cursor,
    });

    const hasMore = posts.length > query.limit;
    const visibleItems = hasMore ? posts.slice(0, query.limit) : posts;
    const items = visibleItems.map((post) => this.toPostFeedItem(post));

    let nextCursor: string | null = null;
    if (hasMore) {
      const lastPost = visibleItems[visibleItems.length - 1];

      if (!lastPost) {
        throwBadRequest("다음 페이지 커서를 생성할 수 없습니다.");
      }

      nextCursor = encodeOpaqueCursor(this.toPublicCursor(lastPost));
    }

    return {
      items,
      nextCursor,
    };
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

    let slug = existingPost?.slug;
    let summary = existingPost?.summary;
    let thumbnailUrl = existingPost?.thumbnailUrl;

    if (payload.status === "PUBLISHED") {
      if (!slug) {
        slug = await this.generateUniqueSlug(payload.title, existingPost?.postId);
      }

      summary = extractSummaryFromHtml(payload.contentHtml, payload.title);
      thumbnailUrl = extractThumbnailUrlFromHtml(payload.contentHtml);
    }

    const post = Post.create({
      postId,
      slug,
      title: payload.title,
      summary,
      thumbnailUrl,
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

  private parseCursor(rawCursor: string | undefined): PublicPostsCursor | undefined {
    if (!rawCursor) {
      return undefined;
    }

    const decoded = decodeOpaqueCursor(rawCursor, publicPostsCursorSchema);

    if (!decoded) {
      throwBadRequest("잘못된 커서입니다.");
    }

    return decoded;
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

  private toPostFeedItem(post: Post): PostFeedItem {
    if (!post.slug || !post.publishedAt) {
      throwBadRequest("발행된 게시글의 공개 데이터가 올바르지 않습니다.");
    }

    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary?.trim() || extractSummaryFromHtml(post.contentHtml, post.title),
      thumbnailUrl: post.thumbnailUrl ?? extractThumbnailUrlFromHtml(post.contentHtml) ?? null,
      publishedAt: post.publishedAt,
    };
  }

  private toPublicCursor(post: Post): PublicPostsCursor {
    if (!post.postId || !post.publishedAt) {
      throwBadRequest("다음 페이지 커서를 생성할 수 없습니다.");
    }

    return {
      postId: post.postId,
      publishedAt: post.publishedAt,
    };
  }

  private async generateUniqueSlug(title: string, currentPostId?: string): Promise<string> {
    const baseSlug = slugifyTitle(title);

    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      const found = await this.postsRepository.findBySlug(candidate);

      if (!found || found.postId === currentPostId) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
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
