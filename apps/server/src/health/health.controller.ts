import { Controller, Get } from "@nestjs/common"

const startedAtMs = Date.now()

@Controller()
export class HealthController {
  @Get("healthz")
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor((Date.now() - startedAtMs) / 1000),
    }
  }
}
