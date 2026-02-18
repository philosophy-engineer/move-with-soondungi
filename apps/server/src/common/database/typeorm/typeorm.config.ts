import type { ConfigService } from "@nestjs/config";
import type { TypeOrmModuleOptions } from "@nestjs/typeorm";
import type { DataSourceOptions } from "typeorm";
import { ENV_KEYS, type AppEnv } from "../../config/env.types.js";
import { PostOrmEntity } from "../../../features/posts/repositories/typeorm/entities/post.orm-entity.js";
import { UploadSessionOrmEntity } from "../../../features/uploads/repositories/typeorm/entities/upload-session.orm-entity.js";
import { UploadedImageOrmEntity } from "../../../features/uploads/repositories/typeorm/entities/uploaded-image.orm-entity.js";

export const TYPEORM_ENTITIES = [
  PostOrmEntity,
  UploadSessionOrmEntity,
  UploadedImageOrmEntity,
] as const;

export function createTypeOrmDataSourceOptions(env: AppEnv): DataSourceOptions {
  return {
    type: "postgres",
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    entities: [...TYPEORM_ENTITIES],
    synchronize: false,
    migrationsRun: false,
  };
}

export function createTypeOrmOptions(
  configService: ConfigService<AppEnv, true>,
): TypeOrmModuleOptions {
  return createTypeOrmDataSourceOptions({
    NODE_ENV: configService.getOrThrow(ENV_KEYS.NODE_ENV),
    PORT: configService.getOrThrow(ENV_KEYS.PORT),
    WEB_ORIGIN: configService.getOrThrow(ENV_KEYS.WEB_ORIGIN),
    SERVER_PUBLIC_ORIGIN: configService.getOrThrow(ENV_KEYS.SERVER_PUBLIC_ORIGIN),
    S3_ENDPOINT_URL: configService.getOrThrow(ENV_KEYS.S3_ENDPOINT_URL),
    S3_REGION: configService.getOrThrow(ENV_KEYS.S3_REGION),
    S3_ACCESS_KEY_ID: configService.getOrThrow(ENV_KEYS.S3_ACCESS_KEY_ID),
    S3_SECRET_ACCESS_KEY: configService.getOrThrow(ENV_KEYS.S3_SECRET_ACCESS_KEY),
    S3_BUCKET: configService.getOrThrow(ENV_KEYS.S3_BUCKET),
    S3_FORCE_PATH_STYLE: configService.getOrThrow(ENV_KEYS.S3_FORCE_PATH_STYLE),
    S3_PUBLIC_BASE_URL: configService.getOrThrow(ENV_KEYS.S3_PUBLIC_BASE_URL),
    DB_HOST: configService.getOrThrow(ENV_KEYS.DB_HOST),
    DB_PORT: configService.getOrThrow(ENV_KEYS.DB_PORT),
    DB_USER: configService.getOrThrow(ENV_KEYS.DB_USER),
    DB_PASSWORD: configService.getOrThrow(ENV_KEYS.DB_PASSWORD),
    DB_NAME: configService.getOrThrow(ENV_KEYS.DB_NAME),
  });
}
