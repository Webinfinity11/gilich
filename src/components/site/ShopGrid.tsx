"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductCard as Card, SortKey } from "@/lib/catalog";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";
import { ProductCard, PriceTag } from "./ProductCard";

type View = "list" | "grid-2" | "grid-3";

export function ShopGrid({
  products,
  total,
  sort,
  sortHrefs,
  sidebar,
  query,
}: {
  products: Card[];
  total: number;
  sort: SortKey;
  sortHrefs: Record<SortKey, string>;
  sidebar: React.ReactNode;
  query: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const sortLabels = t.shop.sort;
  const [showSidebar, setShowSidebar] = useState(true);
  const [view, setView] = useState<View>("grid-3");

  const gridClass =
    view === "grid-2" ? "grid-cols-2" : view === "grid-3" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1";

  return (
    <div className="container-site py-12 md:py-[60px]">
      <div className="flex flex-wrap items-stretch border border-line">
        <button type="button" onClick={() => setShowSidebar((v) => !v)} className="flex items-center gap-2 border-r border-line px-5 py-3 text-[15px] text-muted">
          {showSidebar ? t.shop.hideSidebar : t.shop.showSidebar} <Lines />
        </button>
        <label className="flex items-center border-r border-line px-5 py-3 text-[15px] text-muted">
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(e) => router.push(sortHrefs[e.target.value as SortKey], { scroll: false })} className="cursor-pointer bg-transparent outline-none">
            {Object.entries(sortLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto hidden items-center gap-3 px-5 md:flex">
          <ViewButton active={view === "list"} onClick={() => setView("list")} label="List view">
            <path d="M3 5h3v3H3zM9 6.5h12M3 11h3v3H3zM9 12.5h12M3 17h3v3H3zM9 18.5h12" />
          </ViewButton>
          <ViewButton active={view === "grid-2"} onClick={() => setView("grid-2")} label="2 columns">
            <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
          </ViewButton>
          <ViewButton active={view === "grid-3"} onClick={() => setView("grid-3")} label="3 columns">
            <path d="M3 3h5v5H3zM9.5 3h5v5h-5zM16 3h5v5h-5zM3 9.5h5v5H3zM9.5 9.5h5v5h-5zM16 9.5h5v5h-5zM3 16h5v5H3zM9.5 16h5v5h-5zM16 16h5v5h-5z" />
          </ViewButton>
        </div>
      </div>

      <p className="mt-6 text-right text-sm text-muted">
        {query && <>{t.shop.searchFor} “{query}” – </>}
        {t.shop.showingAll(total)}
      </p>

      <div className={`mt-6 grid gap-8 ${showSidebar ? "lg:grid-cols-[250px_1fr] lg:gap-[30px]" : ""}`}>
        {showSidebar && <div className="order-2 lg:order-1">{sidebar}</div>}
        <div className="order-1 lg:order-2">
          {products.length === 0 ? (
            <p className="border border-line p-10 text-center text-muted">{t.shop.noProducts}</p>
          ) : view === "list" ? (
            <div className="space-y-6">
              {products.map((p) => (
                <div key={p.id} className="grid gap-6 border border-line sm:grid-cols-[260px_1fr]">
                  <Link href={`/product/${p.slug}`} className="block aspect-square bg-[#f6f6f6]">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="size-full object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-col justify-center p-6">
                    {p.category && <p className="text-xs uppercase text-muted">{p.category.name}</p>}
                    <Link href={`/product/${p.slug}`} className="mt-1 text-xl text-ink hover:underline">
                      {p.name}
                    </Link>
                    <PriceTag p={p} className="mt-2 text-lg" />
                    <Link href={`/product/${p.slug}`} className="btn-dark mt-6 self-start">
                      {p.hasVariations ? t.common.selectOptions : t.common.viewProduct}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid gap-5 lg:gap-6 ${gridClass}`}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Lines() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M4 7h16M7 12h13M10 17h10" strokeLinecap="round" />
    </svg>
  );
}

function ViewButton({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={active} onClick={onClick} className={active ? "text-ink" : "text-[#999] hover:text-ink"}>
      <svg viewBox="0 0 24 24" className="size-[22px]" fill="currentColor" stroke="currentColor" strokeWidth={0.5}>
        {children}
      </svg>
    </button>
  );
}
