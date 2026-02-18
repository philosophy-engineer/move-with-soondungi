import { Controller, Get, Param, Query } from "@nestjs/common";
import {
  getPublicPostDetailResponseSchema,
  listPublicPostsQuerySchema,
  listPublicPostsResponseSchema,
  type ListPublicPostsQuery,
  postSlugParamSchema,
  type PostSlugParam,
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

  @Get(":slug")
  async getPublicPostDetail(
    @Param(new ZodValidationPipe(postSlugParamSchema))
    params: PostSlugParam,
  ) {
    const result = await this.postsService.getPublicPostDetailBySlug(params.slug);
    return getPublicPostDetailResponseSchema.parse(result);
  }
}
