import pino from "pino";
import { pinoHttp } from "pino-http";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV !== "production" && env.NODE_ENV !== "test"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie", "password", "token", "sessionSecret"],
    remove: true,
  },
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: env.NODE_ENV !== "test",
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});

