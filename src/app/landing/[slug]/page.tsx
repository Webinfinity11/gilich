/* eslint-disable @next/next/no-img-element -- Campaign images can come from admin uploads. */
import { Fragment, Suspense, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader } from "@/components/landing/CampaignHeader";
import { CampaignProducts } from "@/components/landing/CampaignProducts";
import { HeroSlider } from "@/components/site/HeroSlider";
import { defaultHero } from "@/lib/content";
import { getLandingProducts, getPublishedLanding, landingDefaults } from "@/lib/landing";
import { getLandingLanguage } from "@/lib/landing-language";
import { landingEnglishDefaults, localizedLandingCopy, slideEnglishDefaults } from "@/lib/landing-copy";
import { landingPath } from "@/lib/landing-path";
import { getSiteInfo } from "@/lib/settings";
import type { LandingSection } from "@/lib/landing-design";

export default function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="campaign" />}><LandingContent params={params} /></Suspense>;
}

async function LandingContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, lang] = await Promise.all([getPublishedLanding(slug), getLandingLanguage()]);
  if (!page) notFound();

  const [products, info] = await Promise.all([getLandingProducts(page, lang), getSiteInfo(lang)]);
  const copy = lang === "en" ? localizedLandingCopy<typeof landingEnglishDefaults>(page.english, page, landingDefaults, landingEnglishDefaults) : page;
  const { design } = page;
  const showProducts = products.length > 0 && !design.hidden.includes("products");
  const slides = page.heroSlides.map((slide) => {
    const text = lang === "en" ? localizedLandingCopy<typeof slideEnglishDefaults>(slide.english ?? {}, slide, landingDefaults.heroSlides[0], slideEnglishDefaults) : slide;
    return { ...text, image: slide.image || defaultHero[0].image, link: showProducts && text.button ? "#products" : "" };
  });
  const logo = page.logo || info.logo;
  const href = landingPath(slug);
  const homeLabel = lang === "en" ? "Gilich Jewelry House — campaign home" : "Gilich Jewelry House — მთავარი გვერდი";
  const theme = Object.fromEntries(Object.entries(design.theme).map(([name, color]) => [`--campaign-${name}`, color])) as CSSProperties;
  const blocks: Record<LandingSection, ReactNode> = {
    hero: <HeroSlider slides={slides} appearance={design} />,
    products: showProducts && (
      <section id="products" className="campaign-products campaign-wrap">
        <div className="campaign-section-heading">
          <h2>{copy.productsTitle}</h2>
        </div>
        <CampaignProducts products={products} discountPercent={page.discountPercent} />
      </section>
    ),
    about: (page.aboutImage || copy.aboutTitle || copy.aboutText) && (
      <section className={`campaign-about ${page.aboutImage ? `campaign-about-image-${design.aboutImageSide}` : "campaign-text-only"}`}>
        {page.aboutImage && <div className="campaign-about-image"><img src={page.aboutImage} alt="" loading="lazy" /></div>}
        <div className="campaign-about-copy">
          {copy.aboutTitle && <h2>{copy.aboutTitle}</h2>}
          {copy.aboutText && <p>{copy.aboutText}</p>}
        </div>
      </section>
    ),
  };

  return (
    <div className="campaign-design" style={theme}>
      {copy.announcement && <div className="campaign-announcement">{copy.announcement}</div>}
      <CampaignHeader href={href} logo={logo} collectionButton={showProducts ? copy.headerButton : undefined} showCart />
      <main>
        {design.sections.filter((section) => !design.hidden.includes(section)).map((section) => (
          <Fragment key={section}>{blocks[section]}</Fragment>
        ))}
      </main>
      <footer className="campaign-footer">
        <div className="campaign-wrap campaign-footer-inner">
          <Link href={href} aria-label={homeLabel} className="campaign-footer-logo">
            <img src={info.logoWhite || logo} alt="Gilich Jewelry House" />
          </Link>
          {copy.footerText && <p className="campaign-footer-text">{copy.footerText}</p>}
          {(page.footerPhone || page.footerEmail) && (
            <div className="campaign-contacts">
              {page.footerPhone && <a href={`tel:${page.footerPhone.replace(/[^+0-9]/g, "")}`}>{page.footerPhone}</a>}
              {page.footerEmail && <a href={`mailto:${page.footerEmail}`}>{page.footerEmail}</a>}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
