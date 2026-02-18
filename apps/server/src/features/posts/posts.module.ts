import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "../auth/auth.module.js";
import { AdminPostsController } from "./controllers/admin-posts.controller.js";
import { PublicPostsController } from "./controllers/public-posts.controller.js";
import { POSTS_REPOSITORY } from "./repositories/posts.repository.js";
import { PostsTypeormRepository } from "./repositories/posts.typeorm.repository.js";
import { PostOrmEntity } from "./repositories/typeorm/entities/post.orm-entity.js";
import { PostsService } from "./services/posts.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([PostOrmEntity]), AuthModule],
  controllers: [AdminPostsController, PublicPostsController],
  providers: [
    PostsService,
    {
      provide: POSTS_REPOSITORY,
      useClass: PostsTypeormRepository,
    },
  ],
  exports: [PostsService],
})
export class PostsModule {}
