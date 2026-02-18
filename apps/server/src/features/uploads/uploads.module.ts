import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UploadsController } from "./controllers/uploads.controller.js";
import { UPLOADS_REPOSITORY } from "./repositories/uploads.repository.js";
import { UploadsS3Repository } from "./repositories/uploads.s3.repository.js";
import { UploadSessionOrmEntity } from "./repositories/typeorm/entities/upload-session.orm-entity.js";
import { UploadedImageOrmEntity } from "./repositories/typeorm/entities/uploaded-image.orm-entity.js";
import { UploadsTypeormRepository } from "./repositories/uploads.typeorm.repository.js";
import { UploadsService } from "./services/uploads.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([UploadSessionOrmEntity, UploadedImageOrmEntity])],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    UploadsS3Repository,
    {
      provide: UPLOADS_REPOSITORY,
      useClass: UploadsTypeormRepository,
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
