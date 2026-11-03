import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLink as Link } from "@/components/site/LLink";
import { PageBanner } from "@/components/site/PageBanner";
import { db } from "@/lib/db";
import { getDict, type Lang } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function OrderReceivedPage({ params }: PageProps<"/[lang]/order-received/[token]">) {
  const { token, lang } = await params;
  const t = getDict(lang as Lang);
  const order = await db.order.findUnique({ where: { token }, include: { items: true } });
  if (!order) notFound();

  return (
    <>
      <PageBanner title={t.checkout.title} crumbs={[{ label: t.order.received }]} />
      <div className="container-site max-w-[860px] py-12 md:py-[60px]">
        <p className="text-lg text-green-700">{t.order.thanks}</p>
        <ul className="mt-6 grid gap-4 border border-dashed border-line p-6 text-sm sm:grid-cols-4">
          <li>
            <span className="block text-xs uppercase text-muted">{t.order.number}</span>
            <strong className="font-medium">#{order.id}</strong>
          </li>
          <li>
            <span className="block text-xs uppercase text-muted">{t.order.date}</span>
            <strong className="font-medium">{order.createdAt.toLocaleDateString("en-GB")}</strong>
          </li>
          <li>
            <span className="block text-xs uppercase text-muted">{t.common.total}</span>
            <strong className="font-medium">{formatPrice(order.total)}</strong>
          </li>
          <li>
            <span className="block text-xs uppercase text-muted">{t.order.payment}</span>
            <strong className="font-medium">{order.paymentMethod === "bank" ? t.checkout.bank : t.checkout.cod}</strong>
          </li>
        </ul>

        <h2 className="mt-10 text-xl uppercase">{t.order.details}</h2>
        <table className="mt-4 w-full text-[15px]">
          <tbody className="divide-y divide-line border-y border-line">
            {order.items.map((i) => (
              <tr key={i.id}>
                <td className="py-3">
                  {i.name} <span className="text-muted">× {i.quantity}</span>
                  {i.variation && <span className="block text-xs text-muted">{i.variation}</span>}
                </td>
                <td className="py-3 text-right">{formatPrice(i.price * i.quantity)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-3 font-medium">{t.common.total}</td>
              <td className="py-3 text-right font-medium">{formatPrice(order.total)}</td>
            </tr>
          </tbody>
        </table>
        <Link href="/shop" className="btn-dark mt-10">
          {t.common.continueShopping}
        </Link>
      </div>
    </>
  );
}
