import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);

const startServer = async () => {
  try {
    app.listen(port, () => {
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

process.on("SIGINT", () => {
  process.exit(0);
});
