import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import {
  draftPostRequestSchema,
  listPostsResponseSchema,
  postSaveResponseSchema,
  publishPostRequestSchema,
  type DraftPostRequest,
  type PublishPostRequest,
} from "@workspace/shared/blog";

import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import { waitMockDelay } from "../../../common/utils/mock.js";
import { PostsService } from "../services/posts.service.js";

@Controller("api/mock/posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async listPosts() {
    await waitMockDelay();

    return listPostsResponseSchema.parse({
      items: this.postsService.listPostSummaries(),
    });
  }

  @Post("draft")
  @HttpCode(200)
  async saveDraft(@Body(new ZodValidationPipe(draftPostRequestSchema)) payload: DraftPostRequest) {
    await waitMockDelay();

    const result = this.postsService.saveDraftPost(payload);
    return postSaveResponseSchema.parse(result);
  }

  @Post("publish")
  @HttpCode(200)
  async publish(
    @Body(new ZodValidationPipe(publishPostRequestSchema))
    payload: PublishPostRequest,
  ) {
    await waitMockDelay();

    const result = this.postsService.publishPost(payload);
    return postSaveResponseSchema.parse(result);
  }
}
