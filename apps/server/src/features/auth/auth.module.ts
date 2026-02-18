import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthController } from "./controllers/auth.controller.js";
import { AuthGuard } from "./guards/auth.guard.js";
import { AUTH_USERS_REPOSITORY } from "./repositories/auth-users.repository.js";
import { AuthUsersTypeormRepository } from "./repositories/auth-users.typeorm.repository.js";
import { UserOrmEntity } from "./repositories/typeorm/entities/user.orm-entity.js";
import { AuthAdminBootstrapService } from "./services/auth-admin-bootstrap.service.js";
import { AuthService } from "./services/auth.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity]), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    AuthAdminBootstrapService,
    {
      provide: AUTH_USERS_REPOSITORY,
      useClass: AuthUsersTypeormRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
