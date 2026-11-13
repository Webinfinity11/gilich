import { AttributesEditor } from "@/components/admin/AttributesEditor";
import { requireAdmin } from "@/lib/admin";
import { parseJson } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata = { title: "Attributes" };

export default async function AttributesPage() {
  await requireAdmin();
  const rows = await db.productAttribute.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Attributes ({rows.length})</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Create an attribute (e.g. Carat) and its values. In a product, each variation then gets a field to pick the value.
      </p>
      <div className="mt-6">
        <AttributesEditor attributes={rows.map((r) => ({ id: r.id, name: r.name, nameKa: r.nameKa ?? "", values: parseJson<string[]>(r.values, []) }))} />
      </div>
    </div>
  );
}
