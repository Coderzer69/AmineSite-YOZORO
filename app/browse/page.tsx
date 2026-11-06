import { Suspense } from "react";
import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import FilterBar from "@/components/FilterBar";
import Pagination from "@/components/Pagination";
import { GridSkeleton } from "@/components/Skeleton";
import { browseAnime } from "@/lib/api";
import type { AnimeStatus, AnimeType, BrowseFilters, Season } from "@/lib/types";

export const metadata: Metadata = { title: "Browse" };

type SP = Record<string, string | undefined>;

function parse(sp: SP): BrowseFilters {
  return {
    q: sp.q,
    genre: sp.genre,
    year: sp.year ? Number(sp.year) : undefined,
    season: sp.season as Season | undefined,
    type: sp.type as AnimeType | undefined,
    status: sp.status as AnimeStatus | undefined,
    page: sp.page ? Number(sp.page) : 1,
  };
}

async function Results({ filters, sp }: { filters: BrowseFilters; sp: SP }) {
  const { items, total, pages, page } = await browseAnime(filters);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
        <p className="text-lg font-semibold">No anime match these filters</p>
        <p className="mt-1 text-sm text-mist-500">Remove a filter or try a different title.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-mist-500" aria-live="polite">
        {total} {total === 1 ? "result" : "results"}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {items.map((a, i) => <AnimeCard key={a.id} anime={a} priority={i < 6} />)}
      </div>
      <Pagination page={page} pages={pages} params={sp} />
    </>
  );
}

export default function BrowsePage({ searchParams }: { searchParams: SP }) {
  const filters = parse(searchParams);
  return (
    <div className="container-x py-10">
      <h1 className="mb-6 text-3xl font-extrabold md:text-4xl">
        {filters.q ? `Results for "${filters.q}"` : "Browse anime"}
      </h1>
      <Suspense fallback={null}><FilterBar /></Suspense>
      <div className="mt-8">
        <Suspense key={JSON.stringify(filters)} fallback={<GridSkeleton />}>
          <Results filters={filters} sp={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}