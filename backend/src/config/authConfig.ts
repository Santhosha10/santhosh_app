import type { CookieOptions } from "express";
import type { SignOptions } from "jsonwebtoken";
import { env } from "./env.js";

export const authConfig = {
  jwtSecret: env.jwtSecret,
  bcryptSaltRounds: env.bcryptSaltRounds,
  accessTokenExpiresIn: env.accessTokenTtl as SignOptions["expiresIn"],
  refreshTokenDays: env.refreshTokenDays,
  refreshTokenCookieName: "refresh_token",
  logAuthTimings: env.logAuthTimings,
  refreshTokenCookieOptions: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000,
  } satisfies CookieOptions,
  clearRefreshTokenCookieOptions: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/api/auth",
  } satisfies CookieOptions,
};
