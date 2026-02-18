import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import type { Post } from "../entities/post.entity.js";
import { toDomainPost, toPostOrmEntity } from "./posts.typeorm.mapper.js";
import { PostOrmEntity } from "./typeorm/entities/post.orm-entity.js";
import type { PostsRepository, PublicPostsCursor } from "./posts.repository.js";

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

  async findBySlug(slug: string): Promise<Post | undefined> {
    const found = await this.repository
      .createQueryBuilder("post")
      .where("post.slug = :slug", { slug })
      .andWhere("post.deletedAt IS NULL")
      .getOne();

    if (!found) {
      return undefined;
    }

    return toDomainPost(found);
  }

  async findPublishedBySlug(slug: string): Promise<Post | undefined> {
    const found = await this.repository
      .createQueryBuilder("post")
      .where("post.slug = :slug", { slug })
      .andWhere("post.status = :status", { status: "PUBLISHED" })
      .andWhere("post.publishedAt IS NOT NULL")
      .andWhere("post.deletedAt IS NULL")
      .getOne();

    if (!found) {
      return undefined;
    }

    return toDomainPost(found);
  }

  async findPublishedFeed(params: { limit: number; cursor?: PublicPostsCursor }): Promise<Post[]> {
    const query = this.repository
      .createQueryBuilder("post")
      .where("post.status = :status", { status: "PUBLISHED" })
      .andWhere("post.deletedAt IS NULL")
      .andWhere("post.publishedAt IS NOT NULL")
      .andWhere("post.slug IS NOT NULL")
      .orderBy("post.publishedAt", "DESC")
      .addOrderBy("post.id", "DESC")
      .take(params.limit);

    if (params.cursor) {
      query.andWhere(
        "(post.publishedAt < :cursorPublishedAt OR (post.publishedAt = :cursorPublishedAt AND post.id < :cursorPostId))",
        {
          cursorPublishedAt: new Date(params.cursor.publishedAt),
          cursorPostId: params.cursor.postId,
        },
      );
    }

    const items = await query.getMany();
    return items.map((item) => toDomainPost(item));
  }
}
