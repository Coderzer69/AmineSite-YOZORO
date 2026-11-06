import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 YOZORO Backend running at http://localhost:${env.PORT}`);
  logger.info(`📑 Environment: ${env.NODE_ENV} | API Prefix: ${env.API_PREFIX}`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });

  setTimeout(() => {
    logger.error("Forcefully shutting down due to timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
