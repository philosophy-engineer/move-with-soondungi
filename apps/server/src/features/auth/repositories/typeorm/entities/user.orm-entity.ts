import { Column, Entity, Index } from "typeorm";

import { BaseIdCreatedUpdatedDeletedOrmEntity } from "../../../../../common/database/typeorm/entities/base-id-created-updated-deleted-orm.entity.js";

@Entity({ name: "users" })
export class UserOrmEntity extends BaseIdCreatedUpdatedDeletedOrmEntity {
  @Index("IDX_users_email_unique", { unique: true })
  @Column({ name: "email", type: "varchar", length: 320 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash!: string;
}
