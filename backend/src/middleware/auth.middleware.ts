import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/auth.js";

type JwtPayload = {
  id: number;
};

const getJwtSecret = () => {
  const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

class AuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : undefined;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;

      (req as AuthenticatedRequest).user = { id: payload.id };
      return next();
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
}

export const authMiddleware = new AuthMiddleware();
