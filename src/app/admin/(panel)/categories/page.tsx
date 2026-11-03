import Link from "next/link";
import { deleteCategory } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "კატეგორიები" };

export default async function CategoriesPage({ searchParams }: PageProps<"/admin/categories">) {
  await requireAdmin();
  const sp = await searchParams;
  const editId = typeof sp.edit === "string" ? Number(sp.edit) : 0;

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const editing = categories.find((c) => c.id === editId) ?? null;
  const top = categories.filter((c) => !c.parentId);
  const childrenOf = (id: number) => categories.filter((c) => c.parentId === id);
  const rows = top.flatMap((c) => [{ c, depth: 0 }, ...childrenOf(c.id).map((ch) => ({ c: ch, depth: 1 }))]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">კატეგორიები ({categories.length})</h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[360px_1fr]">
        <section className="admin-card p-5">
          <h2 className="mb-4 font-semibold">{editing ? `რედაქტირება: ${editing.name}` : "ახალი კატეგორია"}</h2>
          <CategoryForm
            key={editing?.id ?? "new"}
            category={editing}
            parents={categories.filter((c) => !c.parentId && c.id !== editing?.id).map((c) => ({ id: c.id, name: c.name }))}
          />
          {editing && (
            <Link href="/admin/categories" className="mt-3 inline-block text-sm text-zinc-500 hover:underline">
              გაუქმება
            </Link>
          )}
        </section>

        <section className="admin-card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="w-14 px-4 py-3" />
                <th className="px-4 py-3 font-medium">სახელი</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">პროდ.</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map(({ c, depth }) => (
                <tr key={c.id} className={c.id === editId ? "bg-amber-50" : "hover:bg-zinc-50"}>
                  <td className="px-4 py-2">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt="" className="size-10 rounded object-cover ring-1 ring-zinc-200" />
                    ) : (
                      <div className="size-10 rounded bg-zinc-100" />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={depth ? "pl-5 text-zinc-700 before:mr-1 before:text-zinc-400 before:content-['—']" : "font-medium"}>{c.name}</span>
                    {c.nameKa && <span className="ml-2 text-xs text-zinc-500">{c.nameKa}</span>}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{c.slug}</td>
                  <td className="px-4 py-2">{c._count.products}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-3 whitespace-nowrap">
                      <Link href={`/admin/categories?edit=${c.id}`} className="hover:underline">
                        რედაქტირება
                      </Link>
                      <ConfirmButton action={deleteCategory.bind(null, c.id)}>წაშლა</ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
