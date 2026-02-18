import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  authLoginRequestSchema,
  authLoginResponseSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  type AuthLoginRequest,
} from "@workspace/shared/auth";
import type { CookieOptions, Response } from "express";

import { ENV_KEYS, type AppEnv } from "../../../common/config/env.types.js";
import { ZodValidationPipe } from "../../../common/pipes/zod-validation.pipe.js";
import type { AuthJwtPayload } from "../auth.types.js";
import { ACCESS_TOKEN_MAX_AGE_MS, AUTH_COOKIE_NAME } from "../constants/auth.constants.js";
import { AuthJwtPayloadDecorator } from "../decorators/auth-jwt-payload.decorator.js";
import { AuthGuard } from "../guards/auth.guard.js";
import { AuthService } from "../services/auth.service.js";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  @Post("login")
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(authLoginRequestSchema)) payload: AuthLoginRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, accessToken } = await this.authService.login(payload);
    response.cookie(AUTH_COOKIE_NAME, accessToken, this.getAuthCookieOptions());

    return authLoginResponseSchema.parse(user);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@AuthJwtPayloadDecorator() authJwtPayload: AuthJwtPayload) {
    const me = await this.authService.getMe(authJwtPayload.sub);
    return authMeResponseSchema.parse(me);
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.cookie(AUTH_COOKIE_NAME, "", {
      ...this.getAuthCookieOptions(),
      maxAge: 0,
    });

    return authLogoutResponseSchema.parse({});
  }

  private getAuthCookieOptions(): CookieOptions {
    const nodeEnv = this.configService.getOrThrow<string>(ENV_KEYS.NODE_ENV);

    return {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
      secure: nodeEnv === "production",
    };
  }
}
