"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProductCard as Card, SortKey } from "@/lib/catalog";
import { CloseIcon } from "./icons";
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
  // Phones get the filters in a slide-in drawer instead of a long list below the products
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [filtersOpen]);

  // Choosing a filter navigates; close the drawer once the new results arrive
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer when results change
    setFiltersOpen(false);
  }, [products]);

  const gridClass =
    view === "grid-2" ? "grid-cols-2" : view === "grid-3" ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1";

  return (
    <div className="container-site py-12 md:py-[60px]">
      <div className="grid grid-cols-2 items-stretch border border-line lg:flex">
        <button type="button" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} className="flex min-h-12 items-center justify-center gap-2 border-r border-line px-4 text-[15px] text-ink lg:hidden">
          <Lines /> {t.shop.filters}
        </button>
        <button type="button" onClick={() => setShowSidebar((v) => !v)} className="hidden items-center gap-2 border-r border-line px-5 py-3 text-[15px] text-muted lg:flex">
          {showSidebar ? t.shop.hideSidebar : t.shop.showSidebar} <Lines />
        </button>
        <label className="flex min-h-12 min-w-0 items-center px-4 text-[15px] text-muted lg:border-r lg:border-line lg:px-5">
          <span className="sr-only">Sort products</span>
          <select value={sort} onChange={(e) => router.push(sortHrefs[e.target.value as SortKey], { scroll: false })} className="w-full min-w-0 cursor-pointer truncate bg-transparent py-3 outline-none">
            {Object.entries(sortLabels).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="ml-auto hidden items-center gap-3 px-5 lg:flex">
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

      <p className="mt-4 text-right text-sm text-muted md:mt-6">
        {query && <>{t.shop.searchFor} “{query}” – </>}
        {t.shop.showingAll(total)}
      </p>

      <div className={`mt-4 grid gap-8 md:mt-6 ${showSidebar ? "lg:grid-cols-[250px_1fr] lg:gap-[30px]" : ""}`}>
        {showSidebar && <div className="hidden lg:block">{sidebar}</div>}
        <div className="min-w-0">
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
            <div className={`grid gap-3 sm:gap-5 lg:gap-6 ${gridClass}`}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filters}>
          <button type="button" aria-label={t.shop.closeFilters} className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(340px,88vw)] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line px-5 py-2">
              <p className="text-lg uppercase text-ink">{t.shop.filters}</p>
              <button type="button" aria-label={t.shop.closeFilters} className="-mr-2 flex size-11 items-center justify-center" onClick={() => setFiltersOpen(false)}>
                <CloseIcon className="size-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{sidebar}</div>
          </div>
        </div>
      )}
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
