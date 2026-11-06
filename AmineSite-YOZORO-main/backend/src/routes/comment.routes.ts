import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireAuth);

router.post("/:id/like", userController.toggleLikeComment);
router.delete("/:id", userController.deleteComment);

export const commentRoutes = router;

