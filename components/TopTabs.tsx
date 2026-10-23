"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { getTop10 } from "@/lib/api";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";
import type { Anime, Period } from "@/lib/types";

const tabs: { id: Period; label: string }[] = [
  { id: "day", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export default function Top10Tabs() {
  const [period, setPeriod] = useState<Period>("day");
  const [cache, setCache] = useState<Partial<Record<Period, Anime[]>>>({});

  useEffect(() => {
    if (cache[period]) return;
    let cancelled = false;
    getTop10(period).then((r) => { if (!cancelled) setCache((c) => ({ ...c, [period]: r })); });
    return () => { cancelled = true; };
  }, [period, cache]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === period);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else return;
    e.preventDefault();
    setPeriod(tabs[next].id);
    document.getElementById(`top10-tab-${tabs[next].id}`)?.focus();
  };

  const items = cache[period];

  return (
    <section aria-labelledby="top10-h" className="rounded-2xl border border-white/10 bg-ink-900/70 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="top10-h" className="text-lg font-bold">Top 10</h2>
        <div role="tablist" aria-label="Top 10 period" onKeyDown={onKeyDown} className="flex rounded-full bg-white/5 p-1">
          {tabs.map((t) => (
            <button
              key={t.id} id={`top10-tab-${t.id}`} role="tab" type="button"
              aria-selected={period === t.id} aria-controls="top10-panel"
              tabIndex={period === t.id ? 0 : -1}
              onClick={() => setPeriod(t.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                period === t.id ? "bg-accent text-white" : "text-mist-300 hover:text-white",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div id="top10-panel" role="tabpanel" aria-labelledby={`top10-tab-${period}`} aria-live="polite">
        {!items ? (
          <ul className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => <li key={i}><Skeleton className="h-16 w-full" /></li>)}
          </ul>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ol
              key={period}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1"
            >
              {items.map((a, i) => (
                <li key={a.id}>
                  <Link href={`/anime/${a.id}`} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
                    <span className={cn("w-7 text-center font-display text-xl font-bold", i < 3 ? "text-accent" : "text-mist-500")}>
                      {i + 1}
                    </span>
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md">
                      <Image src={a.poster} alt="" fill unoptimized sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold group-hover:text-accent">{a.title}</span>
                      <span className="block truncate text-xs text-mist-500">{a.genres.slice(0, 2).join(", ")}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3 w-3 fill-accent text-accent" aria-hidden />{a.rating.toFixed(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}