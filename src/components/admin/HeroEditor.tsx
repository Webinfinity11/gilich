"use client";

import { useState, useTransition } from "react";
import { saveHero } from "@/app/admin/actions";
import type { HeroSlideInput } from "@/lib/content";
import { SingleImage } from "./SingleImage";

const empty: HeroSlideInput = { image: "", eyebrow: "", eyebrowKa: "", title: "", titleKa: "", button: "", buttonKa: "", link: "/shop" };

export function HeroEditor({ initial }: { initial: HeroSlideInput[] }) {
  const [slides, setSlides] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<HeroSlideInput>) => setSlides((list) => list.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, to: number) =>
    setSlides((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(to, 0, item);
      return next;
    });

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const res = await saveHero(slides);
      setMessage({ ok: res.ok, text: res.message });
    });

  return (
    <div className="space-y-5">
      {slides.map((s, i) => (
        <section key={i} className="admin-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Slide {i + 1}</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="admin-btn-ghost disabled:opacity-30" aria-label="Move up">
                ↑
              </button>
              <button type="button" onClick={() => move(i, i + 1)} disabled={i === slides.length - 1} className="admin-btn-ghost disabled:opacity-30" aria-label="Move down">
                ↓
              </button>
              <button type="button" onClick={() => setSlides((list) => list.filter((_, j) => j !== i))} className="admin-btn-ghost text-red-600">
                Delete
              </button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <SingleImage value={s.image} onChange={(image) => update(i, { image })} />
              <p className="mt-1 text-xs text-zinc-500">Recommended: landscape, at least 1920px wide, max 4 MB</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Georgian site</p>
              <p className="hidden text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:block">English site</p>
              <label className="block text-sm font-medium">
                Eyebrow text (Georgian)
                <input value={s.eyebrowKa} onChange={(e) => update(i, { eyebrowKa: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Eyebrow text (English)
                <input value={s.eyebrow} onChange={(e) => update(i, { eyebrow: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Title (Georgian)
                <textarea rows={2} value={s.titleKa} onChange={(e) => update(i, { titleKa: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Title (English)
                <textarea rows={2} value={s.title} onChange={(e) => update(i, { title: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Button (Georgian)
                <input value={s.buttonKa} placeholder="მაღაზია" onChange={(e) => update(i, { buttonKa: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                Button (English)
                <input value={s.button} placeholder="Shop Now" onChange={(e) => update(i, { button: e.target.value })} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Button link
                <input value={s.link} placeholder="/shop" onChange={(e) => update(i, { link: e.target.value })} className="admin-input mt-1" />
                <span className="mt-1 block text-xs font-normal text-zinc-500">e.g. /shop, /product-category/rings, /product/ring-1</span>
              </label>
            </div>
          </div>
        </section>
      ))}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-zinc-50/95 py-4 backdrop-blur">
        <button type="button" onClick={() => setSlides((list) => [...list, { ...empty }])} className="admin-btn-ghost">
          + Add slide
        </button>
        <button type="button" onClick={save} disabled={pending} className="admin-btn">
          {pending ? "Saving..." : "Save"}
        </button>
        {message && <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
      </div>
    </div>
  );
}
