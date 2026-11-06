# TECHNICAL DECISIONS — YOZORO BACKEND

This document details the architectural, technical, security, and operational decisions for the YOZORO backend.

---

## 1. Runtime & Framework

- **Runtime:** Node.js (v20+ LTS / v22+ compatible).
- **Language:** TypeScript 5.x with strict type checking, ES module resolution (`nodenext`), and explicit return types on public APIs.
- **Framework:** Express.js 4.x.
  - *Rationale:* Battle-tested, lightweight, maximum ecosystem compatibility with session managers, security middleware (`helmet`, `cors`, `rate-limit`), and custom streaming route handlers.
- **Logging:** `pino` + `pino-http`.
  - *Rationale:* Extremely low overhead, structured JSON logs in production, pretty printing in development, automatic request ID correlation, redacting sensitive fields (`password`, `authorization`, `cookie`, `token`).

---

## 2. Database & Data Access Layer

- **Database:** PostgreSQL (v14+; currently PostgreSQL 18 running locally).
- **ORM & Migrations:** Prisma 5.x / 6.x.
  - *Rationale:* Type-safe queries, declarative schema definitions, automated migrations, native support for JSONB, relations, transactions, and robust indexing.
- **Data Models:**
  1. `User`: Core account entity with `role` (`ADMIN` | `USER`), status (`ACTIVE` | `SUSPENDED`).
  2. `Session`: Stateful session storage in database for instant revocation, tracking IP and User-Agent.
  3. `Invitation`: Code-based invitations for invite-only onboarding, with usage tracking, expiration, and inviter tracking.
  4. `Anime`: Catalogue item with slug ID matching the frontend schema (`ashen-lantern`), Japanese title, synopsis, status, format type, season, year, rating, hue, poster, banner.
  5. `Genre`: Standard genre terms (`Action`, `Fantasy`, etc.).
  6. `AnimeGenre`: Join table enabling many-to-many relationship with composite primary keys.
  7. `Season`: Seasons metadata associated with Anime (e.g. Season 1, Season 2).
  8. `Episode`: Ordered episodes per season/anime, tracking run duration, air date, and publication status.
  9. `VideoAsset`: Processed video metadata (resolution, master playlist key, duration, bitrate, codec, status).
  10. `SubtitleTrack`: Multi-language WebVTT/SRT subtitles (language, label, file key).
  11. `UploadAsset`: Staging upload tracker (GCS object name, original filename, file size, checksum, status).
  12. `TranscodeJob`: Processing pipeline state machine with attempt counting, error logs, and execution worker ID.
  13. `ContentLicense`: Legal rights records tracking licensing rights, expiration, licensor, and territorial rights.
  14. `WatchProgress`: User episode resume checkpoints (position in seconds, duration, completion threshold).
  15. `Watchlist`: User saved anime bookmarks with timestamp.
  16. `Comment`: Episode discussion entries (max 500 characters).
  17. `CommentReaction`: User upvotes / likes on comments.

---

## 3. Authentication & Security Architecture

- **Session Management:** Secure HTTP-only cookies storing a cryptographic session token (`yozoro_session`).
- **Session Revocation:** Sessions are stored in the PostgreSQL database. An administrator or user can revoke all active sessions immediately.
- **Password Hashing:** `argon2` (Argon2id profile, recommended by OWASP).
- **Role-Based Access Control (RBAC):** Middleware checks `ADMIN` vs `USER` on privileged operations.
- **Rate Limiting:** `express-rate-limit` to prevent brute force attacks on auth endpoints and resource flooding.
- **Private By Default:** Registration requires a valid, unexpired `Invitation` code created by an admin.

---

## 4. Video Storage & Ingestion Pipeline

- **Cloud Storage:** Google Cloud Storage (GCS).
  - **Staging Bucket:** `yozoro-staging` for raw uploads. Has a lifecycle policy to clean up unreferenced uploads after 14 days.
  - **Media Bucket:** `yozoro-media` for processed HLS output (`.m3u8` playlists and `.ts` segments). Completely private with Uniform Bucket-Level Access (no public read).
- **Direct-to-Storage Resumable Uploads:**
  - Express creates a signed GCS Resumable Upload session URI.
  - The browser/client uploads video bytes directly to GCS without loading or streaming through the Node.js server.
  - Express verifies upload completion via GCS Object Metadata (size, generation, MD5/CRC32c checksum).

---

## 5. Video Processing & Transcoding (Local Worker)

- **Worker Architecture:** Decoupled TypeScript worker process running locally or in container.
  - Communicates with backend using a secure API key (`WORKER_API_KEY`).
  - Atomically claims queued `TranscodeJob` records using database row locking (`FOR UPDATE SKIP LOCKED`).
- **FFmpeg Transcoding Pipeline:**
  - Extracts video stream information using `ffprobe` (dimensions, codec, framerate, duration).
  - Never upscales smaller resolutions.
  - Target output: H.264 (libx264) video, AAC audio, HLS protocol.
  - Output format: HLS VOD playlist with 6-second segments (`-hls_time 6 -hls_playlist_type vod`).
  - Master playlist pointing to rendition stream.
  - Output files are validated for presence and minimum size before uploading to the media bucket.
- **Bulk Upload CLI:**
  - TypeScript CLI tool in `video-tools/bulk-upload` that parses local directories of MP4/MKV files or CSV manifests, hashes them (SHA-256), requests upload sessions, processes or uploads, and links them to database records.

---

## 6. Secure HLS Delivery

- **Protection Against Hotlinking & Piracy:**
  - The Media GCS bucket has ZERO public access.
  - Video stream requests require a cryptographically signed HMAC token embedding the user ID, episode ID, and an expiration timestamp (e.g. 2 hours).
  - The backend generates short-lived signed URLs for playlists and segments or verifies HMAC tokens before proxying or redirecting to signed GCS URLs.
  - Path traversal is prevented through strict regex validation of requested segment filenames.

---

## 7. Metadata Import (AniList GraphQL)

- **Metadata Source:** AniList GraphQL Public API (`https://graphql.anilist.co`).
- **Functionality:** Allows admins to search by title and import poster, banner, studio, episodes, format, seasons, Japanese title, and synopses with one click.
- **Manual Override Preservation:** Custom-edited anime records are protected against accidental overwriting.

