import { Column, Entity, Index } from "typeorm";

import { BaseIdCreatedUpdatedDeletedOrmEntity } from "../../../../../common/database/typeorm/entities/base-id-created-updated-deleted-orm.entity.js";

const POST_STATUS_VALUES = ["DRAFT", "PUBLISHED"] as const;

@Entity({ name: "posts" })
@Index("UQ_posts_slug", ["slug"], {
  unique: true,
  where: `"slug" IS NOT NULL AND "deleted_at" IS NULL`,
})
@Index("IDX_posts_public_feed", ["publishedAt", "id"], {
  where: `"status" = 'PUBLISHED' AND "deleted_at" IS NULL`,
})
export class PostOrmEntity extends BaseIdCreatedUpdatedDeletedOrmEntity {
  @Column({ name: "slug", type: "varchar", length: 255, nullable: true })
  slug?: string | null;

  @Column({ name: "title", type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "summary", type: "text", nullable: true })
  summary?: string | null;

  @Column({ name: "thumbnail_url", type: "text", nullable: true })
  thumbnailUrl?: string | null;

  @Column({ name: "content_html", type: "text" })
  contentHtml!: string;

  @Column({ name: "content_json", type: "jsonb" })
  contentJson!: Record<string, unknown>;

  @Column({
    name: "status",
    type: "enum",
    enum: POST_STATUS_VALUES,
    enumName: "post_status",
  })
  status!: (typeof POST_STATUS_VALUES)[number];

  @Column({ name: "published_at", type: "timestamptz", nullable: true })
  publishedAt?: Date | null;
}
