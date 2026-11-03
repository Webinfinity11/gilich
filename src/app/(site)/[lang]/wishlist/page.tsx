import type { Metadata } from "next";
import { PageBanner } from "@/components/site/PageBanner";
import { WishlistView } from "@/components/site/WishlistView";
import { getDict, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/wishlist">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).wishlist.title };
}

export default async function WishlistPage({ params }: PageProps<"/[lang]/wishlist">) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  return (
    <>
      <PageBanner title={t.wishlist.title} crumbs={[{ label: t.wishlist.title }]} />
      <WishlistView />
    </>
  );
}
