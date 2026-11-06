import { art } from "./art";
import type { Anime, AnimeStatus, AnimeType, Season } from "./types";

type Row = [
  id: string, title: string, jp: string, synopsis: string, genres: string[],
  status: AnimeStatus, type: AnimeType, year: number, season: Season,
  episodes: number, aired: number, rating: number, studio: string, hue: number,
];

const rows: Row[] = [
  ["ashen-lantern", "Ashen Lantern", "灰の灯", "A courier who ferries lanterns between sky-ports discovers one that burns without fuel, and the people who want it extinguished.", ["Adventure", "Fantasy"], "Airing", "TV", 2026, "Fall", 24, 3, 9.1, "Studio Kasane", 350],
  ["tidebound", "Tidebound", "潮の檻", "Every full moon the sea takes one house from a fishing village. Mio decides to follow it down.", ["Mystery", "Supernatural"], "Airing", "TV", 2026, "Fall", 12, 3, 8.8, "Northwind Pictures", 200],
  ["paper-orbit", "Paper Orbit", "紙の軌道", "Two rival origami engineers build the first folding spacecraft, one crease at a time.", ["Sci-Fi", "Comedy"], "Airing", "TV", 2026, "Fall", 13, 3, 8.4, "Orbit Works", 265],
  ["last-train-to-hollow", "Last Train to Hollow", "終電の街", "A night train stops at a station that is not on the map. Passengers get off, but nobody remembers boarding.", ["Mystery", "Drama"], "Airing", "TV", 2026, "Fall", 12, 3, 8.9, "Studio Kasane", 20],
  ["blade-of-saffron", "Blade of Saffron", "藏紅の刃", "A retired swordswoman runs a spice stall. Her old clan has found her.", ["Action", "Drama"], "Completed", "TV", 2025, "Spring", 26, 26, 9.0, "Ember Frame", 35],
  ["cloudwright", "Cloudwright", "雲大工", "Apprentice builder Ren raises floating towns from storm clouds, until one refuses to rise.", ["Fantasy", "Slice of Life"], "Completed", "TV", 2025, "Summer", 24, 24, 8.6, "Northwind Pictures", 190],
  ["glass-season", "Glass Season", "硝子の季節", "Four classmates, one abandoned greenhouse, and a summer they will each remember differently.", ["Romance", "Slice of Life"], "Completed", "TV", 2024, "Summer", 12, 12, 8.2, "Petal Lab", 320],
  ["iron-bloom", "Iron Bloom", "鉄の花", "In a city grown from scrapyards, a mechanic teaches a retired war-frame to garden.", ["Sci-Fi", "Drama"], "Completed", "Movie", 2025, "Winter", 1, 1, 8.7, "Orbit Works", 150],
  ["moonlit-ledger", "Moonlit Ledger", "月下帳簿", "An accountant for the spirit world audits a debt that predates the living.", ["Supernatural", "Comedy"], "Airing", "ONA", 2026, "Fall", 10, 3, 8.0, "Lantern Row", 285],
  ["the-hundredth-door", "The Hundredth Door", "百番目の扉", "A hotel with a hundred doors, and behind each one, a different century's worst day.", ["Horror", "Mystery"], "Upcoming", "TV", 2027, "Winter", 12, 0, 8.5, "Ember Frame", 5],
  ["kitebreakers", "Kitebreakers", "凧割り", "Rival kite clans fight over the winter wind above a coastal capital.", ["Sports", "Action"], "Completed", "TV", 2023, "Winter", 25, 25, 8.3, "Gale Studio", 170],
  ["salt-and-static", "Salt & Static", "塩と雑音", "A lighthouse radio picks up broadcasts from tomorrow. The weather is fine, but the news is not.", ["Sci-Fi", "Mystery"], "Completed", "OVA", 2024, "Fall", 4, 4, 8.1, "Lantern Row", 225],
];

export const ALL_ANIME: Anime[] = rows.map(
  ([id, title, japanese, synopsis, genres, status, type, year, season, episodes, aired, rating, studio, hue]) => ({
    id, title, japanese, synopsis, genres, status, type, year, season, episodes, aired, rating, studio, hue,
    duration: type === "Movie" ? "108 min" : "24 min",
    poster: art(hue, 400, 560),
    banner: art(hue, 1600, 700),
  }),
);

export const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
];