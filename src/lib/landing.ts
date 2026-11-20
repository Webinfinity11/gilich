import { db } from "@/lib/db";

export type Landing = {
  id: string; slug: string; published: boolean; title: string; announcement: string;
  logo: string; headerButton: string; heroEyebrow: string; heroTitle: string;
  heroText: string; heroButton: string; heroImage: string; productsTitle: string;
  productIds: number[]; aboutTitle: string; aboutText: string; aboutImage: string;
  footerText: string; footerPhone: string; footerEmail: string;
};

export const landingDefaults: Omit<Landing, "id"> = {
  slug: "", published: false, title: "Black Friday", announcement: "აღმოაჩინეთ განსაკუთრებული შეთავაზებები",
  logo: "", headerButton: "Black Friday", heroEyebrow: "GILICH JEWELRY HOUSE",
  heroTitle: "შეარჩიეთ თქვენი განსაკუთრებული სამკაული", heroText: "სილამაზე, რომელიც თქვენს ისტორიას ქმნის.",
  heroButton: "იხილეთ კოლექცია", heroImage: "", productsTitle: "რჩეული სამკაულები", productIds: [],
  aboutTitle: "ჩვენ შესახებ", aboutText: "Gilich Jewelry House — სამკაულები განსაკუთრებული მომენტებისთვის.",
  aboutImage: "", footerText: "Gilich Jewelry House", footerPhone: "", footerEmail: "",
};

export async function listLandings(): Promise<Landing[]> {
  const rows = await db.setting.findMany({ where: { key: { startsWith: "landing:" } }, orderBy: { updatedAt: "desc" } });
  return rows.flatMap((row) => {
    try {
      const value = JSON.parse(row.value);
      if (!value || typeof value !== "object") return [];
      return [{ ...landingDefaults, ...value, id: row.key.slice(8) } as Landing];
    } catch { return []; }
  });
}
