import { Injectable } from "@nestjs/common";

import type { Post } from "../entities/post.entity.js";
import { type PostRecord, toPostEntity, toPostRecord } from "./posts.persistence.mapper.js";
import type { PostsRepository, PublicPostsCursor } from "./posts.repository.js";

@Injectable()
export class PostsInMemoryRepository implements PostsRepository {
  private readonly posts = new Map<string, PostRecord>();

  async save(post: Post): Promise<Post> {
    if (!post.postId) {
      throw new Error("postId가 없는 게시글은 저장할 수 없습니다.");
    }

    this.posts.set(post.postId, toPostRecord(post));
    return post;
  }

  async findById(postId: string): Promise<Post | undefined> {
    const record = this.posts.get(postId);

    if (!record) {
      return undefined;
    }

    return toPostEntity(record);
  }

  async findAll(): Promise<Post[]> {
    return [...this.posts.values()].map((record) => toPostEntity(record));
  }

  async findBySlug(slug: string): Promise<Post | undefined> {
    const found = [...this.posts.values()].find((record) => record.slug === slug);
    return found ? toPostEntity(found) : undefined;
  }

  async findPublishedFeed(params: { limit: number; cursor?: PublicPostsCursor }): Promise<Post[]> {
    const items = [...this.posts.values()]
      .map((record) => toPostEntity(record))
      .filter((post) => post.status === "PUBLISHED" && post.publishedAt && post.slug)
      .sort((a, b) => {
        const dateCompare = b.publishedAt!.localeCompare(a.publishedAt!);
        if (dateCompare !== 0) {
          return dateCompare;
        }
        return (b.postId ?? "").localeCompare(a.postId ?? "");
      });

    const cursor = params.cursor;

    if (!cursor) {
      return items.slice(0, params.limit);
    }

    const filtered = items.filter((post) => {
      if (!post.publishedAt || !post.postId) {
        return false;
      }

      if (post.publishedAt < cursor.publishedAt) {
        return true;
      }

      return post.publishedAt === cursor.publishedAt && post.postId < cursor.postId;
    });

    return filtered.slice(0, params.limit);
  }
}
