import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpCode,
  Post,
} from "@nestjs/common"
import {
  draftPostRequestSchema,
  listPostsResponseSchema,
  postSaveResponseSchema,
  publishPostRequestSchema,
} from "@workspace/shared/blog"
import { ZodError } from "zod"

import { throwBadRequest } from "../../../common/errors/error-response.js"
import { waitMockDelay } from "../../../common/utils/mock.js"
import { PostsService } from "../posts.service.js"

@Controller("api/mock/posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async listPosts() {
    await waitMockDelay()

    return listPostsResponseSchema.parse({
      items: this.postsService.listPostSummaries(),
    })
  }

  @Post("draft")
  @HttpCode(200)
  async saveDraft(@Body() raw: unknown) {
    await waitMockDelay()

    try {
      const payload = draftPostRequestSchema.parse(raw)
      const result = this.postsService.saveDraftPost(payload)

      return postSaveResponseSchema.parse(result)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      if (error instanceof ZodError) {
        throwBadRequest("잘못된 요청입니다.")
      }

      if (error instanceof Error) {
        throwBadRequest(error.message)
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.")
    }
  }

  @Post("publish")
  @HttpCode(200)
  async publish(@Body() raw: unknown) {
    await waitMockDelay()

    try {
      const payload = publishPostRequestSchema.parse(raw)
      const result = this.postsService.publishPost(payload)

      return postSaveResponseSchema.parse(result)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      if (error instanceof ZodError) {
        throwBadRequest("잘못된 요청입니다.")
      }

      if (error instanceof Error) {
        throwBadRequest(error.message)
      }

      throwBadRequest("요청 처리 중 오류가 발생했습니다.")
    }
  }
}
