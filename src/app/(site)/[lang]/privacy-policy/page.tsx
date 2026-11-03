import type { Metadata } from "next";
import { LegalText } from "@/components/site/LegalText";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { getSiteInfo } from "@/lib/settings";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy-policy">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).footer.privacy };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy-policy">) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const info = await getSiteInfo(lang);
  return (
    <>
      <PageBanner title={t.footer.privacy} crumbs={[{ label: t.footer.privacy }]} />
      <LegalText text={info.privacy} />
    </>
  );
}
