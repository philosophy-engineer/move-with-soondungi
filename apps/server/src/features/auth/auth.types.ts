export type AuthJwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};
