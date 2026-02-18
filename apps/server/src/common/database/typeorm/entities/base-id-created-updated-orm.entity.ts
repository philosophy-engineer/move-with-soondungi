import { UpdateDateColumn } from "typeorm";

import { BaseIdCreatedOrmEntity } from "./base-id-created-orm.entity.js";

export abstract class BaseIdCreatedUpdatedOrmEntity extends BaseIdCreatedOrmEntity {
  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}
