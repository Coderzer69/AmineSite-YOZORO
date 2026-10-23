"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Play, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Episode } from "@/lib/types";

interface Props {
  animeId: string;
  episodes: Episode[];
  current?: number;
  layout?: "grid" | "list";
}

export default function EpisodeList({ animeId, episodes, current, layout = "grid" }: Props) {
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);

  const shown = useMemo(
    () => (query.trim() ? episodes.filter((e) => String(e.number).startsWith(query.trim())) : episodes),
    [episodes, query],
  );

  // center the current episode inside the list only (never scroll the page)
  useEffect(() => {
    if (layout !== "list" || !box.current) return;
    const el = box.current.querySelector<HTMLElement>('[aria-current="page"]');
    if (el) box.current.scrollTop = el.offsetTop - box.current.clientHeight / 2 + el.clientHeight / 2;
  }, [layout, current]);

  if (episodes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-mist-500">
        No episodes have aired yet. Check the schedule for the premiere date.
      </p>
    );
  }

  return (
    <div>
      {episodes.length > 12 && (
        <div className="relative mb-3">
          <label htmlFor={`ep-find-${layout}`} className="sr-only">Jump to episode number</label>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
          <input
            id={`ep-find-${layout}`} inputMode="numeric" value={query}
            onChange={(e) => setQuery(e.target.value.replace(/\D/g, ""))}
            placeholder="Jump to episode"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm placeholder:text-mist-500 focus:border-accent/60"
          />
        </div>
      )}

      {shown.length === 0 && <p className="py-4 text-sm text-mist-500">No episode with that number.</p>}

      {layout === "grid" ? (
        <ul className="grid grid-cols-5 gap-2 xs:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 xl:grid-cols-12">
          {shown.map((e) => (
            <li key={e.number}>
              <Link
                href={`/watch/${animeId}/${e.number}`}
                aria-label={`Watch episode ${e.number}`}
                className={cn(
                  "grid h-11 place-items-center rounded-lg text-sm font-semibold transition",
                  e.number === current ? "bg-accent text-white shadow-glow" : "bg-white/5 hover:bg-accent/20 hover:text-accent",
                )}
              >
                {e.number}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div ref={box} className="relative max-h-[420px] overflow-y-auto pr-1 lg:max-h-[560px]">
          <ul className="space-y-1">
            {shown.map((e) => {
              const isCurrent = e.number === current;
              return (
                <li key={e.number}>
                  <Link
                    href={`/watch/${animeId}/${e.number}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                      isCurrent ? "bg-accent/15 text-white ring-1 ring-accent/60" : "hover:bg-white/5",
                    )}
                  >
                    <span className={cn("w-7 text-center font-display font-bold", isCurrent ? "text-accent" : "text-mist-500")}>
                      {e.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{e.title}</span>
                      <span className="text-xs text-mist-500">{e.duration}</span>
                    </span>
                    {isCurrent && <Play aria-hidden className="h-4 w-4 fill-accent text-accent" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}