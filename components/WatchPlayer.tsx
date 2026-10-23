"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Anime } from "@/lib/types";

const SERVERS = ["Server 1", "Server 2", "Server 3"];
const AUDIO = ["Sub", "Dub"] as const;

interface Props {
  anime: Anime;
  episode: number;
  total: number;
}

export default function WatchPlayer({ anime, episode, total }: Props) {
  const [server, setServer] = useState(SERVERS[0]);
  const [audio, setAudio] = useState<(typeof AUDIO)[number]>("Sub");
  const [playing, setPlaying] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  const prev = episode > 1 ? `/watch/${anime.id}/${episode - 1}` : null;
  const next = episode < total ? `/watch/${anime.id}/${episode + 1}` : null;

  const navBtn = "btn-ghost !px-4 aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-lift">
        <Image src={anime.banner} alt="" fill unoptimized priority sizes="(min-width:1024px) 70vw, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />

        {!playing ? (
          <button
            type="button" onClick={() => setPlaying(true)}
            aria-label={`Play episode ${episode}, ${server}, ${audio}`}
            className="group absolute inset-0 grid place-items-center"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-accent shadow-glow transition duration-300 ease-smooth group-hover:scale-110">
              <Play className="h-8 w-8 translate-x-0.5 fill-white" />
            </span>
          </button>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-6 text-center" role="status">
            {/*
              MOUNT YOUR PLAYER HERE
              e.g. <video ref={...} controls /> with hls.js, or an <iframe> from a provider you are licensed to use.
            */}
            <div className="glass max-w-md rounded-2xl p-6">
              <p className="font-display text-lg font-bold">Demo player</p>
              <p className="mt-2 text-sm text-mist-300">
                {anime.title}, episode {episode} on {server} ({audio}). This demo hosts no video, so mount a licensed source in <code className="text-accent">WatchPlayer.tsx</code>.
              </p>
              <button type="button" onClick={() => setPlaying(false)} className="btn-ghost mt-4">Stop</button>
            </div>
          </div>
        )}
      </div>

      {/* controls bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={prev ?? "#"} aria-disabled={!prev} tabIndex={prev ? 0 : -1} className={navBtn}>
            <ChevronLeft aria-hidden className="h-4 w-4" /> Prev
          </Link>
          <Link href={next ?? "#"} aria-disabled={!next} tabIndex={next ? 0 : -1} className={navBtn}>
            Next <ChevronRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span id="autonext-label" className="text-mist-300">Auto next</span>
          <button
            type="button" role="switch" aria-checked={autoNext} aria-labelledby="autonext-label"
            onClick={() => setAutoNext((a) => !a)}
            className={cn("relative h-6 w-11 rounded-full transition-colors", autoNext ? "bg-accent" : "bg-white/20")}
          >
            <span className={cn("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ease-smooth", autoNext && "translate-x-5")} />
          </button>
        </div>
      </div>

      {/* server selector */}
      <div className="mt-5 grid gap-4 rounded-2xl border border-white/10 bg-ink-900/70 p-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <p className="flex items-center gap-2 text-sm text-mist-300">
          <Server aria-hidden className="h-4 w-4 text-accent" /> If playback fails, switch server.
        </p>
        <div className="flex flex-wrap gap-4 sm:justify-end">
          <div role="group" aria-label="Audio" className="flex gap-1.5">
            {AUDIO.map((a) => (
              <button key={a} type="button" aria-pressed={audio === a} onClick={() => setAudio(a)}
                className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold transition", audio === a ? "bg-accent" : "bg-white/5 text-mist-300 hover:text-white")}>
                {a}
              </button>
            ))}
          </div>
          <div role="group" aria-label="Server" className="flex gap-1.5">
            {SERVERS.map((s) => (
              <button key={s} type="button" aria-pressed={server === s} onClick={() => setServer(s)}
                className={cn("rounded-lg px-3.5 py-1.5 text-sm font-semibold transition", server === s ? "bg-white text-ink-950" : "bg-white/5 text-mist-300 hover:text-white")}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}