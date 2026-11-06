import { db } from "../config/db.js";
import type {
  Anime,
  AnimeType,
  AnimeStatus,
  BroadcastSeason,
  Episode,
} from "@prisma/client";

export interface FrontendAnime {
  id: string;
  title: string;
  japanese: string;
  synopsis: string;
  type: AnimeType;
  status: AnimeStatus;
  year: number;
  season: BroadcastSeason;
  episodes: number;
  aired: number;
  duration: string;
  rating: number;
  genres: string[];
  studio: string;
  hue: number;
  poster: string;
  banner: string;
}

export interface BrowseFilters {
  q?: string;
  genre?: string;
  year?: number;
  season?: BroadcastSeason;
  type?: AnimeType;
  status?: AnimeStatus;
  page?: number;
  limit?: number;
}

export interface BrowseResult {
  items: FrontendAnime[];
  total: number;
  pages: number;
  page: number;
}

function formatAnime(
  anime: Anime & { genres?: { genre: { name: string } }[] },
): FrontendAnime {
  return {
    id: anime.id,
    title: anime.title,
    japanese: anime.japanese,
    synopsis: anime.synopsis,
    type: anime.type,
    status: anime.status,
    year: anime.year,
    season: anime.season,
    episodes: anime.episodes,
    aired: anime.aired,
    duration: anime.duration,
    rating: anime.rating,
    genres: anime.genres ? anime.genres.map((g) => g.genre.name) : [],
    studio: anime.studio,
    hue: anime.hue,
    poster: anime.poster,
    banner: anime.banner,
  };
}

export class AnimeRepository {
  async getSpotlight(limit = 5): Promise<FrontendAnime[]> {
    const list = await db.anime.findMany({
      take: limit,
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });
    return list.map(formatAnime);
  }

  async getTrending(limit = 10): Promise<FrontendAnime[]> {
    const list = await db.anime.findMany({
      take: limit,
      where: { status: "Airing" },
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });
    return list.map(formatAnime);
  }

  async getRecentlyUpdated(limit = 10): Promise<FrontendAnime[]> {
    const list = await db.anime.findMany({
      take: limit,
      where: { status: "Airing" },
      orderBy: { updatedAt: "desc" },
      include: { genres: { include: { genre: true } } },
    });
    return list.map(formatAnime);
  }

  async getTopAiring(limit = 10): Promise<FrontendAnime[]> {
    const list = await db.anime.findMany({
      take: limit,
      where: { status: "Airing" },
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });
    return list.map(formatAnime);
  }

  async getMostPopular(limit = 10): Promise<FrontendAnime[]> {
    const list = await db.anime.findMany({
      take: limit,
      orderBy: [{ rating: "desc" }, { episodes: "desc" }],
      include: { genres: { include: { genre: true } } },
    });
    return list.map(formatAnime);
  }

  async getTop10(period: "day" | "week" | "month" = "day"): Promise<FrontendAnime[]> {
    const shift = { day: 0, week: 3, month: 6 }[period] || 0;
    const all = await db.anime.findMany({
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });
    const rotated = [...all.slice(shift), ...all.slice(0, shift)].slice(0, 10);
    return rotated.map(formatAnime);
  }

  async getGenres(): Promise<string[]> {
    const genres = await db.genre.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    });
    return genres.map((g) => g.name);
  }

  async getAnimeById(id: string): Promise<FrontendAnime | null> {
    const anime = await db.anime.findUnique({
      where: { id },
      include: { genres: { include: { genre: true } } },
    });
    return anime ? formatAnime(anime) : null;
  }

  async getRecommendations(animeId: string, limit = 8): Promise<FrontendAnime[]> {
    const base = await db.anime.findUnique({
      where: { id: animeId },
      include: { genres: true },
    });

    if (!base || base.genres.length === 0) {
      const fallback = await db.anime.findMany({
        where: { id: { not: animeId } },
        take: limit,
        orderBy: { rating: "desc" },
        include: { genres: { include: { genre: true } } },
      });
      return fallback.map(formatAnime);
    }

    const genreIds = base.genres.map((g) => g.genreId);
    const related = await db.anime.findMany({
      where: {
        id: { not: animeId },
        genres: { some: { genreId: { in: genreIds } } },
      },
      take: limit,
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });

    return related.map(formatAnime);
  }

  async getEpisodes(animeId: string): Promise<Episode[]> {
    return db.episode.findMany({
      where: { animeId, isPublished: true },
      orderBy: { number: "asc" },
    });
  }

  async searchAnime(query: string, limit = 6): Promise<FrontendAnime[]> {
    const s = query.trim();
    if (!s) return [];

    const list = await db.anime.findMany({
      where: {
        OR: [
          { title: { contains: s, mode: "insensitive" } },
          { japanese: { contains: s, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { rating: "desc" },
      include: { genres: { include: { genre: true } } },
    });

    return list.map(formatAnime);
  }

  async browseAnime(filters: BrowseFilters): Promise<BrowseResult> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = filters.limit ?? 12;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters.q?.trim()) {
      where.OR = [
        { title: { contains: filters.q.trim(), mode: "insensitive" } },
        { japanese: { contains: filters.q.trim(), mode: "insensitive" } },
      ];
    }
    if (filters.genre) {
      where.genres = { some: { genre: { name: filters.genre } } };
    }
    if (filters.year) {
      where.year = filters.year;
    }
    if (filters.season) {
      where.season = filters.season;
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const [items, total] = await Promise.all([
      db.anime.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { rating: "desc" },
        include: { genres: { include: { genre: true } } },
      }),
      db.anime.count({ where }),
    ]);

    const pages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: items.map(formatAnime),
      total,
      pages,
      page,
    };
  }

  async getSchedule(): Promise<Record<string, Array<{ time: string; animeId: string; title: string; episode: number }>>> {
    const airing = await db.anime.findMany({
      where: { status: "Airing" },
      orderBy: { title: "asc" },
    });

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const times = ["09:30", "12:00", "17:45", "20:00", "23:30"];
    const out: Record<string, Array<{ time: string; animeId: string; title: string; episode: number }>> =
      Object.fromEntries(days.map((d) => [d, []]));

    airing.forEach((a, i) => {
      out[days[i % 7]].push({
        time: times[i % times.length],
        animeId: a.id,
        title: a.title,
        episode: a.aired,
      });
      out[days[(i * 3 + 2) % 7]].push({
        time: times[(i + 2) % times.length],
        animeId: a.id,
        title: a.title,
        episode: a.aired,
      });
    });

    days.forEach((d) => out[d].sort((x, y) => x.time.localeCompare(y.time)));
    return out;
  }
}

export const animeRepository = new AnimeRepository();

