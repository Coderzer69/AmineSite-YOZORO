import { PrismaClient, Role, UserStatus, AnimeType, AnimeStatus, BroadcastSeason } from "@prisma/client";
import { hashPassword } from "../src/utils/crypto.js";

const prisma = new PrismaClient();

const GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
  "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
];

// Art generator identical to frontend lib/art.ts
function art(hue: number, w: number, h: number): string {
  const h2 = (hue + 40) % 360;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='hsl(${hue} 70% 38%)'/>` +
    `<stop offset='1' stop-color='hsl(${h2} 60% 12%)'/></linearGradient></defs>` +
    `<rect width='100%' height='100%' fill='url(#g)'/>` +
    `<circle cx='${w * 0.72}' cy='${h * 0.28}' r='${Math.min(w, h) * 0.2}' fill='hsl(${hue} 90% 82%)' opacity='.85'/>` +
    `<path d='M0 ${h * 0.78} Q ${w * 0.3} ${h * 0.6} ${w * 0.55} ${h * 0.76} T ${w} ${h * 0.7} V ${h} H 0 Z' fill='hsl(${h2} 50% 8%)' opacity='.8'/>` +
    `<path d='M0 ${h * 0.9} Q ${w * 0.4} ${h * 0.78} ${w * 0.7} ${h * 0.9} T ${w} ${h * 0.86} V ${h} H 0 Z' fill='hsl(${h2} 45% 5%)'/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type AnimeRow = [
  id: string, title: string, jp: string, synopsis: string, genres: string[],
  status: AnimeStatus, type: AnimeType, year: number, season: BroadcastSeason,
  episodes: number, aired: number, rating: number, studio: string, hue: number,
];

const mockRows: AnimeRow[] = [
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

async function main() {
  console.log("🌱 Starting YOZORO Database Seeder...");

  // 1. Seed Admin User
  const adminPassword = await hashPassword("AdminPassword123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@yozoro.moe" },
    update: { role: Role.ADMIN },
    create: {
      username: "admin",
      email: "admin@yozoro.moe",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`👤 Admin user ready: ${admin.email}`);

  // 2. Seed Initial Invitations
  const invitations = ["YOZORO-BETA-2026", "YOZORO-EARLY-ACCESS", "YOZORO-VIP-MEMBER"];
  for (const code of invitations) {
    await prisma.invitation.upsert({
      where: { code },
      update: {},
      create: {
        code,
        createdById: admin.id,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });
  }
  console.log(`🎟️ Seeded ${invitations.length} invitation codes.`);

  // 3. Seed Genres
  const genreMap = new Map<string, string>();
  for (const name of GENRES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const genre = await prisma.genre.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
    genreMap.set(name, genre.id);
  }
  console.log(`🏷️ Seeded ${GENRES.length} genres.`);

  // 4. Seed Anime and Episodes
  for (const [id, title, jp, synopsis, genres, status, type, year, season, episodes, aired, rating, studio, hue] of mockRows) {
    const duration = type === "Movie" ? "108 min" : "24 min";
    const poster = art(hue, 400, 560);
    const banner = art(hue, 1600, 700);

    const anime = await prisma.anime.upsert({
      where: { id },
      update: {
        title,
        japanese: jp,
        synopsis,
        type,
        status,
        year,
        season,
        episodes,
        aired,
        duration,
        rating,
        studio,
        hue,
        poster,
        banner,
      },
      create: {
        id,
        title,
        japanese: jp,
        synopsis,
        type,
        status,
        year,
        season,
        episodes,
        aired,
        duration,
        rating,
        studio,
        hue,
        poster,
        banner,
      },
    });

    // Link Genres
    for (const gName of genres) {
      const gId = genreMap.get(gName);
      if (gId) {
        await prisma.animeGenre.upsert({
          where: { animeId_genreId: { animeId: anime.id, genreId: gId } },
          update: {},
          create: { animeId: anime.id, genreId: gId },
        });
      }
    }

    // Seed Episodes
    const count = Math.max(aired, status === "Upcoming" ? 0 : 1);
    for (let i = 1; i <= count; i++) {
      await prisma.episode.upsert({
        where: { animeId_number: { animeId: anime.id, number: i } },
        update: {
          title: `Episode ${i}`,
          duration: anime.duration,
          isPublished: true,
        },
        create: {
          animeId: anime.id,
          number: i,
          title: `Episode ${i}`,
          duration: anime.duration,
          isPublished: true,
        },
      });
    }

    // Seed Sample Comments on Episode 1
    if (count >= 1) {
      const existingComments = await prisma.comment.count({
        where: { animeId: anime.id, episodeNumber: 1 },
      });
      if (existingComments === 0) {
        await prisma.comment.createMany({
          data: [
            {
              userId: admin.id,
              animeId: anime.id,
              episodeNumber: 1,
              text: "That final scene was beautifully framed. The score did half the work.",
            },
            {
              userId: admin.id,
              animeId: anime.id,
              episodeNumber: 1,
              text: "Calling it now: the lantern keeper is not who she says she is.",
            },
          ],
        });
      }
    }
  }

  console.log(`🎬 Seeded ${mockRows.length} anime titles and episodes.`);
  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed script error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

