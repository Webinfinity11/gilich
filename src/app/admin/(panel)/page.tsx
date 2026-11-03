import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { statusColors, statusLabels } from "@/lib/orders";

export const metadata = { title: "მთავარი" };

export default async function DashboardPage() {
  await requireAdmin();
  const [orders, revenue, pending, products, categories, unread, recent] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" } } }),
    db.order.count({ where: { status: "pending" } }),
    db.product.count(),
    db.category.count(),
    db.contactMessage.count({ where: { read: false } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { items: true } } } }),
  ]);

  const stats = [
    { label: "შემოსავალი", value: formatPrice(revenue._sum.total ?? 0), href: "/admin/orders" },
    { label: "შეკვეთები", value: orders, href: "/admin/orders" },
    { label: "ახალი შეკვეთები", value: pending, href: "/admin/orders?status=pending" },
    { label: "პროდუქტები", value: products, href: "/admin/products" },
    { label: "კატეგორიები", value: categories, href: "/admin/categories" },
    { label: "წაუკითხავი შეტყობინება", value: unread, href: "/admin/messages" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">მთავარი</h1>
        <Link href="/admin/products/new" className="admin-btn">
          + ახალი პროდუქტი
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="admin-card p-5 transition hover:shadow-md">
            <p className="text-sm text-zinc-500">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="admin-card mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="font-semibold">ბოლო შეკვეთები</h2>
          <Link href="/admin/orders" className="text-sm text-zinc-500 hover:text-zinc-900">
            ყველა →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">შეკვეთები ჯერ არ არის</p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      #{o.id} {o.firstName} {o.lastName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-zinc-500">{o.createdAt.toLocaleString("ka-GE")}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusColors[o.status]}`}>{statusLabels[o.status] ?? o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
