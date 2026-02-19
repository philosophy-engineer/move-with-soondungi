import "reflect-metadata";

import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";

import { ENV_KEYS, type AppEnv } from "./common/config/env.types.js";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<AppEnv, true>>(ConfigService);

  const port = configService.getOrThrow<number>(ENV_KEYS.PORT);
  // TODO: 필요 시 WEB_ORIGIN을 콤마 구분 다중 origin으로 확장
  const rawWebOrigin = configService.getOrThrow<string>(ENV_KEYS.WEB_ORIGIN);
  const webOrigin = new URL(rawWebOrigin).origin;

  app.enableCors({
    origin: webOrigin,
    credentials: true,
  });
  app.use(cookieParser());

  await app.listen(port);
}

void bootstrap();
