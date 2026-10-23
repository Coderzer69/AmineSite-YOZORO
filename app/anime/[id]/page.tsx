import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Play, Star } from "lucide-react";
import Carousel from "@/components/Carousel";
import EpisodeList from "@/components/EpisodeList";
import WatchlistButton from "@/components/WatchlistButton";
import { getAnime, getEpisodes, getRecommendations } from "@/lib/api";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAnime(params.id);
  return a ? { title: a.title, description: a.synopsis } : { title: "Not found" };
}

export default async function AnimePage({ params }: Props) {
  const [anime, episodes, recs] = await Promise.all([
    getAnime(params.id),
    getEpisodes(params.id),
    getRecommendations(params.id),
  ]);
  if (!anime) notFound();

  const meta: [string, string][] = [
    ["Japanese", anime.japanese],
    ["Type", anime.type],
    ["Status", anime.status],
    ["Aired", `${anime.season} ${anime.year}`],
    ["Episodes", String(anime.episodes)],
    ["Duration", anime.duration],
    ["Studio", anime.studio],
  ];

  return (
    <article>
      {/* banner */}
      <div className="relative -mt-16 h-[44vh] min-h-[320px] overflow-hidden">
        <Image src={anime.banner} alt="" fill unoptimized priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/30" />
      </div>

      <div className="container-x relative -mt-40 grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="mx-auto w-48 md:w-full">
          <div className="relative aspect-[5/7] overflow-hidden rounded-2xl shadow-lift ring-1 ring-white/10">
            <Image src={anime.poster} alt={`${anime.title} poster`} fill unoptimized priority sizes="280px" className="object-cover" />
          </div>
        </div>

        <div className="pt-2 md:pt-24">
          <h1 className="text-3xl font-extrabold xs:text-4xl lg:text-5xl">{anime.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Star aria-hidden className="h-4 w-4 fill-accent text-accent" /> {anime.rating.toFixed(1)}
              <span className="sr-only"> out of 10</span>
            </span>
            {anime.genres.map((g) => (
              <Link key={g} href={`/browse?genre=${encodeURIComponent(g)}`} className="chip transition hover:bg-accent hover:text-white">{g}</Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {episodes.length > 0 ? (
              <Link href={`/watch/${anime.id}/1`} className="btn-accent">
                <Play aria-hidden className="h-4 w-4 fill-white" /> Watch episode 1
              </Link>
            ) : (
              <span className="btn-ghost cursor-not-allowed opacity-60" aria-disabled>Not yet aired</span>
            )}
            <WatchlistButton />
          </div>

          <h2 className="mt-8 text-lg font-bold">Synopsis</h2>
          <p className="mt-2 max-w-prose leading-relaxed text-mist-300">{anime.synopsis}</p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-white/10 bg-ink-900/70 p-5 sm:grid-cols-3 xl:grid-cols-4">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-mist-500">{k}</dt>
                <dd className="mt-0.5 text-sm font-medium" lang={k === "Japanese" ? "ja" : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="container-x mt-14 space-y-14">
        <section aria-labelledby="eps-h">
          <h2 id="eps-h" className="mb-4 text-xl font-bold md:text-2xl">Episodes</h2>
          <EpisodeList animeId={anime.id} episodes={episodes} layout="grid" />
        </section>
        {recs.length > 0 && <Carousel title="You might also like" items={recs} />}
      </div>
    </article>
  );
}