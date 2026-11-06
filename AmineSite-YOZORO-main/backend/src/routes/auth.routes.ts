import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { authenticate, requireAuth } from "../middleware/auth.js";
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

// Rate limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 15, // 15 attempts
  message: { success: false, error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, validate({ body: registerSchema }), authController.register);
router.post("/login", authLimiter, validate({ body: loginSchema }), authController.login);
router.post("/logout", authenticate, requireAuth, authController.logout);
router.get("/me", authenticate, requireAuth, authController.me);
router.post(
  "/change-password",
  authenticate,
  requireAuth,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);

export const authRoutes = router;

