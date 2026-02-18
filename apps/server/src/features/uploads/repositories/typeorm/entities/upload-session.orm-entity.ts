import { Column, Entity, Index } from "typeorm";

import { BaseIdCreatedUpdatedDeletedOrmEntity } from "../../../../../common/database/typeorm/entities/base-id-created-updated-deleted-orm.entity.js";

@Entity({ name: "upload_sessions" })
@Index(["fileKey"], { unique: true })
@Index(["completeToken"], { unique: true })
export class UploadSessionOrmEntity extends BaseIdCreatedUpdatedDeletedOrmEntity {
  @Column({ name: "file_key", type: "varchar", length: 128 })
  fileKey!: string;

  @Column({ name: "object_key", type: "varchar", length: 512 })
  objectKey!: string;

  @Column({ name: "filename", type: "varchar", length: 255 })
  filename!: string;

  @Column({ name: "mime_type", type: "varchar", length: 100 })
  mimeType!: string;

  @Column({ name: "size", type: "integer" })
  size!: number;

  @Column({ name: "complete_token", type: "varchar", length: 255 })
  completeToken!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;
}
