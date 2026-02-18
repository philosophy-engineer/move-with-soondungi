import { Body, Controller, Get, HttpCode, Param, Post, Put, Query, Req, Res } from "@nestjs/common";
import {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
  type CompleteUploadRequest,
  type PresignUploadRequest,
} from "@workspace/shared/upload";
import type { Request, Response } from "express";

import { throwBadRequest, throwNotFound } from "../../../common/errors/error-response.js";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import { waitMockDelay } from "../../../common/utils/mock.js";
import { UploadsService } from "../services/uploads.service.js";

async function readRequestBodyAsArrayBuffer(request: Request): Promise<ArrayBuffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const buffer = Buffer.concat(chunks);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

@Controller("api/mock/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  @HttpCode(200)
  async presign(
    @Body(new ZodValidationPipe(presignUploadRequestSchema))
    payload: PresignUploadRequest,
  ) {
    await waitMockDelay();

    const result = this.uploadsService.createPresignedUpload(payload);
    return presignUploadResponseSchema.parse(result);
  }

  @Put("blob/:fileKey")
  @HttpCode(204)
  async uploadBlob(
    @Param("fileKey") fileKey: string,
    @Query("token") token: string | undefined,
    @Req() request: Request,
  ) {
    await waitMockDelay();

    if (!token) {
      throwBadRequest("업로드 토큰이 필요합니다.");
    }

    const data = await readRequestBodyAsArrayBuffer(request);
    const rawContentType = request.headers["content-type"];
    const contentType = typeof rawContentType === "string" ? rawContentType : undefined;

    this.uploadsService.saveUploadBlob({
      fileKey,
      token,
      data,
      contentType,
    });
  }

  @Post("complete")
  @HttpCode(200)
  async complete(
    @Body(new ZodValidationPipe(completeUploadRequestSchema))
    payload: CompleteUploadRequest,
  ) {
    await waitMockDelay();

    const result = this.uploadsService.completeUpload(payload);
    return completeUploadResponseSchema.parse(result);
  }

  @Get("file/:imageId")
  async getFile(@Param("imageId") imageId: string, @Res() response: Response) {
    await waitMockDelay();

    const image = this.uploadsService.getImageById(imageId);

    if (!image) {
      throwNotFound("이미지를 찾을 수 없습니다.");
    }

    response.setHeader("content-type", image.mimeType);
    response.setHeader("cache-control", "public, max-age=31536000, immutable");
    response.status(200).send(Buffer.from(image.bytes));
  }
}
