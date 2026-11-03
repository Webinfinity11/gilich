"use client";

import { LLink } from "@/components/site/LLink";
import { useI18n } from "@/components/site/lang";
import { PageBanner } from "@/components/site/PageBanner";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <PageBanner title="404" crumbs={[{ label: t.notFound.crumb }]} />
      <div className="container-site py-20 text-center">
        <p className="text-lg text-ink">{t.notFound.text}</p>
        <LLink href="/shop" className="btn-dark mt-8">
          {t.notFound.back}
        </LLink>
      </div>
    </>
  );
}
