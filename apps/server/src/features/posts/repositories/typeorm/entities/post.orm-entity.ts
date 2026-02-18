import { Column, Entity } from "typeorm";

import { BaseIdCreatedUpdatedDeletedOrmEntity } from "../../../../../common/database/typeorm/entities/base-id-created-updated-deleted-orm.entity.js";

const POST_STATUS_VALUES = ["DRAFT", "PUBLISHED"] as const;

@Entity({ name: "posts" })
export class PostOrmEntity extends BaseIdCreatedUpdatedDeletedOrmEntity {
  @Column({ name: "title", type: "varchar", length: 255 })
  title!: string;

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
