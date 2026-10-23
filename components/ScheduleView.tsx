"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ScheduleItem } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FULL: Record<string, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

export default function ScheduleView({ data }: { data: Record<string, ScheduleItem[]> }) {
  const [selected, setSelected] = useState("Mon");
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const d = DAYS[(new Date().getDay() + 6) % 7];
    setToday(d);
    setSelected(d);
  }, []);

  return (
    <div>
      <div role="tablist" aria-label="Day of the week" className="mb-6 grid grid-cols-7 gap-1 rounded-2xl bg-white/5 p-1 lg:hidden">
        {DAYS.map((d) => (
          <button
            key={d} role="tab" type="button" aria-selected={selected === d} aria-controls={`day-${d}`}
            onClick={() => setSelected(d)}
            className={cn("rounded-xl py-2 text-xs font-semibold transition sm:text-sm", selected === d ? "bg-accent" : "text-mist-300 hover:text-white")}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        {DAYS.map((d) => (
          <section
            key={d} id={`day-${d}`} aria-label={FULL[d]}
            className={cn(selected === d ? "block" : "hidden", "lg:block")}
          >
            <h2
              className={cn(
                "mb-3 hidden items-center justify-between rounded-xl px-3 py-2 text-sm font-bold lg:flex",
                today === d ? "bg-accent text-white" : "bg-white/5",
              )}
            >
              {d}
              {today === d && <span className="text-xs font-medium">Today</span>}
            </h2>
            <ul className="space-y-2">
              {data[d]?.length ? (
                data[d].map((s, i) => (
                  <li key={`${s.animeId}-${i}`}>
                    <Link
                      href={`/anime/${s.animeId}`}
                      className="block rounded-xl border border-white/10 bg-ink-900/70 p-3 transition hover:border-accent/50 hover:bg-ink-800"
                    >
                      <span className="text-xs font-semibold text-accent">{s.time}</span>
                      <span className="mt-0.5 block text-sm font-semibold leading-snug">{s.title}</span>
                      <span className="text-xs text-mist-500">Episode {s.episode}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-mist-500">
                  Nothing scheduled.
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}