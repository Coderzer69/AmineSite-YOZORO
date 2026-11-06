import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      issues: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Operational App Errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, `[AppError ${err.statusCode}] ${err.message}`);
    } else {
      logger.warn({ statusCode: err.statusCode, details: err.details }, `[AppError] ${err.message}`);
    }

    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Unhandled / Internal Server Errors
  logger.error({ err }, "Unhandled server exception");
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    stack: env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

