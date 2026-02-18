import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class TypeormStartupCheckService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await this.dataSource.query("SELECT uuidv7()");
    } catch {
      throw new Error(
        "PostgreSQL에서 uuidv7() 함수를 찾을 수 없습니다. DB 버전/확장을 확인해주세요.",
      );
    }
  }
}
