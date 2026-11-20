import { db } from "@/lib/db";
import { cache } from "react";
import { connection } from "next/server";
import { LANDING_PRODUCT_LIMIT, LANDING_SLIDE_LIMIT } from "@/lib/landing-limits";
import { getProductsByIds } from "@/lib/catalog";

export type LandingSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  button: string;
};

export type Landing = {
  id: string; slug: string; published: boolean; title: string; announcement: string;
  logo: string; headerButton: string; heroSlides: LandingSlide[]; productsTitle: string;
  productIds: number[]; aboutTitle: string; aboutText: string; aboutImage: string;
  discountPercent: number;
  footerText: string; footerPhone: string; footerEmail: string;
};

export const landingDefaults: Omit<Landing, "id"> = {
  slug: "", published: false, title: "Black Friday", announcement: "აღმოაჩინეთ განსაკუთრებული შეთავაზებები",
  logo: "", headerButton: "Black Friday",
  discountPercent: 0,
  heroSlides: [{
    id: "first-slide", image: "", eyebrow: "GILICH JEWELRY HOUSE",
    title: "შეარჩიეთ თქვენი განსაკუთრებული სამკაული",
    text: "სილამაზე, რომელიც თქვენს ისტორიას ქმნის.", button: "იხილეთ კოლექცია",
  }],
  productsTitle: "რჩეული სამკაულები", productIds: [],
  aboutTitle: "ჩვენ შესახებ", aboutText: "Gilich Jewelry House — სამკაულები განსაკუთრებული მომენტებისთვის.",
  aboutImage: "", footerText: "Gilich Jewelry House", footerPhone: "", footerEmail: "",
};

export function normalizeLandingSlides(input: unknown): LandingSlide[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, LANDING_SLIDE_LIMIT).flatMap((slide, index) => {
    if (!slide || typeof slide !== "object") return [];
    const text = (key: string) => typeof slide[key] === "string" ? slide[key].trim().slice(0, 10000) : "";
    return [{
      id: `slide-${index}`, image: text("image"), eyebrow: text("eyebrow"),
      title: text("title"), text: text("text"), button: text("button"),
    }];
  });
}

export async function listLandings(): Promise<Landing[]> {
  const rows = await db.setting.findMany({ where: { key: { startsWith: "landing:" } }, orderBy: { updatedAt: "desc" } });
  return rows.flatMap((row) => {
    try {
      const value = JSON.parse(row.value);
      if (!value || typeof value !== "object") return [];
      const first = landingDefaults.heroSlides[0];
      const heroSlides = normalizeLandingSlides(value.heroSlides ?? [{
        image: value.heroImage ?? first.image, eyebrow: value.heroEyebrow ?? first.eyebrow,
        title: value.heroTitle ?? first.title, text: value.heroText ?? first.text, button: value.heroButton ?? first.button,
      }]);
      const discountPercent = validLandingDiscount(value.discountPercent) ? value.discountPercent : 0;
      return [{ ...landingDefaults, ...value, heroSlides, discountPercent, id: row.key.slice(8) } as Landing];
    } catch { return []; }
  });
}

export const getPublishedLanding = cache(async (slug: string) => {
  await connection();
  return (await listLandings()).find((page) => page.slug === slug && page.published);
});

export function validLandingDiscount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

export const getLandingProducts = cache(async (page: Landing) => {
  const catalog = await getProductsByIds(page.productIds, "ka-ge");
  const byId = new Map(catalog.map((product) => [product.id, product]));
  return page.productIds.flatMap((id) => byId.get(id) ?? []).slice(0, LANDING_PRODUCT_LIMIT);
});
