import type { Metadata } from "next";
import { CartView } from "@/components/site/CartView";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { getProducts, sortProducts } from "@/lib/catalog";
import { getDict, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).cart.title };
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  const newest = sortProducts(await getProducts(lang), "latest").slice(0, 4);
  return (
    <>
      <PageBanner title={t.cart.title} crumbs={[{ label: t.cart.title }]} />
      <CartView
        emptyExtra={
          <div className="mt-12">
            <h2 className="mb-8 text-center text-[28px] text-ink">{t.cart.newInStore}</h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {newest.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        }
      />
    </>
  );
}
