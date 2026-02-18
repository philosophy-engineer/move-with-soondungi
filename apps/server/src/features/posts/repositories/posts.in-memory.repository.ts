import { Injectable } from "@nestjs/common";

import type { Post } from "../entities/post.entity.js";
import { type PostRecord, toPostEntity, toPostRecord } from "./posts.persistence.mapper.js";
import type { PostsRepository } from "./posts.repository.js";

@Injectable()
export class PostsInMemoryRepository implements PostsRepository {
  private readonly posts = new Map<string, PostRecord>();

  save(post: Post): Post {
    this.posts.set(post.postId, toPostRecord(post));
    return post;
  }

  findById(postId: string): Post | undefined {
    const record = this.posts.get(postId);

    if (!record) {
      return undefined;
    }

    return toPostEntity(record);
  }

  findAll(): Post[] {
    return [...this.posts.values()].map((record) => toPostEntity(record));
  }
}
