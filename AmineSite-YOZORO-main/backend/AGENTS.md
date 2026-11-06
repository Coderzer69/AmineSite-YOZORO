# AGENTS.MD — YOZORO BACKEND MAINTENANCE GUIDE

This document guides automated agents and human developers maintaining the YOZORO backend.

---

## 1. Directory Structure

```text
backend/
├── src/
│   ├── config/          # Environment configuration (Zod-validated)
│   ├── controllers/     # Express route handlers
│   ├── services/        # Business logic & operations
│   ├── repositories/    # Database query abstractions (Prisma)
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Auth, error handling, rate limiting, validation
│   ├── validators/      # Zod validation schemas for requests
│   ├── types/           # Domain and API types
│   ├── utils/           # Logger, crypto, errors, token signers
│   ├── integrations/    # External clients (AniList GraphQL, etc.)
│   ├── storage/         # Storage interface & Google Cloud Storage adapter
│   ├── streaming/       # HLS manifest rewriter & segment security
│   ├── jobs/            # Queue definitions & state machine
│   ├── app.ts           # Express app setup and middleware chain
│   └── server.ts        # Server entry point & graceful shutdown
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Default admin & mock data seeder
├── video-tools/
│   ├── worker/          # Standalone video transcoding worker
│   ├── bulk-upload/     # Local CLI for bulk video uploads
│   └── shared/          # FFmpeg/FFprobe wrappers and types
├── tests/
│   ├── unit/            # Unit tests for services and utilities
│   └── integration/     # Supertest API endpoint tests
├── docs/                # Architecture, integration contract, guides
├── .env.example         # Template configuration
├── package.json
└── tsconfig.json
```

---

## 2. Key Commands

From `backend/`:

- **Run Dev Server:** `npm run dev`
- **Build Server:** `npm run build`
- **Start Production Server:** `npm start`
- **Run Tests:** `npm test`
- **Run Database Migrations:** `npx prisma migrate dev`
- **Seed Database:** `npm run db:seed`
- **Start Video Worker:** `npm run worker`
- **Run Bulk Upload CLI:** `npm run bulk-upload -- --help`

---

## 3. Guiding Principles

1. **Frontend Isolation:** Never modify files outside `backend/`. The frontend is a fixed consumer.
2. **Deterministic Security:** All videos are private. Playback requires an authenticated user or signed token. Passwords must use Argon2id.
3. **No Mock Data for Production APIs:** Production routes must read and write to PostgreSQL via Prisma.
4. **Resilience:** The Express API must start and serve requests even if the video worker is offline or GCS is in local fallback mode.

