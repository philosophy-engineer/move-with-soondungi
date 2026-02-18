import { DeleteDateColumn } from "typeorm";

import { BaseIdOrmEntity } from "./base-id-orm.entity.js";

export abstract class BaseIdDeletedOrmEntity extends BaseIdOrmEntity {
  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamptz",
    nullable: true,
  })
  deletedAt?: Date | null;
}
