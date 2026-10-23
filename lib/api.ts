import { ALL_ANIME, GENRES } from "./mock-data";
import type {
  Anime, BrowseFilters, BrowseResult, Comment, Episode, Period, ScheduleItem,
} from "./types";

/**
 * Data access layer. Everything is async so swapping in Jikan or your own
 * backend later only means editing this file.
 */
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const PAGE_SIZE = 12;

const byRating = (a: Anime, b: Anime) => b.rating - a.rating;
const rotate = <T,>(arr: T[], n: number) => [...arr.slice(n), ...arr.slice(0, n)];

export async function getSpotlight(): Promise<Anime[]> {
  await delay();
  return [...ALL_ANIME].sort(byRating).slice(0, 5);
}
export async function getTrending(): Promise<Anime[]> {
  await delay();
  return rotate([...ALL_ANIME].sort(byRating), 2);
}
export async function getRecentlyUpdated(): Promise<Anime[]> {
  await delay();
  return ALL_ANIME.filter((a) => a.status === "Airing").reverse();
}
export async function getTopAiring(): Promise<Anime[]> {
  await delay();
  return ALL_ANIME.filter((a) => a.status === "Airing").sort(byRating);
}
export async function getMostPopular(): Promise<Anime[]> {
  await delay();
  return rotate([...ALL_ANIME].sort(byRating), 4);
}
export async function getTop10(period: Period): Promise<Anime[]> {
  await delay(200);
  const shift = { day: 0, week: 3, month: 6 }[period];
  return rotate([...ALL_ANIME].sort(byRating), shift).slice(0, 10);
}
export async function getGenres(): Promise<string[]> {
  return GENRES;
}
export async function getAnime(id: string): Promise<Anime | null> {
  await delay(200);
  return ALL_ANIME.find((a) => a.id === id) ?? null;
}
export async function getRecommendations(id: string): Promise<Anime[]> {
  await delay(200);
  const base = ALL_ANIME.find((a) => a.id === id);
  if (!base) return ALL_ANIME.slice(0, 6);
  return ALL_ANIME.filter(
    (a) => a.id !== id && a.genres.some((g) => base.genres.includes(g)),
  ).slice(0, 8);
}
export async function getEpisodes(id: string): Promise<Episode[]> {
  await delay(150);
  const a = ALL_ANIME.find((x) => x.id === id);
  const count = Math.max(a?.aired ?? 0, a?.status === "Upcoming" ? 0 : 1);
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    title: `Episode ${i + 1}`,
    duration: a?.duration ?? "24 min",
  }));
}

export async function searchAnime(q: string, limit = 6): Promise<Anime[]> {
  await delay(150);
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return ALL_ANIME.filter(
    (a) => a.title.toLowerCase().includes(s) || a.japanese.includes(s),
  ).slice(0, limit);
}

export async function browseAnime(f: BrowseFilters): Promise<BrowseResult> {
  await delay(300);
  const q = f.q?.trim().toLowerCase();
  const filtered = ALL_ANIME.filter(
    (a) =>
      (!q || a.title.toLowerCase().includes(q)) &&
      (!f.genre || a.genres.includes(f.genre)) &&
      (!f.year || a.year === f.year) &&
      (!f.season || a.season === f.season) &&
      (!f.type || a.type === f.type) &&
      (!f.status || a.status === f.status),
  ).sort(byRating);
  const page = Math.max(1, f.page ?? 1);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    pages,
    page,
  };
}

export async function getSchedule(): Promise<Record<string, ScheduleItem[]>> {
  await delay(250);
  const airing = ALL_ANIME.filter((a) => a.status === "Airing");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const times = ["09:30", "12:00", "17:45", "20:00", "23:30"];
  const out: Record<string, ScheduleItem[]> = Object.fromEntries(days.map((d) => [d, []]));
  airing.forEach((a, i) => {
    out[days[i % 7]].push({ time: times[i % times.length], animeId: a.id, title: a.title, episode: a.aired });
    out[days[(i * 3 + 2) % 7]].push({ time: times[(i + 2) % times.length], animeId: a.id, title: a.title, episode: a.aired });
  });
  days.forEach((d) => out[d].sort((x, y) => x.time.localeCompare(y.time)));
  return out;
}

//import 
export async function getComments(animeId: string, episode: number): Promise<Comment[]> {
  await delay(200);
  const seed = (animeId.length + episode) % 3;
  const all: Comment[] = [
    { id: "c1", author: "nightowl", text: "That final scene was beautifully framed. The score did half the work.", time: "2 hours ago", likes: 42 },
    { id: "c2", author: "kasumi_k", text: "Calling it now: the lantern keeper is not who she says she is.", time: "5 hours ago", likes: 31 },
    { id: "c3", author: "mothlight", text: "Anyone else rewatching the opening just for the animation?", time: "1 day ago", likes: 17 },
    { id: "c4", author: "r0nin_dev", text: "Pacing felt slower this week, but the payoff was worth it.", time: "1 day ago", likes: 9 },
  ];
  return [...all.slice(seed), ...all.slice(0, seed)];
}