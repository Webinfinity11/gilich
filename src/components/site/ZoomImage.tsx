"use client";

import { useEffect, useRef, useState } from "react";

const MIN_ZOOM = 2;
const MAX_ZOOM = 6;

/**
 * Product photo with a hover lens: a square follows the cursor and the area under it
 * is shown magnified in a panel to the right. Mouse wheel zooms further in or out.
 * Desktop only (fine pointer); touch devices see the plain photo.
 */
export function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(2.5);
  const [pos, setPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Wheel zoom needs a non-passive listener to stop the page from scrolling
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (e.deltaY < 0 ? 1.2 : 1 / 1.2))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const move = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };

  // Lens rectangle, kept inside the photo
  const lens = pos && {
    w: pos.w / zoom,
    h: pos.h / zoom,
    left: Math.min(Math.max(pos.x - pos.w / zoom / 2, 0), pos.w - pos.w / zoom),
    top: Math.min(Math.max(pos.y - pos.h / zoom / 2, 0), pos.h - pos.h / zoom),
  };

  return (
    <div
      ref={box}
      onPointerMove={move}
      onPointerEnter={move}
      onPointerLeave={() => setPos(null)}
      className="relative aspect-square border border-line bg-[#f6f6f6] lg:cursor-crosshair"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="size-full object-cover" />
      </div>

      {pos && lens && (
        <>
          <div
            className="pointer-events-none absolute hidden border border-ink/60 bg-white/25 lg:block"
            style={{ width: lens.w, height: lens.h, left: lens.left, top: lens.top }}
          />
          <div
            className="pointer-events-none absolute left-[calc(100%+30px)] top-0 z-30 hidden overflow-hidden border border-line bg-[#f6f6f6] shadow-xl lg:block"
            style={{ width: pos.w, height: pos.h }}
          >
            <div className="absolute" style={{ width: pos.w * zoom, height: pos.h * zoom, left: -lens.left * zoom, top: -lens.top * zoom }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </div>
            <span className="absolute bottom-2 right-2 rounded bg-black/55 px-2 py-0.5 text-xs text-white">{zoom.toFixed(1)}×</span>
          </div>
        </>
      )}
    </div>
  );
}
