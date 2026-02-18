import { DeleteDateColumn } from "typeorm";

import { BaseIdCreatedOrmEntity } from "./base-id-created-orm.entity.js";

export abstract class BaseIdCreatedDeletedOrmEntity extends BaseIdCreatedOrmEntity {
  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamptz",
    nullable: true,
  })
  deletedAt?: Date | null;
}
