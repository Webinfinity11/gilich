import type { Metadata } from "next";
import { OrderReceipt } from "@/components/site/OrderReceipt";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";

export const metadata: Metadata = { title: "Order received", robots: { index: false } };

export default async function OrderReceivedPage({ params }: PageProps<"/[lang]/order-received/[token]">) {
  const { token, lang } = await params;
  const t = getDict(lang as Lang);
  return (
    <>
      <PageBanner title={t.checkout.title} crumbs={[{ label: t.order.received }]} />
      <OrderReceipt token={token} lang={lang as Lang} />
    </>
  );
}
