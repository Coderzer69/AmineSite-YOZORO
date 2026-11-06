# YOZORO — Production Backend

A high-performance, secure, and resilient backend engineered for the **YOZORO** anime streaming platform.

Built with **Node.js, Express, TypeScript, PostgreSQL, Prisma, Zod, Argon2id, Google Cloud Storage, and FFmpeg HLS**.

---

## 🚀 Quick Start (Development)

### 1. Prerequisites
- **Node.js:** v20+ LTS or v22+
- **PostgreSQL:** Running on local or cloud host
- **FFmpeg & FFprobe:** Installed in system PATH (for local transcoding)

### 2. Setup
From `backend/`:

```powershell
# 1. Install dependencies
npm install

# 2. Configure environment (.env is pre-configured for local PostgreSQL)
cp .env.example .env

# 3. Synchronize database schema and seed initial data
npm run prisma:push
npm run db:seed

# 4. Run tests
npm test

# 5. Start development API server
npm run dev
```

The server starts at `http://localhost:4000`.
- API base: `http://localhost:4000/api/v1`
- Interactive Swagger Documentation: `http://localhost:4000/api/v1/docs`

---

## 📑 Default Credentials

- **Admin Account:** `admin@yozoro.moe`
- **Admin Password:** `AdminPassword123!`
- **Initial Invitation Codes:** `YOZORO-BETA-2026`, `YOZORO-EARLY-ACCESS`

---

## 🛠️ Key Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Express backend with hot-reload via `tsx` |
| `npm run build` | Compiles TypeScript into `dist/` |
| `npm start` | Starts compiled production server |
| `npm test` | Runs complete automated integration and unit test suite |
| `npm run worker` | Starts the local video transcoding worker |
| `npm run bulk-upload` | Runs the bulk video upload CLI |
| `npm run db:seed` | Seeds database with admin, genres, and anime titles |

---

## 📚 Documentation Index

- [Frontend Integration Contract](file:///backend/docs/FRONTEND_INTEGRATION_CONTRACT.md)
- [Technical Architecture Decisions](file:///backend/docs/TECHNICAL_DECISIONS.md)
- [Implementation Plan](file:///backend/docs/IMPLEMENTATION_PLAN.md)
- [Build Progress](file:///backend/docs/BUILD_PROGRESS.md)
- [OpenAPI Specification](file:///backend/docs/openapi.yaml)
- [Database Architecture](file:///backend/docs/DATABASE.md)
- [Google Cloud Storage Guide](file:///backend/docs/GCS_SETUP_GUIDE.md)
- [Video Worker Setup Guide](file:///backend/docs/WORKER_SETUP_GUIDE.md)
- [Bulk Upload CLI Guide](file:///backend/docs/BULK_UPLOAD_GUIDE.md)
- [Production Deployment Guide](file:///backend/docs/DEPLOYMENT_GUIDE.md)

