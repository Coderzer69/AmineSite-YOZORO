export type AnimeType = "TV" | "Movie" | "OVA" | "ONA";
export type AnimeStatus = "Airing" | "Completed" | "Upcoming";
export type Season = "Winter" | "Spring" | "Summer" | "Fall";
export type Period = "day" | "week" | "month";

export interface Anime {
  id: string;
  title: string;
  japanese: string;
  synopsis: string;
  type: AnimeType;
  status: AnimeStatus;
  year: number;
  season: Season;
  episodes: number; // total
  aired: number; // released so far
  duration: string;
  rating: number;
  genres: string[];
  studio: string;
  hue: number;
  poster: string;
  banner: string;
}

export interface Episode {
  number: number;
  title: string;
  duration: string;
}

export interface ScheduleItem {
  time: string;
  animeId: string;
  title: string;
  episode: number;
}

export interface BrowseFilters {
  q?: string;
  genre?: string;
  year?: number;
  season?: Season;
  type?: AnimeType;
  status?: AnimeStatus;
  page?: number;
}

export interface BrowseResult {
  items: Anime[];
  total: number;
  pages: number;
  page: number;
}
// import 
export interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  likes: number;
}