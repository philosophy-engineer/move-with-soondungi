import type { Post } from "../entities/post.entity.js";

export const POSTS_REPOSITORY = Symbol("POSTS_REPOSITORY");

export type PublicPostsCursor = {
  publishedAt: string;
  postId: string;
};

export interface PostsRepository {
  save(post: Post): Promise<Post>;
  findById(postId: string): Promise<Post | undefined>;
  findBySlug(slug: string): Promise<Post | undefined>;
  findAll(): Promise<Post[]>;
  findPublishedFeed(params: { limit: number; cursor?: PublicPostsCursor }): Promise<Post[]>;
}
