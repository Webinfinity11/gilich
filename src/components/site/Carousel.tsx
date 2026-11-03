"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "./icons";

/** Horizontal scroll-snap carousel with arrow controls. `header` renders left of the arrows. */
export function Carousel({
  children,
  header,
  itemClassName = "basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-72px)/4)]",
  gapClass = "gap-6",
}: {
  children: React.ReactNode[];
  header?: React.ReactNode;
  itemClassName?: string;
  gapClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth / 2), behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>{header}</div>
        <div className="flex shrink-0 items-center gap-4">
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className="text-muted transition hover:-translate-x-1 hover:text-ink">
            <ArrowLeft className="size-6" />
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)} className="text-ink transition hover:translate-x-1 hover:opacity-70">
            <ArrowRight className="size-6" />
          </button>
        </div>
      </div>
      <div ref={ref} className={`no-scrollbar -my-4 flex snap-x snap-mandatory overflow-x-auto py-4 ${gapClass}`}>
        {children.map((child, i) => (
          <div key={i} data-reveal="up" style={{ "--d": `${Math.min(i, 5) * 110}ms` } as React.CSSProperties} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
