"use server";

import { cookies } from "next/headers";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createSessionToken, safeEqual, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { CATALOG_TAG, type Attribute } from "@/lib/catalog";
import { CONTENT_TAG, type HeroSlideInput } from "@/lib/content";
import { db } from "@/lib/db";
import { toCents } from "@/lib/money";
import { ORDER_STATUSES } from "@/lib/orders";
import { slugify } from "@/lib/slug";
import { saveImage } from "@/lib/storage";

export type ActionState = { ok: boolean; message: string } | null;

// ---------- Auth ----------

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expectedEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!expectedEmail || !expectedPassword) return { ok: false, message: "ADMIN_EMAIL / ADMIN_PASSWORD არ არის მითითებული .env-ში" };

  const valid = safeEqual(email, expectedEmail) && safeEqual(password, expectedPassword);
  if (!valid) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { ok: false, message: "მომხმარებელი ან პაროლი არასწორია" };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(email), sessionCookieOptions);
  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ---------- Uploads ----------

export async function uploadImages(formData: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  try {
    const urls = await Promise.all(files.map(saveImage));
    return { urls };
  } catch (e) {
    return { urls: [], error: e instanceof Error ? e.message : "ატვირთვა ვერ მოხერხდა" };
  }
}

// ---------- Products ----------

/** One variation as edited in the admin: empty price = product price */
export type VariationInput = {
  id?: number;
  name: string;
  color: string;
  sku: string;
  price: string;
  salePrice: string;
  stock: string;
  inStock: boolean;
  images: string[];
};

export type ProductInput = {
  id?: number;
  name: string;
  nameKa: string;
  slug: string;
  sku: string;
  shortDescription: string;
  shortDescriptionKa: string;
  description: string;
  descriptionKa: string;
  price: string;
  salePrice: string;
  stock: string;
  status: "published" | "draft";
  featured: boolean;
  categoryIds: number[];
  images: string[];
  variations: VariationInput[];
};

const intOrNull = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.floor(Number(v)) || 0));

async function uniqueSlug(base: string, model: "product" | "category", exceptId?: number) {
  const root = slugify(base) || model;
  let slug = root;
  for (let i = 2; ; i++) {
    const existing =
      model === "product"
        ? await db.product.findUnique({ where: { slug }, select: { id: true } })
        : await db.category.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === exceptId) return slug;
    slug = `${root}-${i}`;
  }
}

export async function saveProduct(input: ProductInput): Promise<{ ok: boolean; message: string; id?: number }> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) return { ok: false, message: "შეიყვანეთ პროდუქტის სახელი" };

  const price = toCents(input.price);
  if (price === null) return { ok: false, message: "შეიყვანეთ პროდუქტის ფასი" };
  const productSale = toCents(input.salePrice);
  const urls = (list: unknown) => (Array.isArray(list) ? list.filter((u): u is string => typeof u === "string" && u.length > 0) : []);

  const cleaned = input.variations.map((v, i) => ({
    ...v,
    name: v.name.trim() || `#${i + 1}`,
    color: /^#[0-9a-f]{6}$/i.test(v.color) ? v.color : null,
    images: urls(v.images),
  }));
  // Variations are stored as one attribute ("Color" when they have swatches) so shop filters and card dots keep working
  const attrName = cleaned.some((v) => v.color) ? "Color" : "Variant";
  const attributes: Attribute[] = cleaned.length
    ? [
        {
          name: attrName,
          values: [...new Set(cleaned.map((v) => v.name))],
          ...(attrName === "Color" ? { type: "color" as const, colors: Object.fromEntries(cleaned.filter((v) => v.color).map((v) => [v.name, v.color!])) } : {}),
        },
      ]
    : [];

  const variations = cleaned.map((v, i) => {
    const own = toCents(v.price);
    return {
      id: v.id,
      name: v.name,
      color: v.color,
      images: JSON.stringify(v.images),
      image: v.images[0] ?? null,
      options: JSON.stringify({ [attrName]: v.name }),
      sku: v.sku.trim() || null,
      price: own ?? price,
      // No own price: the product price and its sale apply
      salePrice: toCents(v.salePrice) ?? (own === null ? productSale : null),
      stock: v.inStock ? intOrNull(v.stock) : 0,
      sortOrder: i,
    };
  });

  const slug = await uniqueSlug(input.slug.trim() || name, "product", input.id);
  const data = {
    name,
    slug,
    sku: input.sku.trim() || null,
    nameKa: input.nameKa.trim() || null,
    shortDescription: input.shortDescription.trim() || null,
    shortDescriptionKa: input.shortDescriptionKa.trim() || null,
    description: input.description.trim() || null,
    descriptionKa: input.descriptionKa.trim() || null,
    price,
    salePrice: productSale,
    stock: intOrNull(input.stock),
    status: input.status === "draft" ? "draft" : "published",
    featured: input.featured,
    attributes: JSON.stringify(attributes),
  };

  const id = await db.$transaction(async (tx) => {
    const product = input.id
      ? await tx.product.update({ where: { id: input.id }, data: { ...data, categories: { set: input.categoryIds.map((cid) => ({ id: cid })) } } })
      : await tx.product.create({ data: { ...data, categories: { connect: input.categoryIds.map((cid) => ({ id: cid })) } } });

    await tx.productImage.deleteMany({ where: { productId: product.id } });
    if (input.images.length) {
      await tx.productImage.createMany({ data: input.images.map((url, i) => ({ url, sortOrder: i, productId: product.id })) });
    }

    const keepIds = variations.flatMap((v) => (v.id ? [v.id] : []));
    await tx.productVariation.deleteMany({ where: { productId: product.id, id: { notIn: keepIds } } });
    for (const v of variations) {
      const { id: vid, ...rest } = v;
      const vdata = rest;
      if (vid) await tx.productVariation.update({ where: { id: vid }, data: vdata });
      else await tx.productVariation.create({ data: { ...vdata, productId: product.id } });
    }
    return product.id;
  });

  updateTag(CATALOG_TAG);
  return { ok: true, message: "შენახულია", id };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await db.product.delete({ where: { id } });
  updateTag(CATALOG_TAG);
  refresh();
}

