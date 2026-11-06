"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useReducedMotion } from "framer-motion";
import { Info, Pause, Play, Star } from "lucide-react";
import "swiper/css";
import "swiper/css/effect-fade";
import { gsap } from "@/lib/gsap";
import type { Anime } from "@/lib/types";

export default function HeroSlider({ items }: { items: Anime[] }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  // staggered text reveal on slide change
  useEffect(() => {
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        `[data-slide="${active}"] [data-reveal]`,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.09, ease: "power3.out", delay: 0.1 },
      );
    }, root);
    return () => ctx.revert();
  }, [active, reduce]);

  // scroll parallax on the artwork
  useEffect(() => {
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.to("[data-parallax]", {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, [reduce]);

  // play / pause (and honour reduced motion)
  useEffect(() => {
    const s = swiperRef.current;
    if (!s?.autoplay) return;
    if (playing && !reduce) s.autoplay.start();
    else s.autoplay.stop();
  }, [playing, reduce]);

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Spotlight"
      className="relative -mt-16 h-[78vh] max-h-[820px] min-h-[540px] overflow-hidden"
    >
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Keyboard]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={900}
        rewind
        keyboard
        autoplay={{ delay: 6500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSwiper={(s) => { swiperRef.current = s; if (reduce) s.autoplay.stop(); }}
        onSlideChange={(s) => setActive(s.realIndex)}
        className="h-full"
      >
        {items.map((a, i) => (
          <SwiperSlide key={a.id} data-slide={i} aria-label={`${i + 1} of ${items.length}`}>
            <div className="absolute inset-x-0 -top-[10%] h-[120%]" data-parallax>
              <Image
                src={a.banner} alt="" fill unoptimized priority={i === 0}
                sizes="100vw" className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />

            <span
              aria-hidden lang="ja"
              style={{ writingMode: "vertical-rl" }}
              className="absolute right-6 top-28 hidden select-none text-8xl font-black text-white/10 md:block lg:right-16"
            >
              {a.japanese}
            </span>

            <div className="container-x relative flex h-full items-end pb-24 md:items-center md:pb-0">
              <div className="max-w-2xl">
                <p data-reveal className="mb-3 text-sm font-semibold text-accent">
                  Spotlight #{i + 1}
                </p>
                <h2 data-reveal className="text-4xl font-extrabold leading-[1.02] xs:text-5xl md:text-6xl xl:text-7xl">
                  {a.title}
                </h2>
                <div data-reveal className="mt-4 flex flex-wrap items-center gap-2 text-sm text-mist-300">
                  <span className="chip">{a.type}</span>
                  <span className="chip">{a.year}</span>
                  <span className="chip">{a.duration}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white">
                    <Star className="h-4 w-4 fill-accent text-accent" aria-hidden /> {a.rating.toFixed(1)}
                  </span>
                </div>
                <p data-reveal className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-mist-300 md:text-base">
                  {a.synopsis}
                </p>
                <div data-reveal className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/watch/${a.id}/1`} className="btn-accent">
                    <Play className="h-4 w-4 fill-white" aria-hidden /> Watch now
                  </Link>
                  <Link href={`/anime/${a.id}`} className="btn-ghost">
                    <Info className="h-4 w-4" aria-hidden /> Details
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* controls */}
      <div className="container-x pointer-events-none absolute inset-x-0 bottom-8 z-10 flex items-center gap-4">
        <div className="pointer-events-auto flex items-center gap-2" role="group" aria-label="Choose slide">
          {items.map((a, i) => (
            <button
              key={a.id} type="button"
              aria-label={`Show ${a.title}`}
              aria-current={i === active}
              onClick={() => swiperRef.current?.slideTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-smooth ${i === active ? "w-10 bg-accent" : "w-4 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause slideshow" : "Play slideshow"}
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
    </section>
  );
}