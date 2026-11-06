import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { httpLogger } from "./utils/logger.js";
import { errorHandler } from "./middleware/error.js";
import { NotFoundError } from "./utils/errors.js";
import { registerRoutes } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images & HLS chunks
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin) || env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Worker-Key"],
    }),
  );

  // Body Parsing
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));
  app.use(cookieParser());

  // Logging
  app.use(httpLogger);

  // General Rate Limiter (skip in test environment)
  if (env.NODE_ENV !== "test") {
    const generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: "Too many requests, please try again later." },
    });
    app.use(generalLimiter);
  }

  // Health Checks
  const healthHandler = (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "yozoro-backend",
      environment: env.NODE_ENV,
    });
  };
  app.get("/health", healthHandler);
  app.get("/api/health", healthHandler);
  app.get(`${env.API_PREFIX}/health`, healthHandler);

  // Mount API Routes
  registerRoutes(app);

  // Catch-all 404 handler
  app.use((_req, _res, next) => {
    next(new NotFoundError("API endpoint does not exist"));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
