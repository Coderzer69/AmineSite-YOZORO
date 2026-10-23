"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { GENRES } from "@/lib/mock-data";

const YEARS = [2027, 2026, 2025, 2024, 2023];
const SEASONS = ["Winter", "Spring", "Summer", "Fall"];
const TYPES = ["TV", "Movie", "OVA", "ONA"];
const STATUSES = ["Airing", "Completed", "Upcoming"];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const select = (key: string, label: string, options: (string | number)[]) => (
    <div>
      <label htmlFor={`f-${key}`} className="mb-1 block text-xs font-medium text-mist-500">{label}</label>
      <select
        id={`f-${key}`} value={params.get(key) ?? ""} onChange={(e) => set(key, e.target.value)}
        className="h-10 w-full rounded-xl border border-white/10 bg-ink-800 px-3 text-sm focus:border-accent/60"
      >
        <option value="">Any</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const hasFilters = ["q", "genre", "year", "season", "type", "status"].some((k) => params.get(k));

  return (
    <form role="search" aria-label="Filter anime" onSubmit={(e) => e.preventDefault()}
      aria-busy={pending}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-ink-900/70 p-4 sm:grid-cols-3 lg:grid-cols-6">
      {select("genre", "Genre", GENRES)}
      {select("year", "Year", YEARS)}
      {select("season", "Season", SEASONS)}
      {select("type", "Type", TYPES)}
      {select("status", "Status", STATUSES)}
      <div className="flex items-end">
        {hasFilters && (
          <Link href="/browse" className="btn-ghost h-10 w-full">Clear filters</Link>
        )}
      </div>
    </form>
  );
}