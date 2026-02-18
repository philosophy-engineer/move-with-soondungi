import { Module } from "@nestjs/common";

import { UploadsController } from "./controllers/uploads.controller.js";
import { UploadsInMemoryRepository } from "./repositories/uploads.in-memory.repository.js";
import { UPLOADS_REPOSITORY } from "./repositories/uploads.repository.js";
import { UploadsS3Repository } from "./repositories/uploads.s3.repository.js";
import { UploadsService } from "./services/uploads.service.js";

@Module({
  controllers: [UploadsController],
  providers: [
    UploadsService,
    UploadsS3Repository,
    {
      provide: UPLOADS_REPOSITORY,
      useClass: UploadsInMemoryRepository,
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
