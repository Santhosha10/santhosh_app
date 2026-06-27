import "dotenv/config";

const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key] || fallback;

  if (!value) {
    throw new Error(`${key} is not configured`);
  }

  return value;
};

const getNumberEnv = (key: string, fallback: number) => {
  const value = process.env[key];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`${key} must be a number`);
  }

  return parsed;
};

const nodeEnv = getEnv("NODE_ENV", "development");

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: getNumberEnv("PORT", 3000),
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:5173"),
  databaseUrl: getEnv("DATABASE_URL"),
  dbConnectionLimit: getNumberEnv("DB_CONNECTION_LIMIT", 5),
  jwtSecret: getEnv("JWT_SECRET"),
  bcryptSaltRounds: getNumberEnv("BCRYPT_SALT_ROUNDS", 10),
  accessTokenTtl: getEnv("ACCESS_TOKEN_TTL", "15m"),
  refreshTokenDays: getNumberEnv("REFRESH_TOKEN_DAYS", 30),
  logAuthTimings: getEnv("LOG_AUTH_TIMINGS", "false") === "true",
};
