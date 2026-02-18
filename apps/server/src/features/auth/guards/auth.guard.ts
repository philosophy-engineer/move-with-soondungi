import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { throwUnauthorized } from "../../../common/errors/error-response.js";
import type { AuthJwtPayload } from "../auth.types.js";
import { AUTH_COOKIE_NAME, AUTH_FAILED_MESSAGE } from "../constants/auth.constants.js";
import { AuthService } from "../services/auth.service.js";

export type AuthenticatedRequest = Request & {
  authJwtPayload?: AuthJwtPayload;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (typeof token !== "string" || !token) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    request.authJwtPayload = await this.authService.verifyAccessToken(token);

    return true;
  }
}
