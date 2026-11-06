import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";

const router = Router();

// Enforce Admin access on all routes
router.use(authenticate, requireRole(Role.ADMIN));

// Dashboard Stats
router.get("/stats", adminController.getDashboardStats);

// User Management
router.get("/users", adminController.listUsers);
router.patch("/users/:userId/status", adminController.updateUserStatus);

// Invitations
router.get("/invitations", adminController.listInvitations);
router.post("/invitations", adminController.createInvitation);

// Metadata Import
router.get("/metadata/search", adminController.searchAniList);
router.post("/metadata/import", adminController.importAniList);

// Episodes Publishing
router.patch("/episodes/:episodeId/publish", adminController.togglePublishEpisode);

// Jobs Management
router.get("/jobs", adminController.listJobs);
router.post("/jobs/:jobId/retry", adminController.retryJob);

// Licensing
router.get("/licenses", adminController.listLicenses);
router.post("/licenses", adminController.createLicense);

export const adminRoutes = router;

