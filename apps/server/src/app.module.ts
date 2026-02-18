import { Module } from "@nestjs/common"

import { HealthController } from "./health/health.controller.js"
import { MockModule } from "./mock/mock.module.js"

@Module({
  imports: [MockModule],
  controllers: [HealthController],
})
export class AppModule {}
