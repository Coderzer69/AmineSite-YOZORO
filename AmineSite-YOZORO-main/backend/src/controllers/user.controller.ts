import type { Request, Response, NextFunction } from "express";
import { db } from "../config/db.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors.js";

export class UserController {
  async getWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await db.watchlist.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: "desc" },
        include: {
          anime: {
            include: { genres: { include: { genre: true } } },
          },
        },
      });

      const formatted = items.map((w) => ({
        id: w.anime.id,
        title: w.anime.title,
        japanese: w.anime.japanese,
        synopsis: w.anime.synopsis,
        type: w.anime.type,
        status: w.anime.status,
        year: w.anime.year,
        season: w.anime.season,
        episodes: w.anime.episodes,
        aired: w.anime.aired,
        duration: w.anime.duration,
        rating: w.anime.rating,
        genres: w.anime.genres.map((g) => g.genre.name),
        studio: w.anime.studio,
        hue: w.anime.hue,
        poster: w.anime.poster,
        banner: w.anime.banner,
        savedAt: w.createdAt,
      }));

      res.json(formatted);
    } catch (err) {
      next(err);
    }
  }

  async addToWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId } = req.params;
      const anime = await db.anime.findUnique({ where: { id: animeId } });
      if (!anime) throw new NotFoundError("Anime not found");

      await db.watchlist.upsert({
        where: { userId_animeId: { userId: req.user!.id, animeId } },
        update: {},
        create: { userId: req.user!.id, animeId },
      });

      res.status(201).json({ success: true, inWatchlist: true });
    } catch (err) {
      next(err);
    }
  }

  async removeFromWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId } = req.params;
      await db.watchlist.deleteMany({
        where: { userId: req.user!.id, animeId },
      });

      res.json({ success: true, inWatchlist: false });
    } catch (err) {
      next(err);
    }
  }

  async checkWatchlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId } = req.params;
      const exists = await db.watchlist.findUnique({
        where: { userId_animeId: { userId: req.user!.id, animeId } },
      });

      res.json({ inWatchlist: !!exists });
    } catch (err) {
      next(err);
    }
  }

  async getProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await db.watchProgress.findMany({
        where: { userId: req.user!.id },
        orderBy: { updatedAt: "desc" },
        include: {
          anime: { select: { id: true, title: true, poster: true, episodes: true } },
        },
      });

      res.json(progress);
    } catch (err) {
      next(err);
    }
  }

  async saveProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { animeId, episodeNumber, positionSeconds, durationSeconds } = req.body;
      const pos = Number(positionSeconds) || 0;
      const dur = Number(durationSeconds) || 0;
      const isCompleted = dur > 0 && pos / dur > 0.9;

      const record = await db.watchProgress.upsert({
        where: {
          userId_animeId_episodeNumber: {
            userId: req.user!.id,
            animeId,
            episodeNumber: Number(episodeNumber),
          },
        },
        update: {
          positionSeconds: pos,
          durationSeconds: dur,
          isCompleted,
        },
        create: {
          userId: req.user!.id,
          animeId,
          episodeNumber: Number(episodeNumber),
          positionSeconds: pos,
          durationSeconds: dur,
          isCompleted,
        },
      });

      res.json({ success: true, progress: record });
    } catch (err) {
      next(err);
    }
  }

  async toggleLikeComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const comment = await db.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundError("Comment not found");

      const existingReaction = await db.commentReaction.findUnique({
        where: { commentId_userId: { commentId: id, userId: req.user!.id } },
      });

      let liked = false;
      if (existingReaction) {
        await db.commentReaction.delete({
          where: { id: existingReaction.id },
        });
        liked = false;
      } else {
        await db.commentReaction.create({
          data: { commentId: id, userId: req.user!.id },
        });
        liked = true;
      }

      const totalLikes = await db.commentReaction.count({ where: { commentId: id } });
      res.json({ success: true, id, likes: totalLikes, liked });
    } catch (err) {
      next(err);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const comment = await db.comment.findUnique({ where: { id } });
      if (!comment) throw new NotFoundError("Comment not found");

      if (comment.userId !== req.user!.id && req.user!.role !== "ADMIN") {
        throw new ForbiddenError("You cannot delete this comment");
      }

      await db.comment.delete({ where: { id } });
      res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();

