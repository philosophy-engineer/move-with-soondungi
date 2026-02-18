import { Post } from "../entities/post.entity.js";

export type PostRecord = {
  postId: string;
  title: string;
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
    title: post.title,
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
    title: record.title,
    contentHtml: record.contentHtml,
    contentJson: record.contentJson,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
  });
}
