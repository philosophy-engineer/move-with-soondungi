import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import { throwUnauthorized } from "../../../common/errors/error-response.js";
import type { AuthJwtPayload } from "../auth.types.js";
import { AUTH_FAILED_MESSAGE } from "../constants/auth.constants.js";
import type { AuthenticatedRequest } from "../guards/auth.guard.js";

export const AuthJwtPayloadDecorator = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthJwtPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.authJwtPayload) {
      throwUnauthorized(AUTH_FAILED_MESSAGE);
    }

    return request.authJwtPayload;
  },
);
