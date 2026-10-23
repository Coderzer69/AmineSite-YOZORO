import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
}

export default function Pagination({ page, pages, params }: Props) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && k !== "page" && qs.set(k, v));
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `/browse?${s}` : "/browse";
  };

  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );

  const base = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-semibold transition";

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} aria-label="Previous page" className={cn(base, "bg-white/5 hover:bg-white/10")}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      )}
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span aria-hidden className="text-mist-500">…</span>}
          <Link
            href={href(n)} aria-current={n === page ? "page" : undefined}
            className={cn(base, n === page ? "bg-accent text-white shadow-glow" : "bg-white/5 hover:bg-white/10")}
          >
            {n}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} aria-label="Next page" className={cn(base, "bg-white/5 hover:bg-white/10")}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </nav>
  );
}