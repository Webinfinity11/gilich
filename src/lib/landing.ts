import { db } from "@/lib/db";
import { LANDING_SLIDE_LIMIT } from "@/lib/landing-limits";

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
  footerText: string; footerPhone: string; footerEmail: string;
};

export const landingDefaults: Omit<Landing, "id"> = {
  slug: "", published: false, title: "Black Friday", announcement: "აღმოაჩინეთ განსაკუთრებული შეთავაზებები",
  logo: "", headerButton: "Black Friday",
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
      return [{ ...landingDefaults, ...value, heroSlides, id: row.key.slice(8) } as Landing];
    } catch { return []; }
  });
}
