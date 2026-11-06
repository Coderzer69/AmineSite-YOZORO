import { Router } from "express";
import { animeController } from "../controllers/anime.controller.js";
import { authenticate, requireAuth } from "../middleware/auth.js";

const router = Router();

// Public Discovery Endpoints
router.get("/spotlight", animeController.getSpotlight);
router.get("/trending", animeController.getTrending);
router.get("/recent", animeController.getRecentlyUpdated);
router.get("/top-airing", animeController.getTopAiring);
router.get("/popular", animeController.getMostPopular);
router.get("/top10", animeController.getTop10);
router.get("/genres", animeController.getGenres);
router.get("/search", animeController.search);
router.get("/browse", animeController.browse);
router.get("/schedule", animeController.getSchedule);

// Specific Anime Endpoints
router.get("/:id", animeController.getById);
router.get("/:id/episodes", animeController.getEpisodes);
router.get("/:id/recommendations", animeController.getRecommendations);

// Comments Endpoints
router.get("/:id/episodes/:ep/comments", animeController.getComments);
router.post(
  "/:id/episodes/:ep/comments",
  authenticate,
  requireAuth,
  animeController.createComment,
);

export const animeRoutes = router;

