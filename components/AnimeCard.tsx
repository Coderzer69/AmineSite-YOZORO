"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Star } from "lucide-react";
import type { Anime } from "@/lib/types";

interface Props {
  anime: Anime;
  priority?: boolean;
  rank?: number;
}

export default function AnimeCard({ anime, priority = false, rank }: Props) {
  const reduce = useReducedMotion();
  const episodeLabel = anime.type === "Movie" ? "Movie" : `Ep ${anime.aired || 0}/${anime.episodes}`;

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative"
    >
      <Link
        href={`/anime/${anime.id}`}
        aria-label={`${anime.title}, ${anime.type}, rated ${anime.rating}`}
        className="block rounded-xl"
      >
        <div className="relative aspect-[5/7] overflow-hidden rounded-xl bg-ink-800 transition-shadow duration-500 ease-smooth group-hover:shadow-glow group-focus-within:shadow-glow">
          <Image
            src={anime.poster}
            alt={`${anime.title} poster`}
            fill
            unoptimized
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(min-width:1280px) 16vw, (min-width:768px) 22vw, 45vw"
            className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-110"
          />

          {rank !== undefined && (
            <span className="absolute left-0 top-0 rounded-br-xl bg-accent px-2.5 py-1 font-display text-sm font-bold">
              #{rank}
            </span>
          )}
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-semibold backdrop-blur">
            <Star className="h-3 w-3 fill-accent text-accent" aria-hidden /> {anime.rating.toFixed(1)}
          </span>
          <span className="absolute bottom-2 left-2 chip bg-black/60 backdrop-blur">{episodeLabel}</span>

          {/* hover/focus preview overlay */}
          <div
            aria-hidden
            className="absolute inset-0 flex flex-col justify-end gap-2 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <span className="mx-auto mb-1 grid h-12 w-12 place-items-center rounded-full bg-accent shadow-glow">
              <Play className="h-5 w-5 translate-x-0.5 fill-white" />
            </span>
            <p className="line-clamp-3 text-xs leading-snug text-mist-300">{anime.synopsis}</p>
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((g) => (
                <span key={g} className="chip">{g}</span>
              ))}
            </div>
          </div>
        </div>

        <h3 className="mt-2.5 line-clamp-1 text-sm font-semibold transition-colors group-hover:text-accent">
          {anime.title}
        </h3>
        <p className="text-xs text-mist-500">{anime.type}, {anime.year}</p>
      </Link>
    </motion.article>
  );
}