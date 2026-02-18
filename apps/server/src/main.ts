import "reflect-metadata"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "./app.module.js"

function resolvePort(): number {
  const raw = process.env.PORT ?? "4000"
  const parsed = Number(raw)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT 값이 올바르지 않습니다.")
  }

  return parsed
}

function resolveServerPublicOrigin(port: number): string {
  const configured = process.env.SERVER_PUBLIC_ORIGIN?.trim()

  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("운영 환경에서는 SERVER_PUBLIC_ORIGIN 환경변수가 필수입니다.")
  }

  return `http://localhost:${port}`
}

async function bootstrap() {
  const port = resolvePort()
  // TODO: 필요 시 WEB_ORIGIN을 콤마 구분 다중 origin으로 확장
  const webOrigin = process.env.WEB_ORIGIN?.trim() || "http://localhost:3000"
  const serverPublicOrigin = resolveServerPublicOrigin(port)

  process.env.SERVER_PUBLIC_ORIGIN = serverPublicOrigin

  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: webOrigin,
    credentials: true,
  })

  await app.listen(port)
}

void bootstrap()
