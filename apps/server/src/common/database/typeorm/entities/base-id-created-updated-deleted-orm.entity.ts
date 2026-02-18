import { DeleteDateColumn } from "typeorm";

import { BaseIdCreatedUpdatedOrmEntity } from "./base-id-created-updated-orm.entity.js";

export abstract class BaseIdCreatedUpdatedDeletedOrmEntity extends BaseIdCreatedUpdatedOrmEntity {
  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamptz",
    nullable: true,
  })
  deletedAt?: Date | null;
}
