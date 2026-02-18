import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
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
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { UploadsService } from "../services/uploads.service.js";

@Controller("api/admin/uploads")
@UseGuards(AuthGuard)
export class AdminUploadsController {
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
