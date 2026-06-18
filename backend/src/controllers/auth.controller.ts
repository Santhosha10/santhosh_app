import { loginSchema, registerSchema } from "../validators/auth.vaildator.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../dbconfig/prisma.js";

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  created_at: true,
  updated_at: true,
};

const getJwtSecret = () => {
  const secret = process.env["JWT_SECRET"];

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
};

export const authController = {
  login: async (req: Request, res: Response) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        errors: result.error.issues,
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: result.data.email },
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(
        result.data.password,
        user.password,
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = await authController.generateToken(user.id);

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      });
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

      const password = await bcrypt.hash(result.data.password, 12);
      const user = await prisma.user.create({
        data: {
          name: result.data.name,
          email: result.data.email,
          password,
        },
        select: userSelect,
      });
      const token = await authController.generateToken(user.id);

      return res.status(201).json({ user, token });
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

  generateToken: async (userId: number) => {
    return jwt.sign({ id: userId }, getJwtSecret(), {
      expiresIn: "7d",
    });
  },
};
