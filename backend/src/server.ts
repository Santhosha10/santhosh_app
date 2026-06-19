import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { prisma } from "./dbconfig/prisma.js";

const app = express();
const port = Number(process.env["PORT"] || 3000);
const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api/auth", authRoutes);

const startServer = async () => {
  try {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (err) => {
  console.error(err);
});

process.on("unhandledRejection", (reason) => {
  console.error(reason);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
