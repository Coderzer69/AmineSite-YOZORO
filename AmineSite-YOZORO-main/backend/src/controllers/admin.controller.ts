import type { Request, Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { invitationService } from "../services/invitation.service.js";
import { anilistClient } from "../integrations/anilist.js";
import { jobService } from "../services/job.service.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { Role, UserStatus, JobStatus } from "@prisma/client";

export class AdminController {
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        activeSessions,
        totalAnime,
        totalEpisodes,
        totalJobs,
        pendingJobs,
      ] = await Promise.all([
        db.user.count(),
        db.session.count({ where: { expiresAt: { gt: new Date() } } }),
        db.anime.count(),
        db.episode.count(),
        db.transcodeJob.count(),
        db.transcodeJob.count({
          where: { status: { in: [JobStatus.QUEUED, JobStatus.PROCESSING] } },
        }),
      ]);

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeSessions,
          totalAnime,
          totalEpisodes,
          totalJobs,
          pendingJobs,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        db.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            _count: { select: { sessions: true, watchlist: true } },
          },
        }),
        db.user.count(),
      ]);

      res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!["ACTIVE", "SUSPENDED"].includes(status)) {
        throw new BadRequestError("Invalid status value");
      }

      const user = await db.user.update({
        where: { id: userId },
        data: { status: status as UserStatus },
      });

      res.json({ success: true, user: { id: user.id, status: user.status } });
    } catch (err) {
      next(err);
    }
  }

  async listInvitations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await invitationService.listInvitations((page - 1) * limit, limit);
      res.json({ success: true, ...result, page });
    } catch (err) {
      next(err);
    }
  }

  async createInvitation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = Number(req.body.daysValid) || 30;
      const invitation = await invitationService.createInvitation(req.user!.id, days);
      res.status(201).json({ success: true, invitation });
    } catch (err) {
      next(err);
    }
  }

  async searchAniList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query.q || "").trim();
      if (!q) throw new BadRequestError("Search query parameter 'q' is required");
      const results = await anilistClient.search(q);
      res.json({ success: true, results });
    } catch (err) {
      next(err);
    }
  }

  async importAniList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { anilistId, slug } = req.body;
      if (!anilistId) throw new BadRequestError("anilistId is required");

      const media = await anilistClient.getById(Number(anilistId));
      if (!media) throw new NotFoundError("AniList media not found");

      const anime = await anilistClient.importMediaToDatabase(media, slug);
      res.status(201).json({ success: true, anime });
    } catch (err) {
      next(err);
    }
  }

  async togglePublishEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { episodeId } = req.params;
      const episode = await db.episode.findUnique({ where: { id: episodeId } });
      if (!episode) throw new NotFoundError("Episode not found");

      const updated = await db.episode.update({
        where: { id: episodeId },
        data: { isPublished: !episode.isPublished },
      });

      res.json({ success: true, episode: updated });
    } catch (err) {
      next(err);
    }
  }

  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as JobStatus | undefined;
      const jobs = await db.transcodeJob.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          episode: { select: { id: true, number: true, title: true, animeId: true } },
          uploadAsset: true,
        },
      });

      res.json({ success: true, jobs });
    } catch (err) {
      next(err);
    }
  }

  async retryJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await jobService.retryJob(jobId);
      res.json({ success: true, job });
    } catch (err) {
      next(err);
    }
  }

  async listLicenses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const licenses = await db.contentLicense.findMany({
        include: { anime: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, licenses });
    } catch (err) {
      next(err);
    }
  }

  async createLicense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId, licensor, licenseType, territory, validFrom, validTo, notes } = req.body;
      const license = await db.contentLicense.create({
        data: {
          animeId,
          licensor,
          licenseType: licenseType || "Exclusive Streaming",
          territory: territory || "Worldwide",
          validFrom: new Date(validFrom),
          validTo: validTo ? new Date(validTo) : null,
          notes,
        },
      });
      res.status(201).json({ success: true, license });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();

