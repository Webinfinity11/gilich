"use client";

import Link from "next/link";
import { landingPath } from "@/lib/landing-path";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteLanding, saveLanding } from "@/app/admin/actions";
import { SingleImage } from "@/components/admin/SingleImage";
import { LandingDesignEditor } from "@/components/admin/LandingDesignEditor";
import type { Landing, LandingSlide } from "@/lib/landing";
import { LANDING_PRODUCT_LIMIT, LANDING_SLIDE_LIMIT } from "@/lib/landing-limits";

type TextKey = Exclude<keyof Landing, "id" | "published" | "productIds" | "heroSlides" | "discountPercent" | "design">;
const slideFields = { eyebrow: "Small heading", title: "Main heading", text: "Description", button: "Button text" } as const;

export function LandingEditor({ initial, products }: { initial: Landing; products: { id: number; name: string; nameKa: string | null }[] }) {
  const [page, setPage] = useState(() => {
    const availableIds = new Set(products.map((product) => product.id));
    return { ...initial, productIds: initial.productIds.filter((id) => availableIds.has(id)).slice(0, LANDING_PRODUCT_LIMIT) };
  });
  const [savedPage, setSavedPage] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (key: TextKey, value: string) => setPage((old) => ({ ...old, [key]: value }));
  const field = (key: TextKey, label: string, multiline = false) => <label className="block space-y-1 text-sm font-medium"><span>{label}</span>{multiline ? <textarea className="admin-input min-h-28" value={page[key]} onChange={(e) => set(key, e.target.value)} /> : <input className="admin-input" value={page[key]} onChange={(e) => set(key, e.target.value)} />}</label>;
  const image = (key: "logo" | "aboutImage", label: string) => <div className="space-y-2 text-sm font-medium"><span>{label}</span><SingleImage value={page[key]} onChange={(url) => set(key, url)} aspect={key === "logo" ? "aspect-[4/1]" : "aspect-[16/9]"} />{page[key] && <button type="button" className="text-red-700 underline" onClick={() => set(key, "")}>Remove image</button>}</div>;

  function updateSlide(id: string, patch: Partial<LandingSlide>) {
    setPage((current) => ({
      ...current,
      heroSlides: current.heroSlides.map((slide) => slide.id === id ? { ...slide, ...patch } : slide),
    }));
  }

  function moveSlide(index: number, offset: number) {
    setPage((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.heroSlides.length) return current;
      const heroSlides = [...current.heroSlides];
      [heroSlides[index], heroSlides[target]] = [heroSlides[target], heroSlides[index]];
      return { ...current, heroSlides };
    });
  }

  function addSlide() {
    const slide = { id: crypto.randomUUID(), image: "", eyebrow: "", title: "", text: "", button: "" };
    setPage((current) => current.heroSlides.length >= LANDING_SLIDE_LIMIT
      ? current
      : { ...current, heroSlides: [...current.heroSlides, slide] });
  }

  function toggleProduct(id: number, checked: boolean) {
    setPage((current) => ({
      ...current,
      productIds: checked
        ? [...new Set([...current.productIds, id])].slice(0, LANDING_PRODUCT_LIMIT)
        : current.productIds.filter((selected) => selected !== id),
    }));
  }
  function save() {
    start(async () => {
      try {
        const result = await saveLanding(page);
        setMessage(result.message);
        const { id, slug } = result;
        if (!result.ok || !id || !slug) return;

        setSavedPage({ ...page, id, slug });
        setPage((current) => ({ ...current, id, slug: current.slug === page.slug ? slug : current.slug }));
        if (page.id) router.refresh();
        else router.replace(`/admin/landings/${id}`);
      } catch {
        setMessage("Could not save. Please try again.");
      }
    });
  }
  return <div className="space-y-6 pb-20"><div className="flex flex-wrap items-end justify-between gap-4"><div><Link href="/admin/landings" className="text-sm text-zinc-500 underline">← Landing pages</Link><h1 className="mt-2 text-2xl font-semibold">{page.id ? "Edit landing" : "Create landing"}</h1></div>{savedPage.id && savedPage.published && <a target="_blank" rel="noreferrer" href={landingPath(savedPage.slug)} className="admin-btn-ghost">Open landing ↗</a>}</div>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Page settings</h2>{field("title", "Campaign name")}{field("slug", "URL slug (e.g. black-friday)")}<p className="text-sm text-zinc-500 md:col-span-2">Address: {landingPath(page.slug || "your-campaign")}</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.published} onChange={(e) => setPage({ ...page, published: e.target.checked })} /> Publish this page</label><p className="text-sm text-zinc-500">{savedPage.id && savedPage.published ? "The open link shows the last saved version." : "Save and publish to open the landing page."}</p></section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Header</h2>{field("announcement", "Announcement text")}{field("headerButton", "Header button text")}{image("logo", "Logo (optional; site logo is used by default)")}</section>
    <section className="admin-card space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Hero slider</h2>
        <button type="button" className="admin-btn-ghost" disabled={page.heroSlides.length >= LANDING_SLIDE_LIMIT} onClick={addSlide}>Add slide</button>
      </div>
      {page.heroSlides.map((slide, index) => (
        <div key={slide.id} className="space-y-4 rounded-lg border border-zinc-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Slide {index + 1}</h3>
            <div className="flex gap-1">
              <button type="button" className="admin-btn-ghost disabled:opacity-30" disabled={index === 0} onClick={() => moveSlide(index, -1)}>Move up</button>
              <button type="button" className="admin-btn-ghost disabled:opacity-30" disabled={index === page.heroSlides.length - 1} onClick={() => moveSlide(index, 1)}>Move down</button>
              <button type="button" className="admin-btn-ghost text-red-700" onClick={() => setPage((current) => ({ ...current, heroSlides: current.heroSlides.filter((item) => item.id !== slide.id) }))}>Remove</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <SingleImage value={slide.image} onChange={(image) => updateSlide(slide.id, { image })} />
              {slide.image && <button type="button" className="text-sm text-red-700 underline" onClick={() => updateSlide(slide.id, { image: "" })}>Use default image</button>}
            </div>
            <div className="space-y-3">
              {(Object.keys(slideFields) as (keyof typeof slideFields)[]).map((key) => (
                <label key={key} className="block space-y-1 text-sm font-medium">
                  <span>{slideFields[key]}</span>
                  {key === "text"
                    ? <textarea className="admin-input" value={slide[key]} onChange={(e) => updateSlide(slide.id, { [key]: e.target.value })} />
                    : <input className="admin-input" value={slide[key]} onChange={(e) => updateSlide(slide.id, { [key]: e.target.value })} />}
                </label>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
    <section className="admin-card space-y-4 p-6">
      <h2 className="text-lg font-semibold">Products</h2>
      {field("productsTitle", "Section heading")}
      <label className="block max-w-64 space-y-1 text-sm font-medium">
        <span>Campaign discount (%)</span>
        <input className="admin-input" type="number" min={0} max={100} step={1} value={page.discountPercent || ""} placeholder="0"
          onChange={(event) => setPage((current) => ({ ...current, discountPercent: Number(event.target.value) }))} />
      </label>
      <p className="text-sm text-zinc-500">Applies to the current prices of the selected products in this campaign.</p>
      <p className="text-sm text-zinc-500">Choose up to {LANDING_PRODUCT_LIMIT} products for one row ({page.productIds.length} selected).</p>
      <div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-zinc-200 p-4 sm:grid-cols-2">
        {products.map((product) => {
          const checked = page.productIds.includes(product.id);
          return (
            <label key={product.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={checked} disabled={!checked && page.productIds.length >= LANDING_PRODUCT_LIMIT} onChange={(e) => toggleProduct(product.id, e.target.checked)} />
              {product.nameKa || product.name}
            </label>
          );
        })}
      </div>
    </section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
      <h2 className="text-lg font-semibold md:col-span-2">About</h2>
      {field("aboutTitle", "Heading")}{field("aboutText", "Text", true)}{image("aboutImage", "About image")}
    </section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Footer</h2>{field("footerText", "Footer text", true)}{field("footerPhone", "Phone")}{field("footerEmail", "Email")}</section>
    <LandingDesignEditor design={page.design} onChange={(update) => setPage((current) => ({ ...current, design: update(current.design) }))} />
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-zinc-100/95 py-4"><button className="admin-btn" disabled={pending} onClick={save}>{pending ? "Saving..." : "Save landing"}</button>{page.id && <button className="admin-btn-ghost text-red-700" disabled={pending} onClick={() => { if (confirm("Delete this landing page?")) start(() => deleteLanding(page.id)); }}>Delete</button>}<span role="status" className="text-sm">{message}</span></div>
  </div>;
}
