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
  hasMeaningfulBody,
  listPostsResponseSchema,
  postSaveResponseSchema,
  publishPostRequestSchema,
} from "@workspace/shared/blog"
import { ZodError } from "zod"

import { MockStoreService } from "../services/mock-store.service.js"
import { throwBadRequest } from "../utils/error-response.js"
import { waitMockDelay } from "../utils/mock-delay.js"

@Controller("api/mock/posts")
export class PostsController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  async listPosts() {
    await waitMockDelay()

    return listPostsResponseSchema.parse({
      items: this.store.listPostSummaries(),
    })
  }

  @Post("draft")
  @HttpCode(200)
  async saveDraft(@Body() raw: unknown) {
    await waitMockDelay()

    try {
      const payload = draftPostRequestSchema.parse(raw)

      if (!payload.title.trim()) {
        throwBadRequest("제목은 필수입니다.")
      }

      const result = this.store.saveDraftPost({
        ...payload,
        title: payload.title.trim(),
      })

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

      if (!payload.title.trim()) {
        throwBadRequest("제목은 필수입니다.")
      }

      if (!hasMeaningfulBody(payload.contentHtml, payload.contentJson)) {
        throwBadRequest("발행하려면 본문 내용을 입력해주세요.")
      }

      const result = this.store.publishPost({
        ...payload,
        title: payload.title.trim(),
      })

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