export async function duplicateProduct(id: number) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { images: true, variations: true, categories: true } });
  if (!p) return;
  const slug = await uniqueSlug(`${p.slug}-copy`, "product");
  const copy = await db.product.create({
    data: {
      name: `${p.name} (copy)`,
      nameKa: p.nameKa ? `${p.nameKa} (ასლი)` : null,
      shortDescriptionKa: p.shortDescriptionKa,
      descriptionKa: p.descriptionKa,
      slug,
      sku: null,
      shortDescription: p.shortDescription,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      status: "draft",
      featured: false,
      attributes: p.attributes,
      categories: { connect: p.categories.map((c) => ({ id: c.id })) },
      images: { create: p.images.map(({ url, sortOrder }) => ({ url, sortOrder })) },
      variations: { create: p.variations.map(({ options, price, salePrice, stock, image, sortOrder }) => ({ options, price, salePrice, stock, image, sortOrder })) },
    },
  });
  updateTag(CATALOG_TAG);
  redirect(`/admin/products/${copy.id}`);
}

// ---------- Categories ----------

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || undefined;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "შეიყვანეთ კატეგორიის სახელი" };
  const parentId = Number(formData.get("parentId")) || null;
  if (id && parentId === id) return { ok: false, message: "კატეგორია თავისივე მშობელი ვერ იქნება" };

  const slug = await uniqueSlug(String(formData.get("slug") ?? "").trim() || name, "category", id);
  let image = String(formData.get("currentImage") ?? "") || null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveImage(file);
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "ფოტო ვერ აიტვირთა" };
    }
  }
  if (formData.get("removeImage") === "on") image = null;

  const data = {
    name,
    nameKa: String(formData.get("nameKa") ?? "").trim() || null,
    slug,
    parentId,
    image,
    description: String(formData.get("description") ?? "").trim() || null,
    descriptionKa: String(formData.get("descriptionKa") ?? "").trim() || null,
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });

  updateTag(CATALOG_TAG);
  redirect("/admin/categories");
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  updateTag(CATALOG_TAG);
  refresh();
}

// ---------- Orders ----------

export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin();
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await db.order.update({ where: { id }, data: { status } });
  updateTag(CATALOG_TAG); // best sellers depend on order status
  refresh();
}

export async function deleteOrder(id: number) {
  await requireAdmin();
  await db.order.delete({ where: { id } });
  updateTag(CATALOG_TAG);
  redirect("/admin/orders");
}

// ---------- Messages ----------

export async function markMessageRead(id: number, read: boolean) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { read } });
  refresh();
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await db.contactMessage.delete({ where: { id } });
  refresh();
}

export async function deleteSubscriber(id: number) {
  await requireAdmin();
  await db.subscriber.delete({ where: { id } });
  refresh();
}

// ---------- Home page content ----------

export async function saveHero(slides: HeroSlideInput[]): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const clean = slides
    .map((s) => ({
      image: text(s.image),
      eyebrow: text(s.eyebrow),
      eyebrowKa: text(s.eyebrowKa),
      title: text(s.title),
      titleKa: text(s.titleKa),
      button: text(s.button),
      buttonKa: text(s.buttonKa),
      link: text(s.link) || "/shop",
    }))
    .filter((s) => s.image);
  if (!clean.length) return { ok: false, message: "დაამატეთ მინიმუმ ერთი სლაიდი ფოტოთი" };
  const value = JSON.stringify(clean);
  await db.setting.upsert({ where: { key: "hero" }, create: { key: "hero", value }, update: { value } });
  updateTag(CONTENT_TAG);
  return { ok: true, message: "შენახულია, ცვლილება საიტზე უკვე ჩანს" };
}
