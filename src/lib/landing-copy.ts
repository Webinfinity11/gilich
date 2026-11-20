export const landingEnglishDefaults = {
  announcement: "Discover our special offers",
  headerButton: "Black Friday",
  productsTitle: "Featured jewelry",
  aboutTitle: "About us",
  aboutText: "Gilich Jewelry House creates jewelry for special moments.",
  footerText: "Gilich Jewelry House",
};

export const slideEnglishDefaults = {
  eyebrow: "GILICH JEWELRY HOUSE",
  title: "Find your special piece of jewelry",
  text: "Beauty that tells your story.",
  button: "Explore the collection",
};

export const landingCopyFields = {
  announcement: "Announcement", headerButton: "Header button", productsTitle: "Products heading",
  aboutTitle: "About heading", aboutText: "About text", footerText: "Footer text",
} satisfies Record<keyof typeof landingEnglishDefaults, string>;

export type EnglishLandingCopy = Partial<typeof landingEnglishDefaults>;
export type EnglishSlideCopy = Partial<typeof slideEnglishDefaults>;

export function normalizeEnglishCopy<T extends Record<string, string>>(input: unknown, defaults: T): Partial<T> {
  if (!input || typeof input !== "object") return {};
  const values = input as Record<string, unknown>;
  return Object.fromEntries(Object.keys(defaults).flatMap((key) => {
    const value = values[key];
    return typeof value === "string" && value.trim() ? [[key, value.trim().slice(0, 10000)]] : [];
  })) as Partial<T>;
}

export function localizedLandingCopy<T extends Record<string, string>>(english: Partial<T>, source: T, originalDefaults: T, translatedDefaults: T): T {
  const copy = { ...translatedDefaults };
  for (const key of Object.keys(copy) as (keyof T)[]) {
    copy[key] = english[key] ?? (source[key] === originalDefaults[key] ? translatedDefaults[key] : source[key]);
  }
  return copy;
}
