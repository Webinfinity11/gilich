/* eslint-disable @next/next/no-img-element -- Campaign images can come from admin uploads. */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { listLandings } from "@/lib/landing";
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
  const products = page.productIds.flatMap((id) => { const product = catalog.find((item) => item.id === id); return product ? [product] : []; });
  const logo = page.logo || info.logo;
  return <div className="campaign">
    {page.announcement && <div className="campaign-announcement">{page.announcement}</div>}
    <header className="campaign-header"><div className="campaign-wrap campaign-header-inner"><img className="campaign-logo" src={logo} alt="Gilich Jewelry House" />{page.headerButton && <a className="campaign-header-button" href="#products">{page.headerButton}</a>}</div></header>
    <main><section className="campaign-hero"><div className="campaign-hero-copy"><span className="campaign-eyebrow">{page.heroEyebrow}</span><h1>{page.heroTitle}</h1><p>{page.heroText}</p>{page.heroButton && <a className="campaign-button" href="#products">{page.heroButton} <span>↗</span></a>}</div><div className="campaign-hero-image">{page.heroImage && <img src={page.heroImage} alt="" />}</div></section>
      <section id="products" className="campaign-products campaign-wrap"><div className="campaign-section-heading"><span className="campaign-eyebrow">GILICH JEWELRY HOUSE</span><h2>{page.productsTitle}</h2></div><div className="campaign-grid">{products.map((p) => <article className="campaign-product" key={p.id}><div className="campaign-product-image">{p.images[0] && <img src={p.images[0]} alt={p.name} />}</div><h3>{p.name}</h3><p>{p.hasVariations && p.minPrice !== p.maxPrice ? `${formatPrice(p.minPrice)} – ${formatPrice(p.maxPrice)}` : formatPrice(p.salePrice !== null && p.salePrice < p.price ? p.salePrice : p.price)}</p></article>)}</div></section>
      <section className="campaign-about"><div className="campaign-about-image">{page.aboutImage && <img src={page.aboutImage} alt="" />}</div><div className="campaign-about-copy"><span className="campaign-eyebrow">OUR STORY</span><h2>{page.aboutTitle}</h2><p>{page.aboutText}</p></div></section>
    </main><footer className="campaign-footer"><div className="campaign-wrap campaign-footer-inner"><div><span className="campaign-footer-brand">GILICH</span><p>{page.footerText}</p></div><div className="campaign-contacts">{page.footerPhone && <a href={`tel:${page.footerPhone.replace(/[^+0-9]/g, "")}`}>{page.footerPhone}</a>}{page.footerEmail && <a href={`mailto:${page.footerEmail}`}>{page.footerEmail}</a>}</div></div></footer>
  </div>;
}
