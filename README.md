# 🌸 YOZORO — Anime Discovery & Streaming UI

<p align="center">
  <strong>Discover your next favorite anime.</strong><br/>
  Browse seasonal picks, explore titles, check episode schedules, and enjoy an anime-inspired viewing experience.
</p>

<p align="center">
  <a href="https://amine-site-yozoro.vercel.app/"><strong>🌐 Live Demo</strong></a> ·
  <a href="https://github.com/Coderzer69/AmineSite-YOZORO"><strong>📦 Source Code</strong></a>
</p>

---

## ✨ About the Project

**YOZORO** is a modern anime discovery website built with **Next.js, React, TypeScript, and Tailwind CSS**. It brings together an immersive home page, searchable anime catalogue, detailed title pages, episode viewing routes, and a weekly schedule in one responsive interface.

The project currently uses **local mock data** through a dedicated data-access layer, making it easy to replace with a real anime API or backend in the future.

## 🚀 Features

- **Anime discovery** — spotlight, trending, popular, top-rated, and currently airing sections.
- **Browse & filter** — explore the catalogue and filter by genre, year, season, type, and airing status.
- **Search** — find anime by title, with responsive search interactions.
- **Anime details** — view title information, genres, status, recommendations, and episode lists.
- **Watch interface** — dedicated routes for anime episodes.
- **Weekly schedule** — browse scheduled anime by day.
- **Watchlist UI** — save and revisit titles through the watchlist interaction.
- **Community UI** — episode comment section for discussion.
- **Responsive experience** — layouts designed for desktop and smaller screens.
- **Polished interactions** — animations, carousels, loading states, and reusable UI components.
- **Maintainable structure** — typed data models and a separate API/data layer.

> **Note:** Anime data, schedules, episodes, and comments are currently mocked in the project. The watch page provides a viewing interface; availability of actual video streams depends on the configured content source. Authentication and persistent user data should be treated as UI/demo functionality unless separately connected to a backend.

## 🧰 Tech Stack

| Technology | Purpose |
| --- | --- |
| [Next.js](https://nextjs.org/) 14 | React framework and file-based routing |
| [React](https://react.dev/) 18 | Component-based UI |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe application code |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | UI animation |
| [GSAP](https://gsap.com/) | Motion and animation utilities |
| [Swiper](https://swiperjs.com/) | Interactive sliders and carousels |
| [Lucide React](https://lucide.dev/) | Icons |

## 🖥️ Getting Started

### Prerequisites

Install **Node.js** (LTS recommended) and npm.

### 1. Clone the repository

```bash
git clone https://github.com/Coderzer69/AmineSite-YOZORO.git
cd AmineSite-YOZORO
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create a production build

```bash
npm run build
npm run start
```

The production server runs on port 3000 by default unless configured otherwise by the hosting platform.

## 📁 Project Structure

```text
AmineSite-YOZORO/
├── app/                    # Next.js routes, layouts, and global styles
│   ├── anime/[id]/         # Anime detail page
│   ├── browse/             # Browse and filter catalogue
│   ├── schedule/           # Weekly anime schedule
│   ├── watch/[id]/[ep]/    # Episode viewing route
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api.ts              # Anime data access functions
│   ├── mock-data.ts        # Demo catalogue data
│   ├── types.ts            # Shared TypeScript types
│   ├── art.ts              # Artwork helpers
│   └── utils.ts             # Utility functions
├── public/                 # Static assets (if added)
├── package.json
└── README.md
```

## 🧭 Main Pages

| Route | Description |
| --- | --- |
| `/` | Home page and anime discovery |
| `/browse` | Browse, search, and filter titles |
| `/anime/[id]` | Anime details and recommendations |
| `/schedule` | Weekly airing schedule |
| `/watch/[id]/[ep]` | Episode viewing interface |

## 🛠️ Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run the configured Next.js lint command |

## 🌱 Future Improvements

- Connect a live anime API for current catalogue and season data.
- Add secure authentication and persistent watchlists.
- Store comments and user preferences in a database.
- Integrate a reliable, licensed video provider for episode playback.
- Add automated tests, accessibility checks, and performance monitoring.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a pull request.

## 📄 License

No license file is currently specified in this repository. Unless a license is added, reuse and redistribution are not automatically permitted.

---

<p align="center">
  Made with ☕ and a love for anime.
</p>
