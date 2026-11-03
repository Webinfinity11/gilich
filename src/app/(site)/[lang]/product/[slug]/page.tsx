import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Carousel } from "@/components/site/Carousel";
import { LLink as Link } from "@/components/site/LLink";
import { PageBanner } from "@/components/site/PageBanner";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductPurchase } from "@/components/site/ProductPurchase";
import { SectionTitle } from "@/components/site/SectionTitle";
import { getProduct, getProducts } from "@/lib/catalog";
import { getDict, LANGS, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const products = await getProducts("en");
  return LANGS.flatMap((lang) => products.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { slug, lang } = await params;
  const product = await getProduct(slug, lang as Lang);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.shortDescription ?? undefined,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { slug, lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  const product = await getProduct(slug, lang);
  if (!product) notFound();

  const all = await getProducts(lang);
  const related = all.filter((p) => p.id !== product.id);
  // Breadcrumb: primary category, plus a child category of it when present (e.g. Rings > Vintage)
  const primary = product.category;
  const child = product.categories.find((c) => c.parent && c.parent.slug === primary?.slug);

  return (
    <>
      <PageBanner
        title={t.product.title}
        crumbs={[
          ...(primary ? [{ label: primary.name, href: `/product-category/${primary.slug}` }] : []),
          ...(child ? [{ label: child.name, href: `/product-category/${child.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <section className="container-site py-12 md:py-[60px]">
        <ProductPurchase product={product}>
          <div className="mt-6 border-t border-line pt-6 text-sm text-ink">
            <p className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6}>
                <path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" strokeLinejoin="round" />
                <circle cx="6" cy="17.5" r="1.8" />
                <circle cx="17" cy="17.5" r="1.8" />
              </svg>
              {t.product.freeDelivery}
            </p>
            {product.sku && <p className="mt-3 text-muted">SKU: {product.sku}</p>}
            <p className="mt-3 text-muted">
              {t.product.categories}:{" "}
              {product.categories.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ", "}
                  <Link href={`/product-category/${c.slug}`} className="text-ink hover:underline">
                    {c.name}
                  </Link>
                </span>
              ))}
            </p>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.paymentIcons} alt="Visa, Mastercard, Amex, Apple Pay" className="h-[22px] w-auto" />
            <p className="mt-3 text-sm text-ink">{t.product.cardDiscount}</p>
          </div>
        </ProductPurchase>

        <div className="mt-16">
          <div className="flex gap-8 border-b border-line">
            <span className="-mb-px border-b-2 border-ink pb-2 text-lg uppercase text-ink">{product.description ? t.product.description : t.product.reviews}</span>
          </div>
          {product.description ? (
            <div className="prose-site mt-6 max-w-none whitespace-pre-line text-[15px] leading-relaxed text-muted">{product.description}</div>
          ) : (
            <div className="mt-6">
              <p className="text-muted">
                <span className="tracking-[3px] text-[#d0d0d0]">★★★★★</span> {t.product.customerReviews}
              </p>
              <p className="mt-6 text-ink">{t.product.reviewsTitle}</p>
              <p className="mt-2 text-muted">{t.product.noReviews}</p>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-site pb-16 md:pb-[90px]">
          <Carousel header={<SectionTitle>{t.product.related}</SectionTitle>} itemClassName="basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-96px)/5)]">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Carousel>
        </section>
      )}
    </>
  );
}
