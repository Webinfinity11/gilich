"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/content";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const count = slides.length;
  // Phones have no arrows, so a horizontal swipe changes the slide
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    touch.current = { x: t0.clientX, y: t0.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;
    const t1 = e.changedTouches[0];
    const dx = t1.clientX - start.x;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(t1.clientY - start.y)) return;
    setIndex((i) => (i + (dx < 0 ? 1 : -1) + count) % count);
  };

  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearTimeout(timer);
  }, [index, count]);

  if (!count) return null;

  return (
    <section
      className="relative h-[min(460px,75svh)] min-h-[380px] touch-pan-y overflow-hidden bg-black md:h-[600px] lg:h-[740px]"
      aria-roledescription="carousel"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <div
          key={`${s.image}-${i}`}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt=""
            className={`absolute inset-0 size-full object-cover transition-transform duration-[7000ms] ${i === index ? "scale-105" : "scale-100"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
          <div className="container-site relative flex h-full flex-col justify-center text-white">
            {i === index && (
              <div className="stagger max-w-[560px] md:pl-16 lg:pl-20">
                {s.eyebrow && <p className="text-base sm:text-lg md:text-xl">{s.eyebrow}</p>}
                {s.title && <h2 className="mt-3 text-[32px] leading-[1.1] [overflow-wrap:anywhere] sm:text-[38px] md:text-[60px]">{s.title}</h2>}
                <Link href={s.link} className="btn-light mt-6 md:mt-8">
                  {s.button || t.common.shopNow}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
      {count > 1 &&
        ([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            aria-label={dir < 0 ? "Previous slide" : "Next slide"}
            onClick={() => setIndex((i) => (i + dir + count) % count)}
            className={`absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 text-white/70 transition-colors duration-300 hover:border-white/70 hover:bg-white/10 hover:text-white md:flex ${dir < 0 ? "left-6 lg:left-10" : "right-6 lg:right-10"}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        ))}
      {count > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 md:bottom-6">
          {slides.map((s, i) => (
            <button
              key={`${s.image}-${i}`}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              aria-current={i === index}
              className="px-1.5 py-4"
            >
              <span className="relative block h-[3px] w-10 overflow-hidden bg-white/40">
                {i === index && <span key={index} className="animate-progress absolute inset-0 bg-white" style={{ animationDuration: "6000ms" }} />}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
