// Georgian → Latin transliteration so Georgian names still get readable URLs
const ka: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o",
  პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "f", ქ: "k", ღ: "gh", ყ: "y", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz",
  წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => ka[ch] ?? ch)
    .join("")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
