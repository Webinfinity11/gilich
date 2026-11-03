"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";

const images = [
  "/media/472025053_17890326432118951_1617664198186007143_n1-scaled.webp",
  "/media/IMG_0403.webp",
  "/media/641185523_17943979374118951_2759391885138736427_n1-scaled.webp",
];

export function HeroSlider() {
  const { t } = useI18n();
  const slides = images.map((image, i) => ({ image, ...t.hero[i] }));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative h-[460px] overflow-hidden bg-black md:h-[600px] lg:h-[740px]" aria-roledescription="carousel">
      {slides.map((s, i) => (
        <div
          key={s.image}
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
              <div className="max-w-[560px] animate-fade-up">
                <p className="text-lg md:text-xl">{s.eyebrow}</p>
                <h2 className="mt-3 text-[38px] leading-[1.1] md:text-[60px]">{s.title}</h2>
                <Link href="/shop" className="btn-light mt-8">
                  {t.common.shopNow}
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((s, i) => (
          <button
            key={s.image}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[3px] w-10 transition ${i === index ? "bg-white" : "bg-white/40"}`}
          />
        ))}
      </div>
    </section>
  );
}
