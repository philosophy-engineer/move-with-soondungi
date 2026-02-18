import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { AuthLoginRequest, AuthUser } from "@workspace/shared/auth";
import bcrypt from "bcrypt";

import { ENV_KEYS, type AppEnv } from "../../../common/config/env.types.js";
import { throwUnauthorized } from "../../../common/errors/error-response.js";
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  AUTH_FAILED_MESSAGE,
} from "../constants/auth.constants.js";
import type { AuthJwtPayload } from "../auth.types.js";
import {
  AUTH_USERS_REPOSITORY,
  type AuthUsersRepository,
} from "../repositories/auth-users.repository.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_USERS_REPOSITORY)
    private readonly authUsersRepository: AuthUsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async login(payload: AuthLoginRequest): Promise<{ user: AuthUser; accessToken: string }> {
    const found = await this.authUsersRepository.findByEmail(payload.email);

    if (!found) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    const isMatched = await bcrypt.compare(payload.password, found.passwordHash);

    if (!isMatched) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    const accessToken = await this.createAccessToken(found);

    return {
      user: this.toAuthUser(found),
      accessToken,
    };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const found = await this.authUsersRepository.findById(userId);

    if (!found) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    return this.toAuthUser(found);
  }

  async verifyAccessToken(token: string): Promise<AuthJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
        secret: this.getJwtSecret(),
      });

      if (!payload?.sub || !payload.email) {
        throwUnauthorized(AUTH_FAILED_MESSAGE);
      }

      return payload;
    } catch {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }
  }

  private async createAccessToken(user: { userId?: string; email: string }): Promise<string> {
    if (!user.userId) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    return this.jwtService.signAsync(
      {
        sub: user.userId,
        email: user.email,
      },
      {
        secret: this.getJwtSecret(),
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      },
    );
  }

  private toAuthUser(user: { userId?: string; email: string }): AuthUser {
    if (!user.userId) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    return {
      userId: user.userId,
      email: user.email,
    };
  }

  private getJwtSecret() {
    return this.configService.getOrThrow<string>(ENV_KEYS.JWT_SECRET);
  }
}
