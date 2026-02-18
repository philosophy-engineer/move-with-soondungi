import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
} from "@workspace/shared/blog"
import {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
} from "@workspace/shared/upload"
import type { Request, Response } from "express"
import { ZodError } from "zod"

import {
  throwBadRequest,
  throwNotFound,
} from "../../../common/errors/error-response.js"
import { waitMockDelay } from "../../../common/utils/mock.js"
import { UploadsService } from "../uploads.service.js"

async function readRequestBodyAsArrayBuffer(request: Request): Promise<ArrayBuffer> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const buffer = Buffer.concat(chunks)
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

@Controller("api/mock/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  @HttpCode(200)
  async presign(@Body() raw: unknown) {
    await waitMockDelay()

    try {
      const parsed = presignUploadRequestSchema.safeParse(raw)

      if (!parsed.success) {
        const payload = raw as {
          mimeType?: unknown
          size?: unknown
        }

        if (
          typeof payload.mimeType === "string" &&
          !ALLOWED_IMAGE_MIME_TYPES.includes(payload.mimeType as AllowedImageMimeType)
        ) {
          throwBadRequest("jpg/png/webp 형식만 업로드할 수 있습니다.")
        }

        if (
          typeof payload.size === "number" &&
          (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES)
        ) {
          throwBadRequest("이미지 용량은 10MB 이하여야 합니다.")
        }

        throwBadRequest("잘못된 요청입니다.")
      }

      const payload = parsed.data

      if (payload.size <= 0 || payload.size > MAX_IMAGE_SIZE_BYTES) {
        throwBadRequest("이미지 용량은 10MB 이하여야 합니다.")
      }

      const result = this.uploadsService.createPresignedUpload(payload)
      return presignUploadResponseSchema.parse(result)
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

  @Put("blob/:fileKey")
  @HttpCode(204)
  async uploadBlob(
    @Param("fileKey") fileKey: string,
    @Query("token") token: string | undefined,
    @Req() request: Request
  ) {
    await waitMockDelay()

    if (!token) {
      throwBadRequest("업로드 토큰이 필요합니다.")
    }

    try {
      const data = await readRequestBodyAsArrayBuffer(request)
      const rawContentType = request.headers["content-type"]
      const contentType =
        typeof rawContentType === "string" ? rawContentType : undefined

      this.uploadsService.saveUploadBlob({
        fileKey,
        token,
        data,
        contentType,
      })
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

      throwBadRequest("업로드 처리 중 오류가 발생했습니다.")
    }
  }

  @Post("complete")
  @HttpCode(200)
  async complete(@Body() raw: unknown) {
    await waitMockDelay()

    try {
      const payload = completeUploadRequestSchema.parse(raw)
      const result = this.uploadsService.completeUpload(payload)

      return completeUploadResponseSchema.parse(result)
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

      throwBadRequest("업로드 완료 처리 중 오류가 발생했습니다.")
    }
  }

  @Get("file/:imageId")
  async getFile(@Param("imageId") imageId: string, @Res() response: Response) {
    await waitMockDelay()

    const image = this.uploadsService.getImageById(imageId)

    if (!image) {
      throwNotFound("이미지를 찾을 수 없습니다.")
    }

    response.setHeader("content-type", image.mimeType)
    response.setHeader("cache-control", "public, max-age=31536000, immutable")
    response.status(200).send(Buffer.from(image.bytes))
  }
}
