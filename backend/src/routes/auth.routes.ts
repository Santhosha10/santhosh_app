// routes/auth.routes.ts

import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/register", authController.register);
authRoutes.get("/me", authMiddleware.authenticate, authController.me);

export default authRoutes;
