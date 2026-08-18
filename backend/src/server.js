import dns from "node:dns";
import app from "./app.js";
import { env, validateEnv } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";

// Some Windows networks resolve Atlas hostnames to an IPv6 address that then times out,
// which Node reports as a misleading ENOTFOUND. Preferring IPv4 avoids that flakiness.
dns.setDefaultResultOrder("ipv4first");

const startServer = async () => {
  validateEnv();
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`API base URL: http://localhost:${env.PORT}/api/v1`);
  });

  const shutdown = async (signal) => {
    logger.warn(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled rejection: ${reason}`);
    server.close(() => process.exit(1));
  });
};

startServer();
