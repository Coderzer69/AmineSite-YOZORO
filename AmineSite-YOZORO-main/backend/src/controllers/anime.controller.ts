import type { Request, Response, NextFunction } from "express";
import { animeRepository } from "../repositories/anime.repository.js";
import { NotFoundError, BadRequestError } from "../utils/errors.js";
import { db } from "../config/db.js";

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  const days = Math.floor(diffSec / 86400);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

export class AnimeController {
  async getSpotlight(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getSpotlight(5);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getTrending(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getTrending(10);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getRecentlyUpdated(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getRecentlyUpdated(10);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getTopAiring(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getTopAiring(10);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getMostPopular(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getMostPopular(10);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getTop10(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = (req.query.period as "day" | "week" | "month") || "day";
      const items = await animeRepository.getTop10(period);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getGenres(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const genres = await animeRepository.getGenres();
      res.json(genres);
    } catch (err) {
      next(err);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = String(req.query.q || "");
      const limit = Number(req.query.limit) || 6;
      const items = await animeRepository.searchAnime(q, limit);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async browse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, genre, year, season, type, status, page } = req.query;
      const result = await animeRepository.browseAnime({
        q: q ? String(q) : undefined,
        genre: genre ? String(genre) : undefined,
        year: year ? Number(year) : undefined,
        season: season ? (season as any) : undefined,
        type: type ? (type as any) : undefined,
        status: status ? (status as any) : undefined,
        page: page ? Number(page) : 1,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getSchedule(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schedule = await animeRepository.getSchedule();
      res.json(schedule);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const anime = await animeRepository.getAnimeById(req.params.id);
      if (!anime) throw new NotFoundError("Anime not found");
      res.json(anime);
    } catch (err) {
      next(err);
    }
  }

  async getEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const episodes = await animeRepository.getEpisodes(req.params.id);
      res.json(episodes);
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await animeRepository.getRecommendations(req.params.id);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const animeId = req.params.id;
      const episode = Number(req.params.ep) || 1;

      const comments = await db.comment.findMany({
        where: { animeId, episodeNumber: episode },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true } },
          _count: { select: { reactions: true } },
        },
      });

      const formatted = comments.map((c) => ({
        id: c.id,
        author: c.user.username,
        text: c.text,
        time: formatRelativeTime(c.createdAt),
        likes: c._count.reactions,
      }));

      res.json(formatted);
    } catch (err) {
      next(err);
    }
  }

  async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const animeId = req.params.id;
      const episode = Number(req.params.ep) || 1;
      const text = String(req.body.text || "").trim();

      if (!text) throw new BadRequestError("Comment text is required");
      if (text.length > 500) throw new BadRequestError("Comment exceeds 500 characters");

      const comment = await db.comment.create({
        data: {
          userId: req.user!.id,
          animeId,
          episodeNumber: episode,
          text,
        },
        include: {
          user: { select: { username: true } },
        },
      });

      res.status(201).json({
        id: comment.id,
        author: comment.user.username,
        text: comment.text,
        time: "Just now",
        likes: 0,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const animeController = new AnimeController();

