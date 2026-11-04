"use client";

import { useI18n } from "./lang";
import { useSiteInfo } from "./SiteInfo";

export function ContactList() {
  const { t } = useI18n();
  const info = useSiteInfo();
  return (
    <dl className="mt-8 text-[15px] lg:max-w-[250px]">
      {[
        { t: t.contact.storeAddress, v: info.address },
        { t: t.contact.phone, v: info.phone, href: info.phoneHref },
        { t: t.contact.email, v: info.email, href: `mailto:${info.email}` },
      ].map((row) => (
        <div key={row.t} className="border-b border-line py-5 first:pt-0">
          <dt className="uppercase text-ink">{row.t}</dt>
          <dd className="mt-1 break-words text-sm text-muted">{row.href ? <a href={row.href} className="hover:text-ink">{row.v}</a> : row.v}</dd>
        </div>
      ))}
    </dl>
  );
}
