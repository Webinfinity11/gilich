import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, StarSparkle } from "./icons";
import { LLink } from "./LLink";

const collections = ["necklaces", "rings", "bracelets", "earrings"] as const;

export function Footer({ lang }: { lang: Lang }) {
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
        <StarSparkle className="absolute left-5 top-[38%] size-6 text-white/90" />
        <StarSparkle className="absolute right-5 top-14 size-4 text-white/90" />
        <StarSparkle className="absolute bottom-8 right-6 size-3 text-white/90" />
        <div className="container-site">
          <div className="grid gap-10 border border-white/70 px-6 py-12 md:grid-cols-[1.6fr_1fr_1fr] md:px-[72px]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.logoWhite} alt={site.fullName} className="h-[58px] w-auto" />
              <ul className="mt-8 space-y-3 text-[15px] text-white/90">
                <li className="flex items-center gap-3">
                  <PinIcon className="size-4 shrink-0" />
                  {t.footer.address}
                </li>
                <li>
                  <a href={site.phoneHref} className="flex items-center gap-3 hover:underline">
                    <PhoneIcon className="size-4 shrink-0" />
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 break-all hover:underline">
                    <MailIcon className="size-4 shrink-0" />
                    {site.email}
                  </a>
                </li>
              </ul>
              <div className="mt-8 flex gap-4">
                <a href={site.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-70">
                  <FacebookIcon className="size-5" />
                </a>
                <a href={site.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-70">
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
        <p>GILICH Jewelry House ©2026 | {t.footer.rights}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={site.paymentIcons} alt="Visa, Mastercard, Amex, Apple Pay" className="h-[22px] w-auto" />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-lg font-medium uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-[15px] text-white/90">
        {links.map((l) => (
          <li key={l.href}>
            <LLink href={l.href} className="hover:underline">
              {l.label}
            </LLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
