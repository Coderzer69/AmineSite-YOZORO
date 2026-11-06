import { Router } from "express";
import { uploadController } from "../controllers/upload.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { Role } from "@prisma/client";

const router = Router();

// Local dev direct storage receiver
router.put("/direct-storage/:bucketName/:objectName", uploadController.handleLocalDirectUpload);
router.post("/direct-storage/:bucketName/:objectName", uploadController.handleLocalDirectUpload);

// Admin Upload Workflow
router.post("/initiate", authenticate, requireRole(Role.ADMIN), uploadController.initiate);
router.post("/:uploadId/complete", authenticate, requireRole(Role.ADMIN), uploadController.complete);
router.get("/:uploadId/status", authenticate, requireRole(Role.ADMIN), uploadController.getStatus);

export const uploadRoutes = router;

