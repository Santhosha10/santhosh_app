import { env } from "./env.js";

export const serverConfig = {
  port: env.port,
  host: "0.0.0.0",
  corsOrigin: env.frontendUrl,
};
