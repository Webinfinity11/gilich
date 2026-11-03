"use client";

import { useState } from "react";
import { Carousel } from "./Carousel";

/** Tabbed product carousels (Top rating / Featured / Best sellers); product cards are rendered on the server */
export function ProductTabs({ tabs }: { tabs: { label: string; items: React.ReactNode[] }[] }) {
  const [active, setActive] = useState(0);
  return (
    <Carousel
      key={active}
      itemClassName="basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]"
      header={
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setActive(i)}
              className={`border-b pb-1.5 text-sm uppercase transition ${i === active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      {tabs[active].items}
    </Carousel>
  );
}
