import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ENV_KEYS, type AppEnv } from "../../config/env.types.js";
import { createTypeOrmOptions } from "./typeorm.config.js";
import { TypeormStartupCheckService } from "./services/typeorm-startup-check.service.js";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppEnv, true>) => {
        const options = createTypeOrmOptions(configService);

        configService.getOrThrow<string>(ENV_KEYS.DB_HOST);
        configService.getOrThrow<number>(ENV_KEYS.DB_PORT);
        configService.getOrThrow<string>(ENV_KEYS.DB_USER);
        configService.getOrThrow<string>(ENV_KEYS.DB_PASSWORD);
        configService.getOrThrow<string>(ENV_KEYS.DB_NAME);

        return options;
      },
    }),
  ],
  providers: [TypeormStartupCheckService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
