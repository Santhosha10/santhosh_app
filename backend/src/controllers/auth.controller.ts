import { loginSchema, registerSchema } from "../validators/auth.vaildator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { authConfig } from "../config/authConfig.js";
import { prisma } from "../config/databaseConfig.js";

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  created_at: true,
  updated_at: true,
};

type AccessTokenPayload = {
  id: number;
  sessionId: string;
  type: "access";
};

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createRefreshToken = () => crypto.randomBytes(48).toString("base64url");

const getRefreshTokenExpiry = () =>
  new Date(Date.now() + authConfig.refreshTokenDays * 24 * 60 * 60 * 1000);

const getRequestIp = (req: Request) =>
  (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.ip || "")
    .trim()
    .slice(0, 45);

const getCookie = (req: Request, name: string) => {
  const cookies = req.headers.cookie?.split(";") ?? [];
  const prefix = `${name}=`;
  const cookie = cookies
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
};

const getRefreshTokenFromRequest = (req: Request) => {
  return getCookie(req, authConfig.refreshTokenCookieName);
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(
    authConfig.refreshTokenCookieName,
    refreshToken,
    authConfig.refreshTokenCookieOptions,
  );
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(
    authConfig.refreshTokenCookieName,
    authConfig.clearRefreshTokenCookieOptions,
  );
};

const createSession = async (userId: number, req: Request) => {
  const refreshToken = createRefreshToken();
  const session = await prisma.session.create({
    data: {
      user_id: userId,
      refresh_token_hash: hashToken(refreshToken),
      user_agent: req.headers["user-agent"]?.slice(0, 255),
      ip_address: getRequestIp(req),
      expires_at: getRefreshTokenExpiry(),
    },
    select: { id: true },
  });

  return { session, refreshToken };
};

const createAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.accessTokenExpiresIn,
  });

const createAuthResponse = async (
  user: { id: number; name: string; email: string },
  req: Request,
  res: Response,
) => {
  const { session, refreshToken } = await createSession(user.id, req);
  const accessToken = createAccessToken({
    id: user.id,
    sessionId: session.id,
    type: "access",
  });

  setRefreshTokenCookie(res, refreshToken);

  return {
    user,
    token: accessToken,
  };
};

export const authController = {
  login: async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }

    try {
      const dbStartedAt = Date.now();
      const user = await prisma.user.findUnique({
        where: { email: result.data.email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });
      const dbMs = Date.now() - dbStartedAt;

      if (!user) {
        if (authConfig.logAuthTimings) {
          console.log(
            `Login timing: db=${dbMs}ms total=${Date.now() - startedAt}ms user=missing`,
          );
        }

        return res.status(401).json({ error: "Invalid email or password" });
      }

      const bcryptStartedAt = Date.now();
      const isPasswordValid = await bcrypt.compare(
        result.data.password,
        user.password,
      );
      const bcryptMs = Date.now() - bcryptStartedAt;

      if (!isPasswordValid) {
        if (authConfig.logAuthTimings) {
          console.log(
            `Login timing: db=${dbMs}ms bcrypt=${bcryptMs}ms total=${Date.now() - startedAt}ms password=invalid`,
          );
        }

        return res.status(401).json({ error: "Invalid email or password" });
      }

      const sessionStartedAt = Date.now();
      const authResponse = await createAuthResponse(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        req,
        res,
      );
      const sessionMs = Date.now() - sessionStartedAt;

      if (authConfig.logAuthTimings) {
        console.log(
          `Login timing: db=${dbMs}ms bcrypt=${bcryptMs}ms session=${sessionMs}ms total=${Date.now() - startedAt}ms`,
        );
      }

      return res.json(authResponse);
    } catch (error) {
      console.error("Login failed", error);
      return res.status(500).json({ error: "Login failed" });
    }
  },

  register: async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: result.data.email },
        select: { id: true },
      });

      if (existingUser) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      const password = await bcrypt.hash(
        result.data.password,
        authConfig.bcryptSaltRounds,
      );
      const user = await prisma.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          password,
        },
        select: userSelect,
      });
      const authResponse = await createAuthResponse(user, req, res);

      return res.status(201).json(authResponse);
    } catch (error) {
      console.error("Registration failed", error);
      return res.status(500).json({ error: "Registration failed" });
    }
  },

  me: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: userSelect,
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Failed to fetch current user", error);
      return res.status(500).json({ error: "Failed to fetch current user" });
    }
  },

  refresh: async (req: Request, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is required" });
    }

    try {
      const session = await prisma.session.findUnique({
        where: { refresh_token_hash: hashToken(refreshToken) },
        select: {
          id: true,
          expires_at: true,
          revoked_at: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!session || session.revoked_at || session.expires_at <= new Date()) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const nextRefreshToken = createRefreshToken();
      await prisma.session.update({
        where: { id: session.id },
        data: {
          refresh_token_hash: hashToken(nextRefreshToken),
          expires_at: getRefreshTokenExpiry(),
        },
      });

      const accessToken = createAccessToken({
        id: session.user.id,
        sessionId: session.id,
        type: "access",
      });

      setRefreshTokenCookie(res, nextRefreshToken);

      return res.json({
        user: session.user,
        token: accessToken,
      });
    } catch (error) {
      console.error("Refresh failed", error);
      return res.status(500).json({ error: "Refresh failed" });
    }
  },

  logout: async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = getRefreshTokenFromRequest(req);
    const revokedAt = new Date();

    try {
      if (refreshToken) {
        await prisma.session.updateMany({
          where: {
            refresh_token_hash: hashToken(refreshToken),
            revoked_at: null,
          },
          data: { revoked_at: revokedAt },
        });
      } else if (req.user?.sessionId) {
        await prisma.session.updateMany({
          where: {
            id: req.user.sessionId,
            revoked_at: null,
          },
          data: { revoked_at: revokedAt },
        });
      }

      clearRefreshTokenCookie(res);
      return res.status(204).send();
    } catch (error) {
      console.error("Logout failed", error);
      return res.status(500).json({ error: "Logout failed" });
    }
  },

  logoutAll: async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      await prisma.session.updateMany({
        where: {
          user_id: userId,
          revoked_at: null,
        },
        data: { revoked_at: new Date() },
      });

      clearRefreshTokenCookie(res);
      return res.status(204).send();
    } catch (error) {
      console.error("Logout all failed", error);
      return res.status(500).json({ error: "Logout all failed" });
    }
  },

  generateToken: async (userId: number, sessionId: string) => {
    return createAccessToken({
      id: userId,
      sessionId,
      type: "access",
    });
  },
};
