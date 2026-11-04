import { getDict, type Lang } from "@/lib/i18n";
import type { SiteInfo } from "@/lib/settings";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, StarSparkle } from "./icons";
import { LLink } from "./LLink";

const collections = ["necklaces", "rings", "bracelets", "earrings"] as const;

export function Footer({ lang, info }: { lang: Lang; info: SiteInfo }) {
  const t = getDict(lang);
  const menu = [
    { href: "/", label: t.nav.home },
    { href: "/about-page", label: t.nav.about },
    { href: "/shop", label: t.nav.shop },
    { href: "/contact-page", label: t.nav.contact },
    { href: "/terms-and-conditions", label: t.footer.terms },
    { href: "/privacy-policy", label: t.footer.privacy },
  ];
  const collectionLabels: Record<(typeof collections)[number], string> =
    lang === "ka-ge"
      ? { necklaces: "ყელსაბამები", rings: "ბეჭდები", bracelets: "სამაჯურები", earrings: "საყურეები" }
      : { necklaces: "Necklaces", rings: "Rings", bracelets: "Bracelets", earrings: "Earrings" };

  return (
    <footer>
      <div className="relative overflow-hidden bg-footer bg-cover bg-center py-14 text-white md:py-[70px]" style={{ backgroundImage: "url(/media/bg-footer1.jpg)" }}>
        <StarSparkle className="absolute left-5 top-[38%] hidden size-6 text-white/90 md:block" />
        <StarSparkle className="absolute right-5 top-14 size-4 text-white/90" />
        <StarSparkle className="absolute bottom-8 right-6 size-3 text-white/90" />
        <div className="container-site">
          <div className="grid gap-10 border border-white/70 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr] md:px-[72px]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={info.logoWhite} alt="Gilich Jewelry House" className="h-[58px] w-auto" />
              <ul className="mt-8 space-y-1 text-[15px] text-white/90">
                <li className="flex items-center gap-3">
                  <PinIcon className="size-4 shrink-0" />
                  {info.address}
                </li>
                <li>
                  <a href={info.phoneHref} className="flex items-center gap-3 py-1.5 hover:underline">
                    <PhoneIcon className="size-4 shrink-0" />
                    {info.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${info.email}`} className="flex items-center gap-3 break-all py-1.5 hover:underline">
                    <MailIcon className="size-4 shrink-0" />
                    {info.email}
                  </a>
                </li>
              </ul>
              <div className="-ml-2.5 mt-6 flex gap-1">
                <a href={info.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-10 items-center justify-center hover:opacity-70">
                  <FacebookIcon className="size-5" />
                </a>
                <a href={info.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-10 items-center justify-center hover:opacity-70">
                  <InstagramIcon className="size-5" />
                </a>
              </div>
            </div>
            <FooterColumn title={t.footer.menu} links={menu} />
            <FooterColumn title={t.footer.collections} links={collections.map((c) => ({ href: `/product-category/${c}`, label: collectionLabels[c] }))} />
          </div>
        </div>
      </div>
      <div className="container-site flex flex-col items-center justify-between gap-4 py-5 text-sm text-ink md:flex-row">
        <p>{info.footerText}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/footer-home1.png" alt="Visa, Mastercard, Amex, Apple Pay" className="h-[22px] w-auto" />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-lg font-medium uppercase">{title}</h3>
      <ul className="mt-3 space-y-0.5 text-[15px] text-white/90">
        {links.map((l) => (
          <li key={l.href}>
            <LLink href={l.href} className="inline-block py-1.5 hover:underline">
              {l.label}
            </LLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
