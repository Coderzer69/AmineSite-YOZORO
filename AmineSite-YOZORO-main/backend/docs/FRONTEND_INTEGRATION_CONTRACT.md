# FRONTEND INTEGRATION CONTRACT — YOZORO

This contract documents the exact integration requirements between the existing YOZORO Next.js frontend (read-only target) and the new Node.js/Express/TypeScript/PostgreSQL backend.

---

## 1. Executive Summary & Design Principle

The YOZORO frontend is a modern anime discovery and streaming UI built with Next.js (App Router), React 18, Tailwind CSS, Lucide icons, and Framer Motion.
All data fetching is abstracted through `lib/api.ts` which exports strongly typed async functions returning interfaces defined in `lib/types.ts`.

The backend provides:
1. Primary REST endpoints under `/api/v1/` for clean versioning.
2. Direct compat endpoints under `/api/` matching all `lib/api.ts` consumer expectations without needing changes to existing URL patterns.
3. Cookie-based HTTP-only session authentication and JSON Web Token (JWT) / Bearer token fallback for API consumers.
4. Protected HLS streaming URLs with short-lived HMAC or GCS signed tokens.

---

## 2. Frontend Types & Data Model Mapping

### 2.1 Enums & Primitive Types (`lib/types.ts`)

| Type Name | Valid Values | Notes |
|---|---|---|
| `AnimeType` | `"TV" \| "Movie" \| "OVA" \| "ONA"` | Matches AniList format mapping |
| `AnimeStatus` | `"Airing" \| "Completed" \| "Upcoming"` | Matches AniList status mapping |
| `Season` | `"Winter" \| "Spring" \| "Summer" \| "Fall"` | Broadcast season |
| `Period` | `"day" \| "week" \| "month"` | Leaderboard top-10 interval |

### 2.2 Core Entities

#### Anime (`Anime`)
```typescript
export interface Anime {
  id: string;          // slug-friendly string (e.g. "ashen-lantern")
  title: string;       // English / Romaji primary title
  japanese: string;    // Native Japanese title
  synopsis: string;    // Full summary
  type: AnimeType;     // "TV" | "Movie" | "OVA" | "ONA"
  status: AnimeStatus; // "Airing" | "Completed" | "Upcoming"
  year: number;        // e.g. 2026
  season: Season;      // "Fall" | "Winter" | "Spring" | "Summer"
  episodes: number;    // Total planned episodes (e.g. 24)
  aired: number;       // Number of released/aired episodes (e.g. 3)
  duration: string;    // e.g. "24 min" or "108 min"
  rating: number;      // e.g. 9.1 (decimal scale 0.0 - 10.0)
  genres: string[];    // Array of genre strings: ["Adventure", "Fantasy"]
  studio: string;      // Studio name (e.g. "Studio Kasane")
  hue: number;         // Hue angle (0-360) used for procedural SVGs & tinting
  poster: string;      // Image URL or SVG data URI
  banner: string;      // Hero banner URL or SVG data URI
}
```

#### Episode (`Episode`)
```typescript
export interface Episode {
  number: number;   // 1-based index (e.g. 1)
  title: string;    // "Episode 1" or episodic title
  duration: string; // e.g. "24 min"
}
```

#### ScheduleItem (`ScheduleItem`)
```typescript
export interface ScheduleItem {
  time: string;     // e.g. "09:30", "20:00" (HH:mm)
  animeId: string;  // references Anime.id
  title: string;    // anime title
  episode: number;  // current airing episode number
}
```

#### BrowseFilters & BrowseResult
```typescript
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
```

#### Comment (`Comment`)
```typescript
export interface Comment {
  id: string;      // unique ID (e.g. "c1" or uuid)
  author: string;  // display name / username
  text: string;    // comment body (max 500 chars)
  time: string;    // formatted relative string (e.g. "2 hours ago")
  likes: number;   // total like count
}
```

---

## 3. Required API Endpoints

### 3.1 Public Catalogue & Discovery Endpoints

