import { Post } from "../entities/post.entity.js";

export type PostRecord = {
  postId: string;
  slug?: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  contentHtml: string;
  contentJson: unknown;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export function toPostRecord(post: Post): PostRecord {
  if (!post.postId) {
    throw new Error("postId가 없는 게시글은 저장 레코드로 변환할 수 없습니다.");
  }

  return {
    postId: post.postId,
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    thumbnailUrl: post.thumbnailUrl,
    contentHtml: post.contentHtml,
    contentJson: post.contentJson,
    status: post.status,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
  };
}

export function toPostEntity(record: PostRecord): Post {
  return Post.rehydrate({
    postId: record.postId,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    thumbnailUrl: record.thumbnailUrl,
    contentHtml: record.contentHtml,
    contentJson: record.contentJson,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
  });
}
