"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteLanding, saveLanding } from "@/app/admin/actions";
import { SingleImage } from "@/components/admin/SingleImage";
import type { Landing } from "@/lib/landing";

type TextKey = Exclude<keyof Landing, "id" | "published" | "productIds">;
export function LandingEditor({ initial, products }: { initial: Landing; products: { id: number; name: string; nameKa: string | null }[] }) {
  const [page, setPage] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = (key: TextKey, value: string) => setPage((old) => ({ ...old, [key]: value }));
  const field = (key: TextKey, label: string, multiline = false) => <label className="block space-y-1 text-sm font-medium"><span>{label}</span>{multiline ? <textarea className="admin-input min-h-28" value={page[key]} onChange={(e) => set(key, e.target.value)} /> : <input className="admin-input" value={page[key]} onChange={(e) => set(key, e.target.value)} />}</label>;
  const image = (key: "logo" | "heroImage" | "aboutImage", label: string) => <div className="space-y-2 text-sm font-medium"><span>{label}</span><SingleImage value={page[key]} onChange={(url) => set(key, url)} aspect={key === "logo" ? "aspect-[4/1]" : "aspect-[16/9]"} />{page[key] && <button type="button" className="text-red-700 underline" onClick={() => set(key, "")}>Remove image</button>}</div>;
  function save() { start(async () => { try { const result = await saveLanding(page); setMessage(result.message); if (result.ok && result.id && !page.id) { setPage((old) => ({ ...old, id: result.id! })); router.replace(`/admin/landings/${result.id}`); } else if (result.ok) router.refresh(); } catch { setMessage("Could not save. Please try again."); } }); }
  return <div className="space-y-6 pb-20"><div><Link href="/admin/landings" className="text-sm text-zinc-500 underline">← Landing pages</Link><h1 className="mt-2 text-2xl font-semibold">{page.id ? "Edit landing" : "Create landing"}</h1></div>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Page settings</h2>{field("title", "Campaign name")}{field("slug", "URL slug (e.g. black-friday)")}<p className="text-sm text-zinc-500 md:col-span-2">Address: /landing/{page.slug || "your-campaign"}</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={page.published} onChange={(e) => setPage({ ...page, published: e.target.checked })} /> Publish this page</label>{page.id && page.published && <a target="_blank" rel="noreferrer" href={`/landing/${page.slug}`} className="text-sm underline">Open published page ↗</a>}</section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Header</h2>{field("announcement", "Announcement text")}{field("headerButton", "Header button text")}{image("logo", "Logo (optional; site logo is used by default)")}</section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Hero</h2>{field("heroEyebrow", "Small heading")}{field("heroTitle", "Main heading")}{field("heroText", "Description", true)}{field("heroButton", "Button text")}{image("heroImage", "Hero image")}</section>
    <section className="admin-card space-y-4 p-6"><h2 className="text-lg font-semibold">Products</h2>{field("productsTitle", "Section heading")}<p className="text-sm text-zinc-500">Choose published products to display. Product details and prices come from the catalog.</p><div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-zinc-200 p-4 sm:grid-cols-2">{products.map((p) => <label key={p.id} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={page.productIds.includes(p.id)} onChange={(e) => setPage((old) => ({ ...old, productIds: e.target.checked ? [...old.productIds, p.id] : old.productIds.filter((id) => id !== p.id) }))} />{p.nameKa || p.name}</label>)}</div></section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">About</h2>{field("aboutTitle", "Heading")}{field("aboutText", "Text", true)}{image("aboutImage", "About image")}</section>
    <section className="admin-card grid gap-4 p-6 md:grid-cols-2"><h2 className="text-lg font-semibold md:col-span-2">Footer</h2>{field("footerText", "Footer text", true)}{field("footerPhone", "Phone")}{field("footerEmail", "Email")}</section>
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-zinc-100/95 py-4"><button className="admin-btn" disabled={pending} onClick={save}>{pending ? "Saving..." : "Save landing"}</button>{page.id && <button className="admin-btn-ghost text-red-700" disabled={pending} onClick={() => { if (confirm("Delete this landing page?")) start(() => deleteLanding(page.id)); }}>Delete</button>}<span role="status" className="text-sm">{message}</span></div>
  </div>;
}
