"use client";

import { useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/content";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearTimeout(timer);
  }, [index, count]);

  if (!count) return null;

  return (
    <section className="relative h-[460px] overflow-hidden bg-black md:h-[600px] lg:h-[740px]" aria-roledescription="carousel">
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
              <div className="stagger max-w-[560px]">
                {s.eyebrow && <p className="text-lg md:text-xl">{s.eyebrow}</p>}
                {s.title && <h2 className="mt-3 text-[38px] leading-[1.1] md:text-[60px]">{s.title}</h2>}
                <Link href={s.link} className="btn-light mt-8">
                  {s.button || t.common.shopNow}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
      {count > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
          {slides.map((s, i) => (
            <button
              key={`${s.image}-${i}`}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-[3px] w-10 overflow-hidden bg-white/40"
            >
              {i === index && <span key={index} className="animate-progress absolute inset-0 bg-white" style={{ animationDuration: "6000ms" }} />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
