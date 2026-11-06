import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireAuth);

// Watchlist
router.get("/watchlist", userController.getWatchlist);
router.post("/watchlist/:animeId", userController.addToWatchlist);
router.delete("/watchlist/:animeId", userController.removeFromWatchlist);
router.get("/watchlist/:animeId/check", userController.checkWatchlist);

// Playback Progress
router.get("/progress", userController.getProgress);
router.post("/progress", userController.saveProgress);

export const userRoutes = router;

