import { Module } from "@nestjs/common"

import { PostsController } from "./controllers/posts.controller.js"
import { UploadsController } from "./controllers/uploads.controller.js"
import { MockStoreService } from "./services/mock-store.service.js"

@Module({
  controllers: [PostsController, UploadsController],
  providers: [MockStoreService],
})
export class MockModule {}
