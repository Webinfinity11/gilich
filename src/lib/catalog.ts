import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { pick, type Lang } from "@/lib/i18n";

export const CATALOG_TAG = "catalog";

/** type "color" shows round swatches; colors maps value -> hex */
export type Attribute = { name: string; values: string[]; type?: "color"; colors?: Record<string, string> };

export type Variation = {
  id: number;
  options: Record<string, string>;
  sku: string | null;
  price: number;
  salePrice: number | null;
  stock: number | null;
  image: string | null;
};

export type ProductCard = {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  minPrice: number;
  maxPrice: number;
  images: string[];
  category: { name: string; slug: string } | null;
  categorySlugs: string[];
  createdAt: Date;
  featured: boolean;
  hasVariations: boolean;
  attributes: Attribute[];
};

export type ProductDetail = ProductCard & {
  sku: string | null;
  stock: number | null;
  shortDescription: string | null;
  description: string | null;
  attributes: Attribute[];
  variations: Variation[];
  categories: { id: number; name: string; slug: string; parent: { name: string; slug: string } | null }[];
};

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  parentId: number | null;
  count: number;
  sortOrder: number;
};

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function effectivePrice(p: { price: number; salePrice: number | null }) {
  return p.salePrice !== null && p.salePrice < p.price ? p.salePrice : p.price;
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: { include: { parent: true }, orderBy: { sortOrder: "asc" as const } },
  variations: { orderBy: { sortOrder: "asc" as const } },
};

type ProductRow = Awaited<ReturnType<typeof loadProducts>>[number];

async function loadProducts() {
  return db.product.findMany({
    where: { status: "published" },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

function primaryCategory(row: ProductRow, lang: Lang) {
  // First top-level category alphabetically, as WooCommerce shows it on product cards
  const top = row.categories.filter((c) => !c.parentId).sort((a, b) => a.name.localeCompare(b.name));
  const c = top[0] ?? row.categories[0];
  return c ? { name: pick(lang, c.name, c.nameKa), slug: c.slug } : null;
}

function toCard(row: ProductRow, lang: Lang): ProductCard {
  const prices = row.variations.length ? row.variations.map(effectivePrice) : [effectivePrice(row)];
  return {
    id: row.id,
    name: pick(lang, row.name, row.nameKa),
    slug: row.slug,
    price: row.price,
    salePrice: row.salePrice,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    images: row.images.map((i) => i.url),
    category: primaryCategory(row, lang),
    categorySlugs: row.categories.map((c) => c.slug),
    createdAt: row.createdAt,
    featured: row.featured,
    hasVariations: row.variations.length > 0,
    attributes: parseJson<Attribute[]>(row.attributes, []),
  };
}

function toDetail(row: ProductRow, lang: Lang): ProductDetail {
  return {
    ...toCard(row, lang),
    sku: row.sku,
    stock: row.stock,
    shortDescription: pick(lang, row.shortDescription ?? "", row.shortDescriptionKa) || null,
    description: pick(lang, row.description ?? "", row.descriptionKa) || null,
    variations: row.variations.map((v) => ({
      id: v.id,
      options: parseJson<Record<string, string>>(v.options, {}),
      sku: v.sku,
      price: v.price,
      salePrice: v.salePrice,
      stock: v.stock,
      image: v.image,
    })),
    categories: row.categories.map((c) => ({
      id: c.id,
      name: pick(lang, c.name, c.nameKa),
      slug: c.slug,
      parent: c.parent ? { name: pick(lang, c.parent.name, c.parent.nameKa), slug: c.parent.slug } : null,
    })),
  };
}

export async function getProducts(lang: Lang): Promise<ProductCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  return (await loadProducts()).map((r) => toCard(r, lang));
}

export async function getProduct(slug: string, lang: Lang): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const row = await db.product.findFirst({ where: { slug, status: "published" }, include: productInclude });
  return row ? toDetail(row, lang) : null;
}

export async function getProductsByIds(ids: number[], lang: Lang): Promise<ProductDetail[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: { id: { in: ids }, status: "published" }, include: productInclude });
  return rows.map((r) => toDetail(r, lang));
}

export async function getCategories(lang: Lang): Promise<CategoryNode[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const rows = await db.category.findMany({
    orderBy: [{ name: "asc" }],
    include: { _count: { select: { products: { where: { status: "published" } } } } },
  });
  const list = rows.map((c) => ({
    id: c.id,
    name: pick(lang, c.name, c.nameKa),
    slug: c.slug,
    image: c.image,
    description: pick(lang, c.description ?? "", c.descriptionKa) || null,
    parentId: c.parentId,
    count: c._count.products,
    sortOrder: c.sortOrder,
  }));
  return list.sort((a, b) => a.name.localeCompare(b.name, lang === "ka-ge" ? "ka" : "en"));
}

export async function getProductsInCategory(slug: string, lang: Lang): Promise<ProductCard[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: {
      status: "published",
      categories: { some: { OR: [{ slug }, { parent: { slug } }] } },
    },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => toCard(r, lang));
}

/** Products ordered by units sold (unsold products follow in default order) */
export async function getBestSellers(lang: Lang): Promise<ProductCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const [products, sales] = await Promise.all([
    getProducts(lang),
    db.orderItem.groupBy({ by: ["productId"], _sum: { quantity: true }, where: { order: { status: { not: "cancelled" } } } }),
  ]);
  const sold = new Map(sales.map((s) => [s.productId, s._sum.quantity ?? 0]));
  return [...products].sort((a, b) => (sold.get(b.id) ?? 0) - (sold.get(a.id) ?? 0));
}

/** Collect attribute names/values across all published products, for shop filters */
export async function getAttributeFilters(): Promise<Attribute[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({ where: { status: "published" }, select: { attributes: true } });
  const map = new Map<string, { values: Set<string>; colors: Record<string, string> }>();
  for (const r of rows) {
    for (const a of parseJson<Attribute[]>(r.attributes, [])) {
      const entry = map.get(a.name) ?? { values: new Set<string>(), colors: {} };
      a.values.forEach((v) => entry.values.add(v));
      if (a.type === "color") Object.assign(entry.colors, a.colors);
      map.set(a.name, entry);
    }
  }
  return [...map].map(([name, { values, colors }]) =>
    Object.keys(colors).length ? { name, values: [...values], type: "color" as const, colors } : { name, values: [...values] },
  );
}

export type SortKey = "default" | "latest" | "price" | "price-desc";

export function sortProducts(list: ProductCard[], sort: SortKey) {
  const copy = [...list];
  if (sort === "price") copy.sort((a, b) => a.minPrice - b.minPrice);
  else if (sort === "price-desc") copy.sort((a, b) => b.maxPrice - a.maxPrice);
  else if (sort === "latest") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  else copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}
