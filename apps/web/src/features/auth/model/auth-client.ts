import {
  authLoginRequestSchema,
  authLoginResponseSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  type AuthLoginRequest,
} from "@workspace/shared/auth";

import { apiRoutes } from "@/src/shared/config/routes";
import { getJson, postJson } from "@/src/shared/lib/http";

export function loginAdmin(payload: AuthLoginRequest) {
  const parsedPayload = authLoginRequestSchema.parse(payload);

  return postJson(apiRoutes.authLogin, parsedPayload, authLoginResponseSchema, {
    credentials: "include",
  });
}

export function fetchAdminMe() {
  return getJson(apiRoutes.authMe, authMeResponseSchema, {
    credentials: "include",
    cache: "no-store",
  });
}

export function logoutAdmin() {
  return postJson(apiRoutes.authLogout, {}, authLogoutResponseSchema, {
    credentials: "include",
  });
}
