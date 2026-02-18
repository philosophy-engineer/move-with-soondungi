import { PrimaryColumn } from "typeorm";

export abstract class BaseIdOrmEntity {
  @PrimaryColumn("uuid", {
    name: "id",
    default: () => "uuidv7()",
  })
  id!: string;
}
