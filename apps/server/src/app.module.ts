import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { validateEnv } from "./common/config/env.schema.js";
import { DatabaseModule } from "./common/database/typeorm/database.module.js";
import { PostsModule } from "./features/posts/posts.module.js";
import { UploadsModule } from "./features/uploads/uploads.module.js";
import { HealthController } from "./health/health.controller.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      validate: validateEnv,
    }),
    DatabaseModule,
    PostsModule,
    UploadsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
