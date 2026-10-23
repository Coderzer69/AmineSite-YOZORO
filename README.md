# 🌸 YOZORO — Anime Streaming Platform

<p align="center">
  <strong>Discover anime. Find your next favorite. Keep watching.</strong><br/>
  A modern anime discovery and streaming platform designed for fans.
</p>

<p align="center">
  <a href="https://amine-site-yozoro.vercel.app/"><strong>🌐 Live Website</strong></a> ·
  <a href="https://github.com/Coderzer69/AmineSite-YOZORO"><strong>📦 GitHub Repository</strong></a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Project status" src="https://img.shields.io/badge/Status-In%20Development-orange" />
</p>

---

## 📖 About YOZORO

**YOZORO** is a modern anime platform designed to bring anime discovery, episode playback, and personalized viewing into one place. The goal is to deliver a polished experience where viewers can explore titles, search and filter the catalogue, view episode details, stream authorized content, manage a watchlist, and track their progress.

The current frontend is built with **Next.js, React, TypeScript, and Tailwind CSS**. The full-stack release is intended to connect this interface to a backend API, persistent database, authentication, and a licensed video delivery provider.

> **Development status:** This README documents the target full-stack product. The repository's current data layer includes mock data. Backend, database, account, and real streaming capabilities should only be described as live once implemented and tested.

## ✨ Features

### 🔎 Anime Discovery
- Featured and trending anime sections.
- Browse anime by genre, year, season, type, and status.
- Search titles by name.
- Anime detail pages with synopsis, metadata, genres, and recommendations.
- Pagination and curated catalogue sections.

### ▶️ Streaming Experience
- Dedicated episode viewing pages.
- Playback controls supported by the selected player.
- Episode list and next/previous episode navigation.
- Subtitle and audio-track selection when supported by the media source.
- Continue watching and saved playback progress for signed-in users.
- Adaptive quality when supported by the streaming provider.
- Secure playback access for authorized video content.

### 👤 User Accounts
- Sign up, sign in, sign out, and profile management.
- Personal watchlist.
- Viewing history and continue-watching list.
- Persistent playback progress and preferences.
- Secure sessions and server-side authorization.

### 💬 Community
- Episode-specific comments.
- Comment editing and deletion by the author.
- Reactions and reporting, if enabled.
- Moderation tools for community safety.

### 🛠️ Admin Management
- Protected admin dashboard.
- Manage anime titles, seasons, episodes, metadata, and artwork.
- Configure authorized media sources and subtitle tracks.
- Moderate comments and user reports.
- Role-based access controls.

*Features listed here describe the intended complete platform and depend on the final backend and service integrations.*

## 🧰 Technology Stack

