import { Controller, Get, Query } from "@nestjs/common";
import {
  listPublicPostsQuerySchema,
  listPublicPostsResponseSchema,
  type ListPublicPostsQuery,
} from "@workspace/shared/blog";

import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import { PostsService } from "../services/posts.service.js";

@Controller("api/posts")
export class PublicPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async listPublicPosts(
    @Query(new ZodValidationPipe(listPublicPostsQuerySchema)) query: ListPublicPostsQuery,
  ) {
    const result = await this.postsService.listPublicPosts(query);
    return listPublicPostsResponseSchema.parse(result);
  }
}
