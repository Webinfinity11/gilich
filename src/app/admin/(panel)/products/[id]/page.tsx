import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin";
import { parseJson } from "@/lib/catalog";
import { db } from "@/lib/db";
import { fromCents } from "@/lib/money";

export const metadata = { title: "პროდუქტის რედაქტირება" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const saved = (await searchParams).saved === "1";
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } }, categories: { select: { id: true } }, variations: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, parentId: true } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← პროდუქცია
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">{product.name}</h1>
      <ProductForm
        key={product.updatedAt.toISOString()}
        categories={categories}
        saved={saved}
        initial={{
          id: product.id,
          name: product.name,
          nameKa: product.nameKa ?? "",
          slug: product.slug,
          sku: product.sku ?? "",
          shortDescription: product.shortDescription ?? "",
          shortDescriptionKa: product.shortDescriptionKa ?? "",
          description: product.description ?? "",
          descriptionKa: product.descriptionKa ?? "",
          price: fromCents(product.price),
          salePrice: fromCents(product.salePrice),
          stock: product.stock === null ? "" : String(product.stock),
          status: product.status === "draft" ? "draft" : "published",
          featured: product.featured,
          categoryIds: product.categories.map((c) => c.id),
          images: product.images.map((i) => i.url),
          attributes: parseJson(product.attributes, []),
          variations: product.variations.map((v) => ({
            id: v.id,
            options: parseJson<Record<string, string>>(v.options, {}),
            sku: v.sku ?? "",
            price: fromCents(v.price),
            salePrice: fromCents(v.salePrice),
            stock: v.stock === null ? "" : String(v.stock),
            image: v.image,
          })),
        }}
      />
    </div>
  );
}
