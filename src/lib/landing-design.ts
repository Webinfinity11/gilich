export const landingSections = ["hero", "products", "about"] as const;
export type LandingSection = (typeof landingSections)[number];

export const landingTheme = {
  background: "#f9f7f3",
  text: "#24201d",
  accent: "#9b8069",
  header: "#ffffff",
  announcement: "#27211e",
  announcementText: "#ffffff",
  about: "#e8e1d8",
  aboutText: "#6e625a",
  footer: "#24201d",
  footerText: "#eee7dd",
};

export const defaultLandingDesign = {
  sections: [...landingSections],
  hidden: [] as LandingSection[],
  theme: landingTheme,
  overlayColor: "#000000",
  overlayOpacity: 55,
  overlayStyle: "gradient" as "gradient" | "solid",
  heroTextColor: "#ffffff",
  heroAlign: "left" as "left" | "center" | "right",
  heroHeight: "standard" as "compact" | "standard" | "tall",
  autoplaySeconds: 6,
  aboutImageSide: "left" as "left" | "right",
};

export type LandingDesign = typeof defaultLandingDesign;

function color(value: unknown, fallback: string) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export function normalizeLandingDesign(input: unknown): LandingDesign {
  const value = input && typeof input === "object" ? input as Partial<LandingDesign> : {};
  const sections = Array.isArray(value.sections) ? value.sections.filter((section) => landingSections.includes(section)) : [];
  const theme = { ...landingTheme };
  for (const key of Object.keys(theme) as (keyof typeof theme)[]) {
    theme[key] = color(value.theme?.[key], theme[key]);
  }
  return {
    sections: [...new Set([...sections, ...landingSections])],
    hidden: Array.isArray(value.hidden) ? landingSections.filter((section) => value.hidden?.includes(section)) : [],
    theme,
    overlayColor: color(value.overlayColor, defaultLandingDesign.overlayColor),
    overlayOpacity: typeof value.overlayOpacity === "number" && Number.isInteger(value.overlayOpacity) && value.overlayOpacity >= 0 && value.overlayOpacity <= 100 ? value.overlayOpacity : defaultLandingDesign.overlayOpacity,
    overlayStyle: value.overlayStyle === "solid" ? "solid" : "gradient",
    heroTextColor: color(value.heroTextColor, defaultLandingDesign.heroTextColor),
    heroAlign: value.heroAlign === "center" || value.heroAlign === "right" ? value.heroAlign : "left",
    heroHeight: value.heroHeight === "compact" || value.heroHeight === "tall" ? value.heroHeight : "standard",
    autoplaySeconds: typeof value.autoplaySeconds === "number" && Number.isInteger(value.autoplaySeconds) && value.autoplaySeconds >= 0 && value.autoplaySeconds <= 20 ? value.autoplaySeconds : defaultLandingDesign.autoplaySeconds,
    aboutImageSide: value.aboutImageSide === "right" ? "right" : "left",
  };
}
