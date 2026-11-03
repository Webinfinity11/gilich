import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBanner } from "@/components/site/PageBanner";
import { ShopView } from "@/components/site/ShopView";
import { getAttributeFilters, getCategories, getProductsInCategory } from "@/lib/catalog";
import { getDict, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/product-category/[slug]">): Promise<Metadata> {
  const { slug, lang } = await params;
  const category = (await getCategories(lang as Lang)).find((c) => c.slug === slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/product-category/[slug]">) {
  const { slug, lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  const [sp, categories, attributes] = await Promise.all([searchParams, getCategories(lang), getAttributeFilters()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const products = await getProductsInCategory(slug, lang);
  const parent = category.parentId ? categories.find((c) => c.id === category.parentId) : null;

  return (
    <>
      <PageBanner
        title={category.name}
        crumbs={[
          { label: t.shop.title, href: "/shop" },
          ...(parent ? [{ label: parent.name, href: `/product-category/${parent.slug}` }] : []),
          { label: category.name },
        ]}
      />
      {category.description && <div className="container-site pt-10 text-muted">{category.description}</div>}
      <ShopView lang={lang} basePath={`/product-category/${slug}`} products={products} categories={categories} attributes={attributes} params={sp} />
    </>
  );
}
