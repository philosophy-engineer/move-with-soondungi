import { CreateDateColumn } from "typeorm";

import { BaseIdOrmEntity } from "./base-id-orm.entity.js";

export abstract class BaseIdCreatedOrmEntity extends BaseIdOrmEntity {
  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;
}
