import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const url = new URL(env.databaseUrl);
const adapterConfig = {
  host: url.hostname,
  port: url.port ? Number(url.port) : 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\//, "")),
  connectionLimit: env.isProduction ? env.dbConnectionLimit : undefined,
  allowPublicKeyRetrieval: true,
};

const adapter = new PrismaMariaDb(adapterConfig);

export const prisma = new PrismaClient({
  adapter,
  omit: {
    user: {
      password: true,
    },
  },
});
