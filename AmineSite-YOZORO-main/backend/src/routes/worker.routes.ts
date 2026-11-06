import { Router } from "express";
import { workerController } from "../controllers/worker.controller.js";
import { requireWorkerAuth } from "../middleware/auth.js";

const router = Router();

// Worker API endpoints protected with X-Worker-Key header
router.use(requireWorkerAuth);

router.post("/jobs/claim", workerController.claim);
router.post("/jobs/:jobId/progress", workerController.progress);
router.post("/jobs/:jobId/complete", workerController.complete);
router.post("/jobs/:jobId/fail", workerController.fail);

export const workerRoutes = router;

