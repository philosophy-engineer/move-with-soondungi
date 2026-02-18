import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import {
  completeUploadRequestSchema,
  completeUploadResponseSchema,
  presignUploadRequestSchema,
  presignUploadResponseSchema,
  type CompleteUploadRequest,
  type PresignUploadRequest,
} from "@workspace/shared/upload";

import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import { waitMockDelay } from "../../../common/utils/mock.js";
import { UploadsService } from "../services/uploads.service.js";

@Controller("api/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  @HttpCode(200)
  async presign(
    @Body(new ZodValidationPipe(presignUploadRequestSchema))
    payload: PresignUploadRequest,
  ) {
    await waitMockDelay();

    const result = await this.uploadsService.createPresignedUpload(payload);
    return presignUploadResponseSchema.parse(result);
  }

  @Post("complete")
  @HttpCode(200)
  async complete(
    @Body(new ZodValidationPipe(completeUploadRequestSchema))
    payload: CompleteUploadRequest,
  ) {
    await waitMockDelay();

    const result = await this.uploadsService.completeUpload(payload);
    return completeUploadResponseSchema.parse(result);
  }
}
