"use client";
import { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import AnimeCard from "./AnimeCard";
import type { Anime } from "@/lib/types";

interface Props {
  title: string;
  items: Anime[];
  href?: string;
  ranked?: boolean;
}

export default function Carousel({ title, items, href = "/browse", ranked = false }: Props) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const sync = (s: SwiperType) => setEdge({ start: s.isBeginning, end: s.isEnd });

  const arrow =
    "grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:border-accent hover:bg-accent disabled:pointer-events-none disabled:opacity-30";

  return (
    <section aria-label={title}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        <div className="flex items-center gap-2">
          <Link href={href} className="mr-2 text-sm font-medium text-mist-300 hover:text-accent">View all</Link>
          <button type="button" aria-label={`Previous ${title}`} disabled={edge.start} onClick={() => swiper?.slidePrev()} className={arrow}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" aria-label={`Next ${title}`} disabled={edge.end} onClick={() => swiper?.slideNext()} className={arrow}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[A11y, Keyboard]}
        keyboard
        speed={700}
        onSwiper={(s) => { setSwiper(s); sync(s); }}
        onSlideChange={sync}
        onResize={sync}
        spaceBetween={12}
        slidesPerView={2.2}
        slidesPerGroup={2}
        breakpoints={{
          640: { slidesPerView: 3.2, slidesPerGroup: 3, spaceBetween: 14 },
          768: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 16 },
          1280: { slidesPerView: 5, slidesPerGroup: 5, spaceBetween: 16 },
        }}
        className="!overflow-visible lg:!overflow-hidden !py-2"
      >
        {items.map((a, i) => (
          <SwiperSlide key={a.id}>
            <AnimeCard anime={a} rank={ranked ? i + 1 : undefined} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}