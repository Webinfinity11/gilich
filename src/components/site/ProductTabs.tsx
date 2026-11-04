"use client";

import { useState } from "react";
import { Carousel } from "./Carousel";

/** Tabbed product carousels (Top rating / Featured / Best sellers); product cards are rendered on the server */
export function ProductTabs({ tabs }: { tabs: { label: string; items: React.ReactNode[] }[] }) {
  const [active, setActive] = useState(0);

  const tabButtons = (className: string) =>
    tabs.map((t, i) => (
      <button
        key={t.label}
        type="button"
        onClick={() => setActive(i)}
        aria-pressed={i === active}
        className={`${className} border-b uppercase transition ${i === active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
      >
        {t.label}
      </button>
    ));

  return (
    <div className="min-w-0">
      {/* Phones: tabs get a full-width row of their own instead of wrapping beside the arrows */}
      <div className="no-scrollbar -mb-2 flex justify-between gap-4 overflow-x-auto border-b border-line md:hidden">
        {tabButtons("-mb-px shrink-0 whitespace-nowrap py-3 text-[13px]")}
      </div>
      <Carousel
        key={active}
        itemClassName="basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]"
        header={<div className="hidden flex-wrap gap-x-6 gap-y-2 md:flex">{tabButtons("pb-1.5 text-sm")}</div>}
      >
        {tabs[active].items}
      </Carousel>
    </div>
  );
}
