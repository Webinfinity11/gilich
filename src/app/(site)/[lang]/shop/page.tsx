import type { Metadata } from "next";
import { PageBanner } from "@/components/site/PageBanner";
import { ShopView } from "@/components/site/ShopView";
import { getAttributeFilters, getCategories, getProducts } from "@/lib/catalog";
import { getDict, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).shop.title };
}

export default async function ShopPage({ params: routeParams, searchParams }: PageProps<"/[lang]/shop">) {
  const lang = (await routeParams).lang as Lang;
  const t = getDict(lang);
  const [params, products, categories, attributes] = await Promise.all([
    searchParams,
    getProducts(lang),
    getCategories(lang),
    getAttributeFilters(),
  ]);
  return (
    <>
      <PageBanner title={t.shop.title} crumbs={[{ label: t.shop.title }]} />
      <ShopView lang={lang} basePath="/shop" products={products} categories={categories} attributes={attributes} params={params} />
    </>
  );
}
