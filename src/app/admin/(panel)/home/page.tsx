import { HeroEditor } from "@/components/admin/HeroEditor";
import { requireAdmin } from "@/lib/admin";
import { loadHeroInput } from "@/lib/content";

export const metadata = { title: "Home page" };

export default async function HomeContentPage() {
  await requireAdmin();
  const slides = await loadHeroInput();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Home page</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-500">Hero slides: image, text and button. Georgian fields appear on the Georgian site (/ka-ge), English fields on the English site (/). If a Georgian field is empty, the English text is shown.</p>
      <HeroEditor initial={slides} />
    </div>
  );
}
