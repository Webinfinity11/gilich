import type { Metadata } from "next";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).checkout.title };
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  return (
    <>
      <PageBanner title={t.checkout.title} crumbs={[{ label: t.checkout.title }]} />
      <CheckoutForm />
    </>
  );
}
