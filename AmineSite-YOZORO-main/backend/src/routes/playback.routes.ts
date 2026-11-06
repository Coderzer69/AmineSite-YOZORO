import { Router } from "express";
import { playbackController } from "../controllers/playback.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Manifest endpoint (auth optional, respects episode publication)
router.get("/:animeId/:ep/manifest", authenticate, playbackController.getManifest);

// Token-secured HLS stream delivery
router.get("/stream/:token/master.m3u8", playbackController.getMasterPlaylist);
router.get("/stream/:token/:variant.m3u8", playbackController.getVariantPlaylist);
router.get("/stream/:token/:segment", playbackController.getSegment);

export const playbackRoutes = router;

