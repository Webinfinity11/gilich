"use client";

import { site } from "@/lib/site";
import { useI18n } from "./lang";

export function ContactList() {
  const { t } = useI18n();
  return (
    <dl className="mt-8 max-w-[250px] text-[15px]">
      {[
        { t: t.contact.storeAddress, v: t.footer.address },
        { t: t.contact.phone, v: site.phone, href: site.phoneHref },
        { t: t.contact.email, v: site.email, href: `mailto:${site.email}` },
      ].map((row) => (
        <div key={row.t} className="border-b border-line py-5 first:pt-0">
          <dt className="uppercase text-ink">{row.t}</dt>
          <dd className="mt-1 break-words text-sm text-muted">{row.href ? <a href={row.href} className="hover:text-ink">{row.v}</a> : row.v}</dd>
        </div>
      ))}
    </dl>
  );
}
