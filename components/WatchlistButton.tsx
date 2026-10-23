"use client";
import { useState } from "react";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

/** Local-state demo. Persist to your backend (or localStorage) when you add accounts. */
export default function WatchlistButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button type="button" aria-pressed={saved} onClick={() => setSaved((s) => !s)} className={cn("btn-ghost", saved && "border-accent/60 text-accent")}>
      <Bookmark aria-hidden className={cn("h-4 w-4", saved && "fill-accent")} />
      {saved ? "In your list" : "Add to list"}
    </button>
  );
}