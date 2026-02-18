import { Post } from "../entities/post.entity.js";
import { PostOrmEntity } from "./typeorm/entities/post.orm-entity.js";

export function toDomainPost(ormEntity: PostOrmEntity): Post {
  return Post.rehydrate({
    postId: ormEntity.id,
    title: ormEntity.title,
    contentHtml: ormEntity.contentHtml,
    contentJson: ormEntity.contentJson,
    status: ormEntity.status,
    createdAt: ormEntity.createdAt.toISOString(),
    updatedAt: ormEntity.updatedAt.toISOString(),
    publishedAt: ormEntity.publishedAt?.toISOString(),
  });
}

export function toPostOrmEntity(domainEntity: Post): PostOrmEntity {
  const ormEntity = new PostOrmEntity();

  if (domainEntity.postId) {
    ormEntity.id = domainEntity.postId;
  }

  ormEntity.title = domainEntity.title;
  ormEntity.contentHtml = domainEntity.contentHtml;
  ormEntity.contentJson = domainEntity.contentJson as Record<string, unknown>;
  ormEntity.status = domainEntity.status;
  ormEntity.publishedAt = domainEntity.publishedAt ? new Date(domainEntity.publishedAt) : null;

  if (domainEntity.createdAt) {
    ormEntity.createdAt = new Date(domainEntity.createdAt);
  }

  if (domainEntity.updatedAt) {
    ormEntity.updatedAt = new Date(domainEntity.updatedAt);
  }

  return ormEntity;
}
