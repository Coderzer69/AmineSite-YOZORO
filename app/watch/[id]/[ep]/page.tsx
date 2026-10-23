import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WatchPlayer from "@/components/WatchPlayer";
import EpisodeList from "@/components/EpisodeList";
import CommentSection from "@/components/CommentSection";
import Carousel from "@/components/Carousel";
import { getAnime, getComments, getEpisodes, getRecommendations } from "@/lib/api";

type Props = { params: { id: string; ep: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAnime(params.id);
  return { title: a ? `${a.title}, episode ${params.ep}` : "Watch" };
}

export default async function WatchPage({ params }: Props) {
  const ep = Number(params.ep);
  const [anime, episodes] = await Promise.all([getAnime(params.id), getEpisodes(params.id)]);

  if (!anime || !Number.isInteger(ep) || ep < 1 || ep > episodes.length) notFound();

  const [comments, recs] = await Promise.all([getComments(anime.id, ep), getRecommendations(anime.id)]);
  const current = episodes[ep - 1];

  return (
    <div className="container-x py-6">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist-500">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li><Link href="/" className="hover:text-white">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/anime/${anime.id}`} className="hover:text-white">{anime.title}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-mist-300">Episode {ep}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <WatchPlayer anime={anime} episode={ep} total={episodes.length} />

          <div className="mt-6">
            <h1 className="text-2xl font-extrabold md:text-3xl">{anime.title}</h1>
            <p className="mt-1 text-mist-300">{current.title}, {current.duration}</p>
          </div>

          <CommentSection initial={comments} />
        </div>

        <aside aria-label="Episodes" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-white/10 bg-ink-900/70 p-4">
            <h2 className="mb-3 text-lg font-bold">Episodes</h2>
            <EpisodeList animeId={anime.id} episodes={episodes} current={ep} layout="list" />
          </div>
        </aside>
      </div>

      {recs.length > 0 && (
        <div className="mt-14">
          <Carousel title="More like this" items={recs} />
        </div>
      )}
    </div>
  );
}