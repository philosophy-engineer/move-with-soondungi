import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { Post } from "../entities/post.entity.js";
import { toDomainPost, toPostOrmEntity } from "./posts.typeorm.mapper.js";
import { PostOrmEntity } from "./typeorm/entities/post.orm-entity.js";
import type { PostsRepository } from "./posts.repository.js";

@Injectable()
export class PostsTypeormRepository implements PostsRepository {
  constructor(
    @InjectRepository(PostOrmEntity)
    private readonly repository: Repository<PostOrmEntity>,
  ) {}

  async save(post: Post): Promise<Post> {
    const saved = await this.repository.save(toPostOrmEntity(post));
    return toDomainPost(saved);
  }

  async findById(postId: string): Promise<Post | undefined> {
    const found = await this.repository.findOne({
      where: { id: postId },
    });

    if (!found) {
      return undefined;
    }

    return toDomainPost(found);
  }

  async findAll(): Promise<Post[]> {
    const items = await this.repository.find();
    return items.map((item) => toDomainPost(item));
  }
}
