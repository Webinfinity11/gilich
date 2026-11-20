export const BLACK_FRIDAY_PATH = "/black-friday";
export const INTERNAL_BLACK_FRIDAY_PATH = "/landing/black-friday";
export const blackFridayParams = Promise.resolve({ slug: "black-friday" });

export function landingPath(slug: string) {
  return slug === "black-friday" ? BLACK_FRIDAY_PATH : `/landing/${slug}`;
}
