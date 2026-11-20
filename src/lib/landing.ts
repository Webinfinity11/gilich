import { db } from "@/lib/db";
import { cache } from "react";
import { connection } from "next/server";
import { LANDING_PRODUCT_LIMIT, LANDING_SLIDE_LIMIT } from "@/lib/landing-limits";
import { getProductsByIds } from "@/lib/catalog";
import { defaultLandingDesign, normalizeLandingDesign, type LandingDesign } from "@/lib/landing-design";
import type { Lang } from "@/lib/i18n";
import { landingEnglishDefaults, normalizeEnglishCopy, slideEnglishDefaults, type EnglishLandingCopy, type EnglishSlideCopy } from "@/lib/landing-copy";

export type LandingSlide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  text: string;
  button: string;
  english?: EnglishSlideCopy;
};

export type Landing = {
  id: string; slug: string; published: boolean; title: string; announcement: string;
  logo: string; headerButton: string; heroSlides: LandingSlide[]; productsTitle: string;
  productIds: number[]; aboutTitle: string; aboutText: string; aboutImage: string;
  discountPercent: number;
  design: LandingDesign;
  english: EnglishLandingCopy;
  footerText: string; footerPhone: string; footerEmail: string;
};

export const landingDefaults: Omit<Landing, "id"> = {
  slug: "", published: false, title: "Black Friday", announcement: "აღმოაჩინეთ განსაკუთრებული შეთავაზებები",
  logo: "", headerButton: "Black Friday",
  discountPercent: 0,
  design: defaultLandingDesign,
  english: {},
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
      english: normalizeEnglishCopy(slide.english, slideEnglishDefaults),
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
      return [{
        ...landingDefaults, ...value, heroSlides, discountPercent, design: normalizeLandingDesign(value.design),
        english: normalizeEnglishCopy(value.english, landingEnglishDefaults), id: row.key.slice(8),
      } as Landing];
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

export const getLandingProducts = cache(async (page: Landing, lang: Lang = "ka-ge") => {
  const catalog = await getProductsByIds(page.productIds, lang);
  const byId = new Map(catalog.map((product) => [product.id, product]));
  return page.productIds.flatMap((id) => byId.get(id) ?? []).slice(0, LANDING_PRODUCT_LIMIT);
});