| Method | Endpoint | Query / Body | Response Payload | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/anime/spotlight` | None | `Anime[]` | Top 5 anime sorted by rating descending |
| `GET` | `/api/v1/anime/trending` | None | `Anime[]` | Trending titles (popular current season) |
| `GET` | `/api/v1/anime/recent` | None | `Anime[]` | Airing titles ordered by most recently updated |
| `GET` | `/api/v1/anime/top-airing` | None | `Anime[]` | Airing anime sorted by rating descending |
| `GET` | `/api/v1/anime/popular` | None | `Anime[]` | Most popular anime of all time |
| `GET` | `/api/v1/anime/top10` | `?period=day\|week\|month` | `Anime[]` | Top 10 anime for period |
| `GET` | `/api/v1/anime/genres` | None | `string[]` | Distinct list of all active genres |
| `GET` | `/api/v1/anime/search` | `?q={string}&limit={number}` | `Anime[]` | Fast search on title and japanese title |
| `GET` | `/api/v1/anime/browse` | `q, genre, year, season, type, status, page` | `BrowseResult` | Filtered, paginated anime catalogue |
| `GET` | `/api/v1/anime/schedule` | None | `Record<string, ScheduleItem[]>` | Mon..Sun airing schedule |
| `GET` | `/api/v1/anime/:id` | Route param `id` | `Anime` | Single anime details (404 if not found) |
| `GET` | `/api/v1/anime/:id/episodes` | Route param `id` | `Episode[]` | Ordered episode list for anime |
| `GET` | `/api/v1/anime/:id/recommendations` | Route param `id` | `Anime[]` | Recommended anime with overlapping genres |

### 3.2 Episode Comments

| Method | Endpoint | Payload / Query | Response | Notes |
|---|---|---|---|---|
| `GET` | `/api/v1/anime/:id/episodes/:ep/comments` | Route params | `Comment[]` | Lists top/recent comments for episode |
| `POST` | `/api/v1/anime/:id/episodes/:ep/comments` | `{ "text": string }` | `Comment` | Creates comment (auth required) |
| `POST` | `/api/v1/comments/:id/like` | None | `{ "id": string, "likes": number, "liked": boolean }` | Toggles comment like |
| `DELETE` | `/api/v1/comments/:id` | None | `{ "success": true }` | Author or Admin can delete |

### 3.3 Authentication & User Sessions

Based on `components/AuthModal.tsx`:
- Forms submit `username` (on register, min 3 chars), `email` (valid email), `password` (min 8 chars).
- Platform is **invitation-only** by default for new registrations.

| Method | Endpoint | Request Body | Response Payload | Cookie Set |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `{ "email": string, "password": string }` | `{ "user": UserProfile }` | `yozoro_session` (HttpOnly, SameSite=Lax, Secure) |
| `POST` | `/api/v1/auth/register` | `{ "username": string, "email": string, "password": string, "invitationCode": string }` | `{ "user": UserProfile }` | `yozoro_session` |
| `POST` | `/api/v1/auth/logout` | None | `{ "success": true }` | Clears `yozoro_session` |
| `GET` | `/api/v1/auth/me` | None | `{ "user": UserProfile }` or 401 | Authenticated user profile |
| `POST` | `/api/v1/auth/change-password` | `{ "oldPassword": string, "newPassword": string }` | `{ "success": true }` | Updates password & revokes other sessions |

### 3.4 Watchlist & Playback Progress

| Method | Endpoint | Request Body | Response Payload | Notes |
|---|---|---|---|---|
| `GET` | `/api/v1/user/watchlist` | None | `Anime[]` | Anime in current user's watchlist |
| `POST` | `/api/v1/user/watchlist/:animeId` | None | `{ "inWatchlist": true }` | Toggles or adds to watchlist |
| `DELETE` | `/api/v1/user/watchlist/:animeId` | None | `{ "inWatchlist": false }` | Removes from watchlist |
| `GET` | `/api/v1/user/progress` | None | `WatchProgressItem[]` | Resume watching list |
| `POST` | `/api/v1/user/progress` | `{ "animeId": string, "episode": number, "positionSeconds": number, "durationSeconds": number }` | `{ "saved": true }` | Updates playback checkpoint |

### 3.5 Authorized HLS Streaming

| Method | Endpoint | Parameters | Response Payload | Description |
|---|---|---|---|---|
| `GET` | `/api/v1/playback/:animeId/:ep/manifest` | Route params + query token/session | `{ "playlistUrl": string, "subtitles": SubtitleTrack[], "servers": string[] }` | Returns authorized player configuration |
| `GET` | `/api/v1/playback/stream/:token/master.m3u8` | Signed HMAC Token in path | Master HLS playlist | Points to secured variant streams |
| `GET` | `/api/v1/playback/stream/:token/:variant.m3u8` | Signed HMAC Token in path | Variant HLS playlist | Points to secured `.ts` / `.m4s` chunks |
| `GET` | `/api/v1/playback/stream/:token/:segment` | Signed HMAC Token in path | 302 Redirect to short-lived GCS Signed URL or Direct Authorized Stream | Prevents token stealing & hotlinking |

---

## 4. Frontend Integration Blueprint (Zero Frontend Breakage)

When wiring the frontend to the backend:
1. In Next.js, `lib/api.ts` can read `process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"`.
2. Each method in `lib/api.ts` maps 1:1 to an endpoint defined in this document.
3. Because the backend implements both `/api/v1/...` and top-level aliases `/api/...`, calls can use standard paths without friction.
4. CORS is configured to accept `http://localhost:3000`, `http://localhost:3001`, `http://localhost:3002`, and the production Vercel domain `https://amine-site-yozoro.vercel.app`.

