import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "ახალი პროდუქტი" };

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true } });
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← პროდუქცია
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">ახალი პროდუქტი</h1>
      <ProductForm
        categories={categories}
        initial={{
          name: "",
          nameKa: "",
          slug: "",
          sku: "",
          shortDescription: "",
          shortDescriptionKa: "",
          description: "",
          descriptionKa: "",
          price: "",
          salePrice: "",
          stock: "",
          status: "published",
          featured: false,
          categoryIds: [],
          images: [],
          variations: [],
        }}
      />
    </div>
  );
}
