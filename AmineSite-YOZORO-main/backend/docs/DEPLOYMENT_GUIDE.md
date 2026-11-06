# PRODUCTION DEPLOYMENT GUIDE — YOZORO

This guide details deploying the YOZORO backend to production.

---

## 1. Architecture Overview

- **Web / API Server:** Node.js Express server running on Google Cloud Run, AWS App Runner, or VPS.
- **Database:** Managed PostgreSQL (e.g. Google Cloud SQL, Neon, Supabase, RDS).
- **Storage:** Google Cloud Storage (`yozoro-staging`, `yozoro-media`).
- **Transcoding Worker:** Decoupled worker running on a dedicated Compute Engine instance or local server with FFmpeg.
- **Frontend Target:** Existing Next.js frontend deployed on Vercel (`https://amine-site-yozoro.vercel.app`).

---

## 2. Environment Variables Checklist

Ensure these variables are set in production:

```env
NODE_ENV=production
PORT=4000
API_PREFIX=/api/v1
CORS_ORIGINS=https://amine-site-yozoro.vercel.app
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
SESSION_SECRET=strong-random-32-char-secret
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
STORAGE_DRIVER=gcs
GCS_PROJECT_ID=your-gcp-project-id
GCS_STAGING_BUCKET=yozoro-staging
GCS_MEDIA_BUCKET=yozoro-media
WORKER_API_KEY=strong-random-worker-key
STREAMING_TOKEN_SECRET=strong-random-streaming-secret
ANILIST_API_URL=https://graphql.anilist.co
```

---

## 3. Build & Run Commands

```bash
# Install dependencies
npm ci

# Generate Prisma Client
npm run prisma:generate

# Apply Database Migrations
npm run prisma:deploy

# Build TypeScript to dist/
npm run build

# Start Production Server
npm start
```

