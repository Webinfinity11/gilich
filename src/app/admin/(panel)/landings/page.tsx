import Link from "next/link";
import { listLandings } from "@/lib/landing";

export default async function LandingsPage() {
  const pages = await listLandings();
  return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-semibold">Landing pages</h1><p className="mt-1 text-sm text-zinc-500">Create and manage standalone campaign pages.</p></div><Link className="admin-btn" href="/admin/landings/new">+ Create landing</Link></div>
    <div className="admin-card divide-y divide-zinc-100">{pages.length ? pages.map((page) => <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div><Link className="font-medium underline" href={`/admin/landings/${page.id}`}>{page.title}</Link><p className="mt-1 text-sm text-zinc-500">/landing/{page.slug} · {page.published ? "Published" : "Draft"}</p></div>{page.published && <a className="admin-btn-ghost" href={`/landing/${page.slug}`} target="_blank" rel="noreferrer">Open page ↗</a>}</div>) : <p className="p-6 text-sm text-zinc-500">No landing pages yet. Create your first campaign.</p>}</div>
  </div>;
}
