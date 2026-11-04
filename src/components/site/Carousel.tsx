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

  // min-w-0: as a grid/flex item the carousel would otherwise grow to the full width of its
  // scroll track (every card side by side) and push the whole page sideways on phones.
  return (
    <div className="min-w-0">
      <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
        <div className="min-w-0">{header}</div>
        <div className="-mr-2 flex shrink-0 items-center md:gap-2">
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className="flex size-10 items-center justify-center text-muted transition hover:-translate-x-1 hover:text-ink">
            <ArrowLeft className="size-6" />
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)} className="flex size-10 items-center justify-center text-ink transition hover:translate-x-1 hover:opacity-70">
            <ArrowRight className="size-6" />
          </button>
        </div>
      </div>
      {/* The track reveals as one block: per-card reveals never fire for cards that start
          off-screen to the right, so swiping showed blank slots until each card faded in. */}
      <div ref={ref} data-reveal="up" className={`no-scrollbar -my-4 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-4 ${gapClass}`}>
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
