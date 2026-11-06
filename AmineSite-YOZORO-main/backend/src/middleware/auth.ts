import type { Request, Response, NextFunction } from "express";
import { sessionRepository } from "../repositories/session.repository.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";
import { env } from "../config/env.js";
import type { User, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "passwordHash">;
      sessionToken?: string;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token =
    req.cookies?.yozoro_session ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.substring(7)
      : undefined);

  if (!token) {
    return next();
  }

  try {
    const sessionWithUser = await sessionRepository.findSessionWithUser(token);
    if (sessionWithUser && sessionWithUser.user.status === "ACTIVE") {
      const { passwordHash: _, ...safeUser } = sessionWithUser.user;
      req.user = safeUser;
      req.sessionToken = token;
    }
  } catch (err) {
    // If DB fails, continue unauthenticated
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }
  next();
}

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }
    if (req.user.role !== role && req.user.role !== "ADMIN") {
      return next(new ForbiddenError("Insufficient permissions"));
    }
    next();
  };
}

export function requireWorkerAuth(req: Request, _res: Response, next: NextFunction): void {
  const workerKey = req.headers["x-worker-key"];
  if (!workerKey || workerKey !== env.WORKER_API_KEY) {
    return next(new UnauthorizedError("Invalid or missing worker API key"));
  }
  next();
}

