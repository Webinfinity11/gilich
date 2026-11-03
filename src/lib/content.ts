import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import { pick, type Lang } from "@/lib/i18n";

export const CONTENT_TAG = "content";

/** One home hero slide as stored in the database (both languages) */
export type HeroSlideInput = {
  image: string;
  eyebrow: string;
  eyebrowKa: string;
  title: string;
  titleKa: string;
  button: string;
  buttonKa: string;
  link: string;
};

/** A slide resolved for one language */
export type HeroSlide = { image: string; eyebrow: string; title: string; button: string; link: string };

export const defaultHero: HeroSlideInput[] = [
  {
    image: "/media/472025053_17890326432118951_1617664198186007143_n1-scaled.webp",
    eyebrow: "Gilich Jewelry House",
    eyebrowKa: "Gilich Jewelry House",
    title: "Passionately crafted, uniquely yours",
    titleKa: "ვნებით შექმნილი, უნიკალურად თქვენი",
    button: "",
    buttonKa: "",
    link: "/shop",
  },
  {
    image: "/media/IMG_0403.webp",
    eyebrow: "Gilich Jewelry House",
    eyebrowKa: "Gilich Jewelry House",
    title: "Your guide to the world of luxury and beauty",
    titleKa: "თქვენი გზამკვლევი ფუფუნებისა და სილამაზის სამყაროში",
    button: "",
    buttonKa: "",
    link: "/shop",
  },
  {
    image: "/media/641185523_17943979374118951_2759391885138736427_n1-scaled.webp",
    eyebrow: "Gilich Jewelry House",
    eyebrowKa: "Gilich Jewelry House",
    title: "Jewelry with certified diamonds",
    titleKa: "სამკაულები სერტიფიცირებული ბრილიანტებით",
    button: "",
    buttonKa: "",
    link: "/shop",
  },
];

/** Raw slides for the admin editor (not cached) */
export async function loadHeroInput(): Promise<HeroSlideInput[]> {
  const row = await db.setting.findUnique({ where: { key: "hero" } });
  if (!row) return defaultHero;
  try {
    const slides = JSON.parse(row.value) as HeroSlideInput[];
    return Array.isArray(slides) ? slides : defaultHero;
  } catch {
    return defaultHero;
  }
}

export async function getHero(lang: Lang): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const slides = await loadHeroInput();
  return slides
    .filter((s) => s.image)
    .map((s) => ({
      image: s.image,
      eyebrow: pick(lang, s.eyebrow, s.eyebrowKa),
      title: pick(lang, s.title, s.titleKa),
      button: pick(lang, s.button, s.buttonKa),
      link: s.link || "/shop",
    }));
}
