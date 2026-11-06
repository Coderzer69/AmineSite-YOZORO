# DATABASE ARCHITECTURE & SCHEMA — YOZORO

This document details the PostgreSQL database design and schema implemented using Prisma for the YOZORO backend.

---

## 1. Overview & Constraints

- **Engine:** PostgreSQL 14+ (tested on PostgreSQL 18).
- **ORM:** Prisma Client with TypeScript.
- **Normalization:** Fully normalized relational schema with cascading deletions on dependent relations (e.g. deleting an anime cascades to episodes, genres, comments, watchlist, progress).
- **Security:** Passwords are stored exclusively as Argon2id hashes. Session tokens are stored as SHA-256 hashes.

---

## 2. Models Summary

| Model | Table Name | Purpose | Key Indexes |
|---|---|---|---|
| `User` | `User` | Accounts with roles (`USER`, `ADMIN`) | `email`, `username` |
| `Session` | `Session` | Stateful user sessions with revocation | `userId`, `tokenHash` |
| `Invitation` | `Invitation` | Single-use invite codes | `code` (unique) |
| `Anime` | `Anime` | Catalogue titles matching frontend model | `id` (slug), `status`, `rating` |
| `Genre` | `Genre` | Distinct category labels | `name` (unique), `slug` |
| `AnimeGenre` | `AnimeGenre` | M:N join between Anime and Genre | `@@id([animeId, genreId])` |
| `Season` | `Season` | Broadcast seasons per Anime | `@@unique([animeId, seasonNumber])` |
| `Episode` | `Episode` | Episodes per Anime/Season | `@@unique([animeId, number])` |
| `VideoAsset` | `VideoAsset` | Processed HLS output & codecs | `episodeId` (unique) |
| `SubtitleTrack` | `SubtitleTrack` | Multi-language subtitles | `episodeId` |
| `UploadAsset` | `UploadAsset` | Raw staging upload tracker | `episodeId` |
| `TranscodeJob` | `TranscodeJob` | Video processing job queue | `status`, `workerId` |
| `ContentLicense` | `ContentLicense` | Rights & distribution records | `animeId` |
| `WatchProgress` | `WatchProgress` | Resumable playback position | `@@unique([userId, animeId, episodeNumber])` |
| `Watchlist` | `Watchlist` | User bookmarked anime | `@@unique([userId, animeId])` |
| `Comment` | `Comment` | Episode discussion messages | `@@index([animeId, episodeNumber])` |
| `CommentReaction` | `CommentReaction` | Comment upvotes/likes | `@@unique([commentId, userId])` |

---

## 3. Database Maintenance Commands

From `backend/`:

```powershell
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to PostgreSQL
npm run prisma:push

# Create and apply migrations
npm run prisma:migrate

# Seed database with initial admin and catalogue
npm run db:seed
```

