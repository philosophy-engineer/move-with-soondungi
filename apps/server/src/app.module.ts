import { Module } from "@nestjs/common"

import { PostsModule } from "./features/posts/posts.module.js"
import { UploadsModule } from "./features/uploads/uploads.module.js"
import { HealthController } from "./health/health.controller.js"

@Module({
  imports: [PostsModule, UploadsModule],
  controllers: [HealthController],
})
export class AppModule {}
