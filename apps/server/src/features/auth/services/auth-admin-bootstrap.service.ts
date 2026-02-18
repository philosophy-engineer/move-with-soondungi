import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";

import { ENV_KEYS, type AppEnv } from "../../../common/config/env.types.js";
import { AUTH_PASSWORD_BCRYPT_ROUNDS } from "../constants/auth.constants.js";
import { User } from "../entities/user.entity.js";
import {
  AUTH_USERS_REPOSITORY,
  type AuthUsersRepository,
} from "../repositories/auth-users.repository.js";

@Injectable()
export class AuthAdminBootstrapService implements OnModuleInit {
  constructor(
    @Inject(AUTH_USERS_REPOSITORY)
    private readonly authUsersRepository: AuthUsersRepository,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminEmail = this.configService.getOrThrow<string>(ENV_KEYS.AUTH_ADMIN_LOGIN_ID);
    const adminPassword = this.configService.getOrThrow<string>(ENV_KEYS.AUTH_ADMIN_PASSWORD);

    const found = await this.authUsersRepository.findByEmail(adminEmail);

    if (found) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, AUTH_PASSWORD_BCRYPT_ROUNDS);
    const now = new Date().toISOString();

    await this.authUsersRepository.save(
      User.create({
        email: adminEmail,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }
}
