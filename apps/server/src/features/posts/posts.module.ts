import { Module } from "@nestjs/common"

import { PostsController } from "./controllers/posts.controller.js"
import { PostsInMemoryRepository } from "./repositories/posts.in-memory.repository.js"
import { POSTS_REPOSITORY } from "./repositories/posts.repository.js"
import { PostsService } from "./services/posts.service.js"

@Module({
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: POSTS_REPOSITORY,
      useClass: PostsInMemoryRepository,
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
