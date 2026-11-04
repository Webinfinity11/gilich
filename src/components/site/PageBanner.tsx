"use client";

import { ChevronRight } from "./icons";
import { useI18n } from "./lang";
import { LLink } from "./LLink";
import { useSiteInfo } from "./SiteInfo";

export function PageBanner({ title, crumbs }: { title: string; crumbs: { label: string; href?: string }[] }) {
  const { t } = useI18n();
  const info = useSiteInfo();
  return (
    <section className="bg-[#f3f3f3] bg-cover bg-left" style={{ backgroundImage: `url(${info.pageBanner})` }}>
      <div className="container-site py-10 md:py-[88px]">
        <h1 className="text-[32px] font-medium uppercase leading-none text-ink [overflow-wrap:anywhere] md:text-[60px]">{title}</h1>
        <nav className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm uppercase text-ink md:mt-6">
          <LLink href="/" className="hover:underline">
            {t.common.home}
          </LLink>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-2">
              <ChevronRight className="size-3.5 text-muted" />
              {c.href ? (
                <LLink href={c.href} className="hover:underline">
                  {c.label}
                </LLink>
              ) : (
                <span>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}
