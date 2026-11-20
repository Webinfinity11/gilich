/* eslint-disable @next/next/no-img-element -- Campaign images can come from admin uploads. */
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeroSlider } from "@/components/site/HeroSlider";
import { defaultHero } from "@/lib/content";
import { listLandings } from "@/lib/landing";
import { LANDING_PRODUCT_LIMIT } from "@/lib/landing-limits";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { getSiteInfo } from "@/lib/settings";
import "./landing.css";

export default function LandingPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className="campaign" />}><LandingContent params={params} /></Suspense>;
}

async function LandingContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = (await listLandings()).find((item) => item.slug === slug && item.published);
  if (!page) notFound();

  const [catalog, info] = await Promise.all([getProducts("ka-ge"), getSiteInfo("ka-ge")]);
  const productsById = new Map(catalog.map((product) => [product.id, product]));
  const products = page.productIds.flatMap((id) => productsById.get(id) ?? []).slice(0, LANDING_PRODUCT_LIMIT);
  const slides = page.heroSlides.map((slide) => ({
    ...slide,
    image: slide.image || defaultHero[0].image,
    link: products.length && slide.button ? "#products" : "",
  }));
  const logo = page.logo || info.logo;
  const homeLabel = "Gilich Jewelry House — მთავარი გვერდი";

  return (
    <div className="campaign">
      {page.announcement && <div className="campaign-announcement">{page.announcement}</div>}
      <header className="campaign-header">
        <div className="campaign-wrap campaign-header-inner">
          <Link href="/ka-ge" aria-label={homeLabel}>
            <img className="campaign-logo" src={logo} alt="Gilich Jewelry House" />
          </Link>
          {products.length > 0 && page.headerButton && (
            <a className="campaign-header-button" href="#products">{page.headerButton}</a>
          )}
        </div>
      </header>
      <main>
        <HeroSlider slides={slides} landing />
        {products.length > 0 && (
          <section id="products" className="campaign-products campaign-wrap">
            <div className="campaign-section-heading">
              <h2>{page.productsTitle}</h2>
            </div>
            <div className="campaign-grid">
              {products.map((product) => (
                <article className="campaign-product" key={product.id}>
                  <Link className="campaign-product-link" href={`/ka-ge/product/${encodeURIComponent(product.slug)}`}>
                    <div className="campaign-product-image">
                      {product.images[0] && <img src={product.images[0]} alt="" loading="lazy" />}
                    </div>
                    <h3>{product.name}</h3>
                    <div className="campaign-product-details">
                      <p>{product.hasVariations && product.minPrice !== product.maxPrice
                        ? `${formatPrice(product.minPrice)} – ${formatPrice(product.maxPrice)}`
                        : formatPrice(product.salePrice !== null && product.salePrice < product.price ? product.salePrice : product.price)}</p>
                      <span className="campaign-product-action">შეძენა <span aria-hidden="true">↗</span></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
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
          <Link href="/ka-ge" aria-label={homeLabel} className="campaign-footer-logo">
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
    </div>
  );
}
