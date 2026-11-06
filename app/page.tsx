import { Suspense } from "react";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Carousel from "@/components/Carousel";
import AnimeCard from "@/components/AnimeCard";
import GenreList from "@/components/GenreList";
import Top10Tabs from "@/components/TopTabs";
import Reveal from "@/components/Reveal";
import { HeroSkeleton, RowSkeleton, GridSkeleton } from "@/components/Skeleton";
import {
  getGenres, getMostPopular, getRecentlyUpdated, getSpotlight, getTopAiring, getTrending,
} from "@/lib/api";

async function Spotlight() {
  return <HeroSlider items={await getSpotlight()} />;
}
async function Trending() {
  return <Carousel title="Trending now" items={await getTrending()} ranked />;
}
async function TopAiring() {
  return <Carousel title="Top airing" items={await getTopAiring()} href="/browse?status=Airing" />;
}
async function MostPopular() {
  return <Carousel title="Most popular" items={await getMostPopular()} />;
}
async function Recent() {
  const items = await getRecentlyUpdated();
  return (
    <section aria-labelledby="recent-h">
      <div className="mb-4 flex items-end justify-between">
        <h2 id="recent-h" className="text-xl font-bold md:text-2xl">Recently updated</h2>
        <Link href="/browse?status=Airing" className="text-sm font-medium text-mist-300 hover:text-accent">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {items.map((a) => <AnimeCard key={a.id} anime={a} />)}
      </div>
    </section>
  );
}
async function Genres() {
  return <GenreList genres={await getGenres()} />;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="-mt-16"><HeroSkeleton /></div>}>
        <Spotlight />
      </Suspense>

      <div className="container-x mt-12 grid gap-12 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-14">
          <Reveal><Suspense fallback={<RowSkeleton />}><Trending /></Suspense></Reveal>
          <Reveal><Suspense fallback={<GridSkeleton count={10} />}><Recent /></Suspense></Reveal>
          <Reveal><Suspense fallback={<RowSkeleton />}><TopAiring /></Suspense></Reveal>
          <Reveal><Suspense fallback={<RowSkeleton />}><MostPopular /></Suspense></Reveal>
        </div>

        <aside aria-label="Sidebar" className="space-y-8">
          <Reveal><Suspense fallback={null}><Genres /></Suspense></Reveal>
          <Reveal><Top10Tabs /></Reveal>
        </aside>
      </div>
    </>
  );
}