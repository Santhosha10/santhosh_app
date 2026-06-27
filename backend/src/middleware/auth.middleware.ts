import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from "../config/authConfig.js";
import { prisma } from "../config/databaseConfig.js";
import { AuthenticatedRequest } from "../types/auth.js";

type JwtPayload = {
  id: number;
  sessionId: string;
  type: "access";
};

class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;

      if (payload.type !== "access" || !payload.sessionId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const session = await prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          user_id: payload.id,
          revoked_at: null,
          expires_at: { gt: new Date() },
        },
        select: { id: true },
      });

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      (req as AuthenticatedRequest).user = {
        id: payload.id,
        sessionId: payload.sessionId,
      };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
}

export const authMiddleware = new AuthMiddleware();
