import { Column, Entity, Index } from "typeorm";

import { BaseIdCreatedUpdatedDeletedOrmEntity } from "../../../../../common/database/typeorm/entities/base-id-created-updated-deleted-orm.entity.js";

@Entity({ name: "uploaded_images" })
@Index(["fileKey"], { unique: true })
@Index(["objectKey"], { unique: true })
export class UploadedImageOrmEntity extends BaseIdCreatedUpdatedDeletedOrmEntity {
  @Column({ name: "file_key", type: "varchar", length: 128 })
  fileKey!: string;

  @Column({ name: "object_key", type: "varchar", length: 512 })
  objectKey!: string;

  @Column({ name: "mime_type", type: "varchar", length: 100 })
  mimeType!: string;
}
