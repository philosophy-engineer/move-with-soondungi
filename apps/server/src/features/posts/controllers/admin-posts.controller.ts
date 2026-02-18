import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import {
  draftPostRequestSchema,
  listPostsResponseSchema,
  postSaveResponseSchema,
  publishPostRequestSchema,
  type DraftPostRequest,
  type PublishPostRequest,
} from "@workspace/shared/blog";

import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { PostsService } from "../services/posts.service.js";

@Controller("api/admin/posts")
@UseGuards(AuthGuard)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async listPosts() {
    const items = await this.postsService.listPostSummaries();

    return listPostsResponseSchema.parse({
      items,
    });
  }

  @Post("draft")
  @HttpCode(200)
  async saveDraft(@Body(new ZodValidationPipe(draftPostRequestSchema)) payload: DraftPostRequest) {
    const result = await this.postsService.saveDraftPost(payload);
    return postSaveResponseSchema.parse(result);
  }

  @Post("publish")
  @HttpCode(200)
  async publish(
    @Body(new ZodValidationPipe(publishPostRequestSchema))
    payload: PublishPostRequest,
  ) {
    const result = await this.postsService.publishPost(payload);
    return postSaveResponseSchema.parse(result);
  }
}
