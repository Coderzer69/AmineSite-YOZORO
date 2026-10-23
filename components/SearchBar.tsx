"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { searchAnime } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import type { Anime } from "@/lib/types";

export default function SearchBar({ onNavigate, className = "" }: { onNavigate?: () => void; className?: string }) {
  const router = useRouter();
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Anime[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(q, 250);

  useEffect(() => {
    let cancelled = false;
    if (!debounced.trim()) { setResults([]); return; }
    setLoading(true);
    searchAnime(debounced).then((r) => {
      if (cancelled) return;
      setResults(r); setLoading(false); setActive(-1);
    });
    return () => { cancelled = true; };
  }, [debounced]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (path: string) => {
    setOpen(false); setQ(""); onNavigate?.(); router.push(path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    else if (e.key === "Escape") { setOpen(false); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && results[active]) go(`/anime/${results[active].id}`);
      else if (q.trim()) go(`/browse?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const showList = open && q.trim().length > 0;

  return (
    <div ref={wrapRef} className={`relative ${className}`} role="search">
      <label htmlFor={`${id}-input`} className="sr-only">Search anime</label>
      <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
      <input
        id={`${id}-input`}
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        value={q}
        placeholder="Search anime"
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-9 text-sm text-mist-100 placeholder:text-mist-500 transition focus:border-accent/60 focus:bg-white/10"
      />
      {q && (
        <button type="button" aria-label="Clear search" onClick={() => { setQ(""); setResults([]); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-mist-500 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      )}

      {showList && (
        <ul id={`${id}-list`} role="listbox" aria-label="Search suggestions"
          className="glass absolute left-0 right-0 top-12 z-50 max-h-96 overflow-auto rounded-2xl p-2 shadow-lift">
          {loading && <li className="px-3 py-3 text-sm text-mist-500" role="presentation">Searching…</li>}
          {!loading && results.length === 0 && (
            <li className="px-3 py-3 text-sm text-mist-500" role="presentation">No titles match &quot;{q}&quot;. Try a shorter name.</li>
          )}
          {!loading && results.map((a, i) => (
            <li key={a.id} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(`/anime/${a.id}`)}
                className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${i === active ? "bg-white/10" : "hover:bg-white/5"}`}>
                <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md">
                  <Image src={a.poster} alt="" fill sizes="40px" unoptimized className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{a.title}</span>
                  <span className="block truncate text-xs text-mist-500">{a.japanese}, {a.type}, {a.year}</span>
                </span>
              </button>
            </li>
          ))}
          {!loading && results.length > 0 && (
            <li role="presentation" className="mt-1 border-t border-white/10 pt-1">
              <button type="button" onClick={() => go(`/browse?q=${encodeURIComponent(q.trim())}`)}
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-accent hover:bg-white/5">
                See all results
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}