import { Injectable } from "@nestjs/common";

import type { Post } from "../entities/post.entity.js";
import { type PostRecord, toPostEntity, toPostRecord } from "./posts.persistence.mapper.js";
import type { PostsRepository } from "./posts.repository.js";

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
}
