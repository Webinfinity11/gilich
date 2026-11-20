/* eslint-disable @next/next/no-img-element -- Campaign images can come from admin uploads. */
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignHeader } from "@/components/landing/CampaignHeader";
import { CampaignProducts } from "@/components/landing/CampaignProducts";
import { HeroSlider } from "@/components/site/HeroSlider";
import { defaultHero } from "@/lib/content";
import { getPublishedLanding } from "@/lib/landing";
import { LANDING_PRODUCT_LIMIT } from "@/lib/landing-limits";
import { landingPath } from "@/lib/landing-path";
import { getProductsByIds } from "@/lib/catalog";
import { getSiteInfo } from "@/lib/settings";

export default function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="campaign" />}><LandingContent params={params} /></Suspense>;
}

async function LandingContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedLanding(slug);
  if (!page) notFound();

  const [catalog, info] = await Promise.all([getProductsByIds(page.productIds, "ka-ge"), getSiteInfo("ka-ge")]);
  const productsById = new Map(catalog.map((product) => [product.id, product]));
  const products = page.productIds.flatMap((id) => productsById.get(id) ?? []).slice(0, LANDING_PRODUCT_LIMIT);
  const slides = page.heroSlides.map((slide) => ({
    ...slide,
    image: slide.image || defaultHero[0].image,
    link: products.length && slide.button ? "#products" : "",
  }));
  const logo = page.logo || info.logo;
  const href = landingPath(slug);
  const homeLabel = "Gilich Jewelry House — მთავარი გვერდი";

  return (
    <>
      {page.announcement && <div className="campaign-announcement">{page.announcement}</div>}
      <CampaignHeader href={href} logo={logo} collectionButton={products.length ? page.headerButton : undefined} showCart />
      <main>
        <HeroSlider slides={slides} landing />
        {products.length > 0 && (
          <section id="products" className="campaign-products campaign-wrap">
            <div className="campaign-section-heading">
              <h2>{page.productsTitle}</h2>
            </div>
            <CampaignProducts products={products} />
          </section>
        )}
        {(page.aboutImage || page.aboutTitle || page.aboutText) && (
          <section className={page.aboutImage ? "campaign-about" : "campaign-about campaign-text-only"}>
            {page.aboutImage && <div className="campaign-about-image"><img src={page.aboutImage} alt="" loading="lazy" /></div>}
            <div className="campaign-about-copy">
              {page.aboutTitle && <h2>{page.aboutTitle}</h2>}
              {page.aboutText && <p>{page.aboutText}</p>}
            </div>
          </section>
        )}
      </main>
      <footer className="campaign-footer">
        <div className="campaign-wrap campaign-footer-inner">
          <Link href={href} aria-label={homeLabel} className="campaign-footer-logo">
            <img src={info.logoWhite || logo} alt="Gilich Jewelry House" />
          </Link>
          {page.footerText && <p className="campaign-footer-text">{page.footerText}</p>}
          {(page.footerPhone || page.footerEmail) && (
            <div className="campaign-contacts">
              {page.footerPhone && <a href={`tel:${page.footerPhone.replace(/[^+0-9]/g, "")}`}>{page.footerPhone}</a>}
              {page.footerEmail && <a href={`mailto:${page.footerEmail}`}>{page.footerEmail}</a>}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
