import type { Post } from "../entities/post.entity.js"

export const POSTS_REPOSITORY = Symbol("POSTS_REPOSITORY")

export interface PostsRepository {
  save(post: Post): Post
  findById(postId: string): Post | undefined
  findAll(): Post[]
}
