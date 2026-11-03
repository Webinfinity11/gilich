export function formatPrice(cents: number) {
  return `${(cents / 100).toFixed(2)}$`;
}

/** "100" / "100.50" -> cents */
export function toCents(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function fromCents(cents: number | null | undefined) {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);
}
