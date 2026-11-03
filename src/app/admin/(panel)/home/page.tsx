import { HeroEditor } from "@/components/admin/HeroEditor";
import { requireAdmin } from "@/lib/admin";
import { loadHeroInput } from "@/lib/content";

export const metadata = { title: "მთავარი გვერდი" };

export default async function HomeContentPage() {
  await requireAdmin();
  const slides = await loadHeroInput();
  return (
    <div>
      <h1 className="text-2xl font-semibold">მთავარი გვერდი</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">ჰეროს სლაიდები: ფოტო, ტექსტი და ღილაკი. ქართული ველები ჩანს ქართულ საიტზე (/ka-ge), ინგლისური კი ინგლისურზე (/). თუ ქართული ველი ცარიელია, ინგლისური ტექსტი გამოჩნდება.</p>
      <HeroEditor initial={slides} />
    </div>
  );
}
