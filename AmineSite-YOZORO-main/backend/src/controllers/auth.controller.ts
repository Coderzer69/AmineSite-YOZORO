import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { env } from "../config/env.js";

function setSessionCookie(res: Response, token: string) {
  res.cookie("yozoro_session", token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: env.SESSION_TTL_HOURS * 60 * 60 * 1000,
    path: "/",
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie("yozoro_session", {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/",
  });
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, invitationCode } = req.body;
      const result = await authService.register({
        username,
        email,
        password,
        invitationCode,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      setSessionCookie(res, result.sessionToken);
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.sessionToken, // Also return in body for mobile or bearer token clients
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({
        email,
        password,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      setSessionCookie(res, result.sessionToken);
      res.json({
        success: true,
        user: result.user,
        token: result.sessionToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.sessionToken) {
        await authService.logout(req.sessionToken);
      }
      clearSessionCookie(res);
      res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      user: req.user,
    });
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, oldPassword, newPassword);
      clearSessionCookie(res);
      res.json({ success: true, message: "Password updated successfully. Please sign in again." });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