### Current Frontend
| Technology | Purpose |
| --- | --- |
| [Next.js 14](https://nextjs.org/) | React framework and routing |
| [React 18](https://react.dev/) | Component-based user interface |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Responsive styling |
| [Framer Motion](https://www.framer.com/motion/) | UI animations |
| [GSAP](https://gsap.com/) | Motion effects |
| [Swiper](https://swiperjs.com/) | Sliders and carousels |
| [Lucide React](https://lucide.dev/) | Icons |

### Suggested Full-Stack Architecture
The backend technologies below are recommendations, not claims about dependencies already present in this repository.

| Layer | Example | Responsibility |
| --- | --- | --- |
| Backend API | Node.js + TypeScript + Express, or Next.js Route Handlers | Business logic and API endpoints |
| Database | PostgreSQL | Users, anime, episodes, watchlists, comments, and progress |
| ORM | Prisma or Drizzle | Typed database access and migrations |
| Authentication | Secure server-managed sessions or an identity provider | Identity and access control |
| Media delivery | Licensed streaming provider or storage + CDN | Video and subtitle delivery |
| Image delivery | Image CDN or object storage | Posters, banners, and thumbnails |
| Hosting | Vercel or another compatible host | Web app and API hosting |
| Observability | Error tracking and structured logs | Diagnostics and reliability |

## 🏗️ Architecture Overview

```text
Viewer
  |
  v
Next.js Frontend
  | HTTPS API requests
  v
Backend API
  |--------------------------|
  v                          v
PostgreSQL              Media Provider / CDN
(users, catalogue,      (authorized video,
watchlists, progress,    subtitles, artwork)
comments)
```

The backend should validate incoming requests, enforce permissions, and return only data the requester is allowed to access. Video should be delivered through an appropriate media provider/CDN rather than passing large video files through ordinary API endpoints unless the architecture specifically requires it.

## 🗺️ Frontend Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and anime discovery |
| `/browse` | Browse, search, and filter titles |
| `/anime/[id]` | Anime details and recommendations |
| `/schedule` | Weekly schedule |
| `/watch/[id]/[ep]` | Episode viewing interface |

## 🔌 Example Backend API Design

These are proposed endpoint examples for the completed platform, not verified routes in the current codebase. Update this section to match the implemented API.

| Method | Example endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/anime` | List and filter anime |
| `GET` | `/api/anime/:id` | Get anime details |
| `GET` | `/api/anime/:id/episodes` | List episodes |
| `GET` | `/api/episodes/:id/playback` | Authorize playback and return playback details |
| `GET` | `/api/me/watchlist` | Get the current user's watchlist |
| `POST` | `/api/me/watchlist` | Add a title to the watchlist |
| `DELETE` | `/api/me/watchlist/:animeId` | Remove a title |
| `PUT` | `/api/me/progress/:episodeId` | Save viewing progress |
| `GET` | `/api/episodes/:id/comments` | List episode comments |
| `POST` | `/api/episodes/:id/comments` | Create a comment |

## 🚀 Getting Started

### Prerequisites
- Node.js LTS
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Coderzer69/AmineSite-YOZORO.git
cd AmineSite-YOZORO
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
npm run build
npm run start
```

These commands are for the current frontend package. If the backend is in a separate directory or repository, install its dependencies and follow its own setup instructions too.

## ⚙️ Environment Variables

For a frontend that calls a separately hosted API, an example `.env.local` may look like this:

```dotenv
# Example only; use the variable name supported by your implementation
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Backend configuration may require a database URL, session/authentication secrets, media-provider credentials, object-storage credentials, and allowed frontend origins. Add only variables required by the services actually selected for the project.

**Security checklist**
- Never commit `.env` files, passwords, tokens, private keys, or database credentials.
- Only expose a `NEXT_PUBLIC_*` value if it is safe for every browser visitor to see.
- Validate environment variables at startup.
- Use separate credentials for development and production.
- Rotate any secret that is accidentally exposed.

## 🗄️ Suggested Data Model

A production database may include the following entities:

- **User:** account identity, role, and timestamps.
- **Anime:** titles, synopsis, artwork, genres, year, season, and status.
- **Episode:** anime relationship, episode number, title, duration, and release information.
- **MediaAsset:** provider reference, subtitle/audio metadata, and access configuration.
- **WatchlistItem:** user-to-anime relationship.
- **WatchProgress:** user, episode, playback position, and last-watched time.
- **Comment:** author, episode, content, moderation state, and timestamps.
- **Report:** user-submitted moderation reports and resolution status.

Use database constraints, indexes, migrations, and server-side validation. Never return private provider credentials or signing keys to the browser.

## 🚢 Production Deployment Checklist

- [ ] Deploy the frontend and backend to the selected hosting providers.
- [ ] Configure production environment variables and secret storage.
- [ ] Provision the database and apply migrations.
- [ ] Implement and test authentication and protected routes.
- [ ] Connect a licensed video streaming provider.
- [ ] Configure artwork, subtitles, and playback error handling.
- [ ] Protect playback URLs with authorization or expiring signatures where supported.
- [ ] Configure HTTPS, CORS, request validation, and rate limiting.
- [ ] Set up database backups, health checks, structured logs, and error monitoring.
- [ ] Test mobile layouts, accessibility, performance, and slow network conditions.
- [ ] Verify all streamed content is legally authorized for distribution.

## 🔐 Security & Content Responsibility

- Use HTTPS for all production traffic.
- If managing passwords directly, use a suitable password-hashing algorithm; never store plaintext passwords.
- Use secure, HTTP-only cookies for server-managed sessions where appropriate.
- Authorize every private and administrative operation on the server.
- Rate-limit sensitive endpoints and protect comments against spam and abuse.
- Keep provider tokens and signing secrets on the server.
- Avoid logging credentials, tokens, or sensitive user data.
- Stream only content that the platform has permission to distribute.

## 🧪 Testing Recommendations

Before launch, test:
- Catalogue search, filters, and pagination.
- Authentication, session expiration, and access permissions.
- Watchlist and viewing-progress persistence.
- Playback authorization and media failures.
- Comment validation, reporting, and moderation.
- API validation, database constraints, and error responses.
- Responsive layouts, accessibility, and keyboard navigation.

## 🛣️ Roadmap

- [ ] Replace mock catalogue data with a real metadata source.
- [ ] Build the backend API and database schema.
- [ ] Add secure authentication and user profiles.
- [ ] Persist watchlists and playback progress.
- [ ] Integrate an authorized streaming provider and subtitle support.
- [ ] Persist episode comments and add moderation.
- [ ] Build admin tools for catalogue and episode management.
- [ ] Add automated tests, monitoring, backups, and production hardening.

## 🤝 Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push your branch: `git push origin feat/your-feature`
5. Open a pull request with a clear summary and testing notes.

## 📄 License

No license file is currently specified in this repository. Add a license before granting others permission to use, modify, or redistribute the project.

---

<p align="center">
  <strong>YOZORO</strong><br/>
  Made for anime fans. Built for discovery.
</p>
