import { db } from "../config/db.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { AnimeType, AnimeStatus, BroadcastSeason } from "@prisma/client";

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  format: string | null;
  status: string | null;
  startDate: {
    year: number | null;
  };
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  genres: string[];
  studios: {
    nodes: Array<{ name: string }>;
  };
  coverImage: {
    extraLarge: string | null;
    large: string | null;
    color: string | null;
  };
  bannerImage: string | null;
}

export class AniListClient {
  private apiUrl: string;

  constructor(apiUrl = env.ANILIST_API_URL) {
    this.apiUrl = apiUrl;
  }

  private async fetchGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error({ status: res.status, text }, "AniList GraphQL request failed");
      throw new Error(`AniList GraphQL error: ${res.statusText}`);
    }

    const data = (await res.json()) as any;
    if (data.errors) {
      logger.error({ errors: data.errors }, "AniList GraphQL response errors");
      throw new Error(data.errors[0]?.message || "AniList GraphQL error");
    }

    return data.data as T;
  }

  async search(query: string, limit = 10): Promise<AniListMedia[]> {
    const gql = `
      query ($search: String, $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji english native }
            description
            format
            status
            startDate { year }
            season
            seasonYear
            episodes
            duration
            averageScore
            genres
            studios(isMain: true) { nodes { name } }
            coverImage { extraLarge large color }
            bannerImage
          }
        }
      }
    `;

    const data = await this.fetchGraphQL<{ Page: { media: AniListMedia[] } }>(gql, {
      search: query,
      perPage: limit,
    });

    return data.Page.media;
  }

  async getById(id: number): Promise<AniListMedia | null> {
    const gql = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english native }
          description
          format
          status
          startDate { year }
          season
          seasonYear
          episodes
          duration
          averageScore
          genres
          studios(isMain: true) { nodes { name } }
          coverImage { extraLarge large color }
          bannerImage
        }
      }
    `;

    const data = await this.fetchGraphQL<{ Media: AniListMedia | null }>(gql, { id });
    return data.Media;
  }

  private mapType(format: string | null): AnimeType {
    switch (format) {
      case "MOVIE":
        return AnimeType.Movie;
      case "OVA":
        return AnimeType.OVA;
      case "ONA":
        return AnimeType.ONA;
      default:
        return AnimeType.TV;
    }
  }

  private mapStatus(status: string | null): AnimeStatus {
    switch (status) {
      case "RELEASING":
        return AnimeStatus.Airing;
      case "NOT_YET_RELEASED":
        return AnimeStatus.Upcoming;
      default:
        return AnimeStatus.Completed;
    }
  }

  private mapSeason(season: string | null): BroadcastSeason {
    switch (season) {
      case "WINTER":
        return BroadcastSeason.Winter;
      case "SPRING":
        return BroadcastSeason.Spring;
      case "SUMMER":
        return BroadcastSeason.Summer;
      default:
        return BroadcastSeason.Fall;
    }
  }

  private hexToHue(hex: string | null): number {
    if (!hex || !hex.startsWith("#")) return 200;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    if (max === min) h = 0;
    else if (max === r) h = ((g - b) / (max - min)) % 6;
    else if (max === g) h = (b - r) / (max - min) + 2;
    else h = (r - g) / (max - min) + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
    return h;
  }

  async importMediaToDatabase(media: AniListMedia, overrideSlug?: string) {
    const title = media.title.english || media.title.romaji;
    const slug =
      overrideSlug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const type = this.mapType(media.format);
    const status = this.mapStatus(media.status);
    const season = this.mapSeason(media.season);
    const year = media.seasonYear || media.startDate.year || new Date().getFullYear();
    const duration = media.duration ? `${media.duration} min` : type === AnimeType.Movie ? "108 min" : "24 min";
    const rating = media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : 8.0;
    const studio = media.studios.nodes[0]?.name || "Unknown Studio";
    const hue = this.hexToHue(media.coverImage.color);
    const poster = media.coverImage.extraLarge || media.coverImage.large || "";
    const banner = media.bannerImage || poster;
    const cleanSynopsis = (media.description || "No synopsis available.")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "");

    const anime = await db.anime.upsert({
      where: { id: slug },
      update: {
        title,
        japanese: media.title.native || title,
        synopsis: cleanSynopsis,
        type,
        status,
        year,
        season,
        episodes: media.episodes || 12,
        aired: status === AnimeStatus.Completed ? media.episodes || 12 : 1,
        duration,
        rating,
        studio,
        hue,
        poster,
        banner,
        anilistId: media.id,
      },
      create: {
        id: slug,
        title,
        japanese: media.title.native || title,
        synopsis: cleanSynopsis,
        type,
        status,
        year,
        season,
        episodes: media.episodes || 12,
        aired: status === AnimeStatus.Completed ? media.episodes || 12 : 1,
        duration,
        rating,
        studio,
        hue,
        poster,
        banner,
        anilistId: media.id,
      },
    });

    // Ensure genres exist and link them
    for (const gName of media.genres) {
      const gSlug = gName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const genre = await db.genre.upsert({
        where: { name: gName },
        update: {},
        create: { name: gName, slug: gSlug },
      });

      await db.animeGenre.upsert({
        where: { animeId_genreId: { animeId: anime.id, genreId: genre.id } },
        update: {},
        create: { animeId: anime.id, genreId: genre.id },
      });
    }

    return anime;
  }
}

export const anilistClient = new AniListClient();
