import type { Metadata } from "next";
import { LegalText } from "@/components/site/LegalText";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { getSiteInfo } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/[lang]/terms-and-conditions">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).footer.terms };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms-and-conditions">) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const info = await getSiteInfo(lang);
  return (
    <>
      <PageBanner title={t.footer.terms} crumbs={[{ label: t.footer.terms }]} />
      <LegalText text={info.terms} />
    </>
  );
}
