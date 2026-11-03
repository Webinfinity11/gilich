import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteOrder } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { paymentLabels } from "@/lib/orders";

export const metadata = { title: "შეკვეთა" };

export default async function OrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const products = await db.product.findMany({
    where: { id: { in: order.items.flatMap((i) => (i.productId ? [i.productId] : [])) } },
    select: { id: true, slug: true },
  });
  const slugOf = (pid: number | null) => products.find((p) => p.id === pid)?.slug;

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← შეკვეთები
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">შეკვეთა #{order.id}</h1>
        <OrderStatusSelect id={order.id} status={order.status} />
      </div>
      <p className="mt-1 text-sm text-zinc-500">{order.createdAt.toLocaleString("ka-GE")}</p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <section className="admin-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-left text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium" colSpan={2}>
                  პროდუქტი
                </th>
                <th className="px-4 py-3 font-medium">ფასი</th>
                <th className="px-4 py-3 font-medium">რაოდ.</th>
                <th className="px-4 py-3 text-right font-medium">ჯამი</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items.map((i) => {
                const slug = slugOf(i.productId);
                return (
                  <tr key={i.id}>
                    <td className="w-16 px-4 py-3">
                      {i.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={i.image} alt="" className="size-12 rounded object-cover ring-1 ring-zinc-200" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {slug ? (
                        <Link href={`/admin/products/${i.productId}`} className="font-medium hover:underline">
                          {i.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{i.name}</span>
                      )}
                      {i.variation && <p className="text-xs text-zinc-500">{i.variation}</p>}
                    </td>
                    <td className="px-4 py-3">{formatPrice(i.price)}</td>
                    <td className="px-4 py-3">× {i.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(i.price * i.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-zinc-200">
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right text-zinc-500">
                  ქვეჯამი
                </td>
                <td className="px-4 py-2 text-right">{formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-2 text-right text-zinc-500">
                  მიწოდება
                </td>
                <td className="px-4 py-2 text-right">{order.shipping ? formatPrice(order.shipping) : "უფასო"}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                  სულ
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <aside className="space-y-6">
          <section className="admin-card space-y-3 p-5 text-sm">
            <h2 className="font-semibold">მყიდველი</h2>
            <p className="font-medium">
              {order.firstName} {order.lastName}
            </p>
            <p>
              <a href={`tel:${order.phone}`} className="hover:underline">
                {order.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${order.email}`} className="break-all hover:underline">
                {order.email}
              </a>
            </p>
            <div className="border-t border-zinc-100 pt-3">
              <p className="text-xs uppercase text-zinc-500">მისამართი</p>
              <p className="mt-1">
                {order.address}, {order.city}, {order.country}
              </p>
            </div>
            <div className="border-t border-zinc-100 pt-3">
              <p className="text-xs uppercase text-zinc-500">გადახდის მეთოდი</p>
              <p className="mt-1">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
            </div>
            {order.note && (
              <div className="border-t border-zinc-100 pt-3">
                <p className="text-xs uppercase text-zinc-500">შენიშვნა</p>
                <p className="mt-1 whitespace-pre-line">{order.note}</p>
              </div>
            )}
          </section>
          <ConfirmButton action={deleteOrder.bind(null, order.id)} className="text-sm text-red-600 hover:underline">
            შეკვეთის წაშლა
          </ConfirmButton>
        </aside>
      </div>
    </div>
  );
}
