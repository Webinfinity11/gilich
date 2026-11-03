"use client";

import { site } from "@/lib/site";
import { ChevronRight } from "./icons";
import { useI18n } from "./lang";
import { LLink } from "./LLink";

export function PageBanner({ title, crumbs }: { title: string; crumbs: { label: string; href?: string }[] }) {
  const { t } = useI18n();
  return (
    <section className="bg-[#f3f3f3] bg-cover bg-left" style={{ backgroundImage: `url(${site.pageBanner})` }}>
      <div className="container-site py-16 md:py-[88px]">
        <h1 className="text-[40px] font-medium uppercase leading-none text-ink md:text-[60px]">{title}</h1>
        <nav className="mt-6 flex flex-wrap items-center gap-2 text-sm uppercase text-ink">
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
