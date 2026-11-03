import type { Attribute, CategoryNode, ProductCard, SortKey } from "@/lib/catalog";
import { sortProducts } from "@/lib/catalog";
import { getDict, localePath, type Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import { LLink as Link } from "./LLink";
import { ShopGrid } from "./ShopGrid";

export type ShopParams = { [key: string]: string | string[] | undefined };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const list = (v: string | string[] | undefined) => first(v).split(",").filter(Boolean);

/** Shared listing for /shop and /product-category/[slug]: sidebar filters + sortable grid */
export function ShopView({
  lang,
  basePath,
  products,
  categories,
  attributes,
  params,
}: {
  lang: Lang;
  basePath: string;
  products: ProductCard[];
  categories: CategoryNode[];
  attributes: Attribute[];
  params: ShopParams;
}) {
  const t = getDict(lang);
  const selectedCats = list(params.category);
  const sort = (first(params.orderby) || "default") as SortKey;
  const q = first(params.q).trim().toLowerCase();
  const attrFilters = attributes
    .map((a) => ({ name: a.name, values: list(params[`filter_${a.name}`]) }))
    .filter((a) => a.values.length);

  let filtered = products;
  if (selectedCats.length) {
    const ids = new Set(categories.filter((c) => selectedCats.includes(c.slug)).map((c) => c.id));
    const childIds = categories.filter((c) => c.parentId && ids.has(c.parentId)).map((c) => c.id);
    childIds.forEach((id) => ids.add(id));
    const slugs = new Set(categories.filter((c) => ids.has(c.id)).map((c) => c.slug));
    filtered = filtered.filter((p) => p.categorySlugs.some((s) => slugs.has(s)));
  }
  if (q) filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
  for (const f of attrFilters) {
    filtered = filtered.filter((p) => p.attributes.some((a) => a.name === f.name && a.values.some((v) => f.values.includes(v))));
  }
  const sorted = sortProducts(filtered, sort);

  const href = (patch: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      const val = first(v);
      if (val) sp.set(k, val);
    }
    for (const [k, v] of Object.entries(patch)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const toggle = (key: string, current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    return href({ [key]: next.join(",") || null });
  };

  const topRated = products.slice(0, 4);

  const sidebar = (
    <aside className="space-y-10">
      <div>
        <h3 className="mb-5 text-xl uppercase text-ink">{t.shop.categories}</h3>
        <ul className="space-y-3 text-[15px]">
          {categories.map((c) => {
            const on = selectedCats.includes(c.slug);
            return (
              <li key={c.id}>
                <Link href={toggle("category", selectedCats, c.slug)} scroll={false} className="flex items-center gap-3 text-ink hover:opacity-70">
                  <span className={`flex size-[14px] shrink-0 items-center justify-center border ${on ? "border-ink bg-ink" : "border-[#c9c9c9]"}`}>
                    {on && <span className="size-1.5 bg-white" />}
                  </span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted">({c.count})</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {(["Color", "Size"] as const).map((name) => {
        const attr = attributes.find((a) => a.name.toLowerCase() === name.toLowerCase());
        const current = list(params[`filter_${attr?.name ?? name}`]);
        return (
          <div key={name}>
            <h3 className="mb-5 text-xl uppercase text-ink">{name === "Color" ? t.shop.color : t.shop.size}</h3>
            {attr && (
              <div className="flex flex-wrap gap-2">
                {attr.values.map((v) => (
                  <Link
                    key={v}
                    href={toggle(`filter_${attr.name}`, current, v)}
                    scroll={false}
                    className={`min-w-10 border px-3 py-1.5 text-center text-sm ${current.includes(v) ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"}`}
                  >
                    {v}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {attributes
        .filter((a) => !["color", "size"].includes(a.name.toLowerCase()))
        .map((attr) => {
          const current = list(params[`filter_${attr.name}`]);
          return (
            <div key={attr.name}>
              <h3 className="mb-5 text-xl uppercase text-ink">{attr.name}</h3>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((v) => (
                  <Link
                    key={v}
                    href={toggle(`filter_${attr.name}`, current, v)}
                    scroll={false}
                    className={`border px-3 py-1.5 text-sm ${current.includes(v) ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"}`}
                  >
                    {v}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      <div>
        <h3 className="mb-5 text-xl uppercase text-ink">{t.shop.topRated}</h3>
        <ul className="space-y-3">
          {topRated.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} className="flex border border-line hover:border-ink">
                {p.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="size-[76px] shrink-0 border-r border-line object-cover" />
                )}
                <div className="px-3 py-2.5 text-sm">
                  <p className="text-ink">{formatPrice(p.minPrice)}</p>
                  <p className="text-ink">{p.name}</p>
                  <p className="mt-1 tracking-[2px] text-[#d0d0d0]">★★★★★</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );

  return (
    <ShopGrid
      products={sorted}
      total={sorted.length}
      sort={sort}
      sortHrefs={{
        default: localePath(lang, href({ orderby: null })),
        latest: localePath(lang, href({ orderby: "latest" })),
        price: localePath(lang, href({ orderby: "price" })),
        "price-desc": localePath(lang, href({ orderby: "price-desc" })),
      }}
      sidebar={sidebar}
      query={q}
    />
  );
}
