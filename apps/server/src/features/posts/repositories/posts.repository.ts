import type { Post } from "../entities/post.entity.js";

export const POSTS_REPOSITORY = Symbol("POSTS_REPOSITORY");

export interface PostsRepository {
  save(post: Post): Promise<Post>;
  findById(postId: string): Promise<Post | undefined>;
  findAll(): Promise<Post[]>;
}
