import { loginSchema, registerSchema } from "../validators/auth.vaildator";
import jwt from "jsonwebtoken";

import { Request, Response } from "express";

const storageNotConfigured = (res: Response) =>
  res.status(501).json({
    error: "Authentication storage is not configured",
  });

export const authController = {
  login: async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.flatten(),
      });
    }

    return storageNotConfigured(res);
  },

  register: async (req: Request, res: Response) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }

    return storageNotConfigured(res);
  },

  me: async (req: Request, res: Response) => {
    return storageNotConfigured(res);
  },

  generateToken: async (userId: number) => {
    return jwt.sign({ id: userId }, process.env["JWT_SECRET"] as string, {
      expiresIn: "7d",
    });
  },
};
