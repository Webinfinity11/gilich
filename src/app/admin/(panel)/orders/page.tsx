import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUSES, paymentLabels, statusColors, statusLabels } from "@/lib/orders";

export const metadata = { title: "შეკვეთები" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const asNumber = Number(q.replace("#", ""));

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                ...(Number.isInteger(asNumber) && asNumber > 0 ? [{ id: asNumber }] : []),
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { items: { select: { quantity: true } } },
      take: 200,
    }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const total = counts.reduce((s, c) => s + c._count, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold">შეკვეთები</h1>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Tab href="/admin/orders" active={!status}>
          ყველა ({total})
        </Tab>
        {ORDER_STATUSES.map((s) => (
          <Tab key={s} href={`/admin/orders?status=${s}`} active={status === s}>
            {statusLabels[s]} ({countOf(s)})
          </Tab>
        ))}
      </div>

      <form className="mt-4 flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="ძებნა: #ნომერი, სახელი, ტელეფონი, ელფოსტა" className="admin-input max-w-md" />
        <button type="submit" className="admin-btn-ghost">
          ძებნა
        </button>
      </form>

      <div className="admin-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">შეკვეთა</th>
              <th className="px-4 py-3 font-medium">თარიღი</th>
              <th className="px-4 py-3 font-medium">ტელეფონი</th>
              <th className="px-4 py-3 font-medium">გადახდა</th>
              <th className="px-4 py-3 font-medium">სტატუსი</th>
              <th className="px-4 py-3 text-right font-medium">ჯამი</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    #{o.id} {o.firstName} {o.lastName}
                  </Link>
                  <p className="text-xs text-zinc-500">{o.items.reduce((s, i) => s + i.quantity, 0)} ნივთი</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">{o.createdAt.toLocaleString("ka-GE")}</td>
                <td className="px-4 py-3">{o.phone}</td>
                <td className="px-4 py-3 text-zinc-600">{paymentLabels[o.paymentMethod] ?? o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusColors[o.status]}`}>{statusLabels[o.status] ?? o.status}</span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">შეკვეთები ვერ მოიძებნა</p>}
      </div>
    </div>
  );
}

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1.5 ${active ? "bg-zinc-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"}`}>
      {children}
    </Link>
  );
}
