import Link from "next/link";
import { deleteProduct, duplicateProduct } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export const metadata = { title: "პროდუქცია" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? Number(sp.category) : 0;

  const [products, categories] = await Promise.all([
    db.product.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {}),
        ...(category ? { categories: { some: { id: category } } } : {}),
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        categories: { select: { name: true } },
        variations: { select: { price: true, stock: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">პროდუქცია ({products.length})</h1>
        <Link href="/admin/products/new" className="admin-btn">
          + ახალი პროდუქტი
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="ძებნა სახელით ან SKU-ით" className="admin-input max-w-xs" />
        <select name="category" defaultValue={category || ""} className="admin-input max-w-[220px]">
          <option value="">ყველა კატეგორია</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="admin-btn-ghost">
          გაფილტვრა
        </button>
      </form>

      <div className="admin-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="w-16 px-4 py-3" />
              <th className="px-4 py-3 font-medium">სახელი</th>
              <th className="px-4 py-3 font-medium">ფასი</th>
              <th className="px-4 py-3 font-medium">მარაგი</th>
              <th className="px-4 py-3 font-medium">კატეგორიები</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((p) => {
              const prices = p.variations.map((v) => v.price);
              const min = prices.length ? Math.min(...prices) : p.price;
              const max = prices.length ? Math.max(...prices) : p.price;
              const stock = p.variations.length
                ? p.variations.every((v) => v.stock === null)
                  ? "∞"
                  : p.variations.reduce((s, v) => s + (v.stock ?? 0), 0)
                : (p.stock ?? "∞");
              return (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="size-12 rounded-md object-cover ring-1 ring-zinc-200" />
                    ) : (
                      <div className="size-12 rounded-md bg-zinc-100" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                    {p.nameKa && <span className="ml-2 text-xs text-zinc-500">{p.nameKa}</span>}
                    {p.variations.length > 0 && <span className="ml-2 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">{p.variations.length} ვარიაცია</span>}
                    {p.sku && <p className="text-xs text-zinc-500">SKU: {p.sku}</p>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`}
                    {p.salePrice !== null && !p.variations.length && <p className="text-xs text-red-600">ფასდაკლება: {formatPrice(p.salePrice)}</p>}
                  </td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="max-w-[220px] px-4 py-3 text-zinc-600">
                    <span className="line-clamp-2">{p.categories.map((c) => c.name).join(", ") || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${p.status === "published" ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-600"}`}>
                      {p.status === "published" ? "გამოქვეყნებული" : "დრაფტი"}
                    </span>
                    {p.featured && <span className="ml-1 text-amber-500" title="რჩეული">★</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <Link href={`/admin/products/${p.id}`} className="text-sm hover:underline">
                        რედაქტირება
                      </Link>
                      <form action={duplicateProduct.bind(null, p.id)}>
                        <button type="submit" className="text-sm text-zinc-500 hover:underline">
                          ასლი
                        </button>
                      </form>
                      <ConfirmButton action={deleteProduct.bind(null, p.id)}>წაშლა</ConfirmButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">პროდუქტები ვერ მოიძებნა</p>}
      </div>
    </div>
  );
}
