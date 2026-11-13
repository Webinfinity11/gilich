import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { parseJson } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  await requireAdmin();
  const [categories, attributes] = await Promise.all([
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true } }),
    db.productAttribute.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  return (
    <div>
      <Link href="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← Products
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">New product</h1>
      <ProductForm
        categories={categories}
        attributes={attributes.map((a) => ({ name: a.name, values: parseJson<string[]>(a.values, []) }))}
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
          options: {},
          images: [],
          variations: [],
        }}
      />
    </div>
  );
}
