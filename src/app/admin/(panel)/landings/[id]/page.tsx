import { notFound } from "next/navigation";
import { LandingEditor } from "@/components/admin/LandingEditor";
import { landingDefaults, listLandings } from "@/lib/landing";
import { db } from "@/lib/db";

export default async function EditLanding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pages, products] = await Promise.all([listLandings(), db.product.findMany({ where: { status: "published" }, select: { id: true, name: true, nameKa: true }, orderBy: { name: "asc" } })]);
  const page = id === "new" ? { ...landingDefaults, id: "" } : pages.find((item) => item.id === id);
  if (!page) notFound();
  return <LandingEditor initial={page} products={products} />;
}
