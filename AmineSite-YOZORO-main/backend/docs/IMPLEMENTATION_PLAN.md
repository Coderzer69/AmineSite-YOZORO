# IMPLEMENTATION PLAN — YOZORO BACKEND

This implementation plan outlines the engineering steps to build the complete, production-ready YOZORO backend according to the Master Specification.

---

## Phase Overview

- **Phase 0 — Read-Only Audit & Contract Design** (Complete)
  - Audit existing frontend code and data models.
  - Create integration contract and technical architecture documentation.

- **Phase 1 — Backend Foundation**
  - Initialize `backend/package.json` with dependencies and scripts.
  - Set up `tsconfig.json` for Node.js / ES Modules.
  - Implement environment variable management with Zod schema (`config/env.ts`).
  - Configure structured logger (`utils/logger.ts`) using Pino.
  - Set up centralized error handling (`middleware/error.ts`, `utils/errors.ts`).
  - Configure Express application (`src/app.ts`) with Helmet, CORS, cookie-parser, rate limiting.
  - Configure test runner (Vitest or Jest) and Supertest.

- **Phase 2 — Database & Authentication**
  - Define complete Prisma schema (`prisma/schema.prisma`) with all 17 required models.
  - Generate Prisma Client and prepare seed script with default admin and mock anime records.
  - Implement password hashing service with Argon2id (`utils/crypto.ts`).
  - Implement session repository and authentication middleware (`middleware/auth.ts`).
  - Implement authentication controllers & routes (`auth/login`, `auth/register`, `auth/logout`, `auth/me`, `auth/change-password`).
  - Implement invitation management service (`services/invitation.service.ts`).

- **Phase 3 — Anime Catalogue & AniList Integration**
  - Implement Anime repository with filtering, search, pagination, and sorting.
  - Implement Anime controller matching all `lib/api.ts` frontend methods.
  - Implement AniList GraphQL client (`integrations/anilist.ts`) for title lookup and catalog import.
  - Implement season and episode management controllers.

- **Phase 4 — Google Cloud Storage & Upload Workflows**
  - Implement GCS storage adapter (`storage/gcs.ts`) supporting staging and media buckets.
  - Implement local mock/filesystem storage fallback for development without GCP credentials.
  - Implement direct resumable upload initiator for admin web client.
  - Implement upload verification and checksum validation.

- **Phase 5 — Video Worker, FFmpeg Pipeline & Bulk Upload CLI**
  - Implement FFmpeg/FFprobe wrappers (`video-tools/shared/ffmpeg.ts`).
  - Implement TranscodeJob queue state machine with atomic claiming (`jobs/job-queue.ts`).
  - Implement standalone video worker (`video-tools/worker/worker.ts`).
  - Implement bulk upload CLI (`video-tools/bulk-upload/cli.ts`) supporting folder scanning and CSV manifests.

- **Phase 6 — Authorized HLS Streaming**
  - Implement token-signing utility for HMAC playback tokens (`utils/tokens.ts`).
  - Implement playback manifest generation (`controllers/playback.controller.ts`).
  - Implement secured HLS playlist rewrites and short-lived segment authorizers.
  - Implement subtitle track provisioning.

- **Phase 7 — User Interactions & Admin APIs**
  - Implement watchlist controller (`GET`, `POST`, `DELETE`).
  - Implement watch progress & resume watching tracker (`GET`, `POST`).
  - Implement episode comments and comment upvoting (`GET`, `POST`, `DELETE`, `like`).
  - Implement admin dashboard statistics, user management, and content licensing.

- **Phase 8 — Verification, Testing & Documentation**
  - Run full suite of automated unit and integration tests.
  - Validate all endpoints against `FRONTEND_INTEGRATION_CONTRACT.md`.
  - Compile final setup guides (GCS, Worker, Bulk Upload, Deployment, Database).
  - Review security, permissions, rate limits, and sanitization.

