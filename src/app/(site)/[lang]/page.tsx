import { Carousel } from "@/components/site/Carousel";
import { ContactForm } from "@/components/site/ContactForm";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ArrowRight } from "@/components/site/icons";
import { LLink as Link } from "@/components/site/LLink";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductTabs } from "@/components/site/ProductTabs";
import { SectionTitle } from "@/components/site/SectionTitle";
import { getBestSellers, getCategories, getProducts, sortProducts } from "@/lib/catalog";
import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

const homeCategorySlugs = ["rings", "necklaces", "bracelets", "earrings"];

const collections = [
  { slug: "rings", image: "/media/633781454_17941831728118951_5997584585663379274_n.webp", h: "h-[300px] md:h-[420px]" },
  { slug: "glider-bracelets", image: "/media/589681429_17930981475118951_9187648351614648905_n-1.jpg", h: "h-[300px] md:h-[300px]" },
  { slug: "engagement", image: "/media/641475971_17943979362118951_5361477598383403789_n.webp", h: "h-[300px] md:h-[420px]" },
  { slug: "accessories", image: "/media/587286966_17929803777118951_391197528994778960_n.webp", h: "h-[300px] md:h-[294px]" },
  { slug: "studs", image: "/media/571592260_17926423152118951_5258874569052686446_n-1.jpg", h: "h-[300px] md:h-[414px]" },
  { slug: "wedding-bands", image: "/media/587016293_17932054713118951_7162476005179749059_n-1.webp", h: "h-[300px] md:h-[294px]" },
];

const instagram = [
  "/media/587814663_17930155281118951_8275402413673887215_n.webp",
  "/media/587815702_17929803747118951_200195746231836515_n.webp",
  "/media/568210375_17925388059118951_181341913184314875_n.webp",
  "/media/556862574_17923113597118951_616950372909581066_n.webp",
];

const serviceIcons = ["/media/h1-icon.png", "/media/h1-icon2.png", "/media/h1-icon3.png", "/media/h1-icon4.png"];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  const [products, categories, bestSellers] = await Promise.all([getProducts(lang), getCategories(lang), getBestSellers(lang)]);
  const h = t.home;
  const catName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
  const homeCategories = homeCategorySlugs.map((s) => categories.find((c) => c.slug === s)).filter((c) => !!c);
  const byDefault = sortProducts(products, "default");
  const featured = products.filter((p) => p.featured);
  const cards = (list: typeof products) => list.map((p) => <ProductCard key={p.id} product={p} />);

  return (
    <>
      <HeroSlider />

      {/* Categories */}
      <section className="container-site pt-16 md:pt-[90px]">
        <Carousel
          header={<SectionTitle>{h.categories}</SectionTitle>}
          itemClassName="basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]"
        >
          {homeCategories.map((c) => (
            <Link
              key={c.id}
              href={`/product-category/${c.slug}`}
              className="card-lift group flex h-full flex-col overflow-hidden border border-line bg-white"
            >
              <div className="relative aspect-square overflow-hidden">
                {c.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 size-full object-contain p-8 transition duration-700 group-hover:-translate-y-1 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="border-t border-line px-6 py-5">
                <h3 className="text-xl uppercase text-ink"><span className="link-draw">{c.name}</span></h3>
                <p className="text-sm text-muted">
                  {c.count} {t.common.products}
                </p>
              </div>
            </Link>
          ))}
        </Carousel>
      </section>

      {/* About */}
      <section className="mt-10 grid md:mt-[60px] lg:grid-cols-[1.6fr_1fr]">
        <div data-reveal="clip" className="overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/615269630_17935383756118951_7701057904552410564_n.webp" alt="" className="reveal-img h-[320px] w-full object-cover md:h-[520px]" />
        </div>
        <div data-reveal="right" style={{ "--d": "250ms" } as React.CSSProperties} className="flex flex-col justify-center bg-panel px-6 py-12 md:px-[30px] lg:pr-[10%]">
          <h2 className="text-[30px] text-ink md:text-[34px]">{h.aboutTitle}</h2>
          <p className="mt-6 text-[15px] leading-relaxed text-muted">
            {h.aboutText[0]}
            <br />
            {h.aboutText[1]}
          </p>
          <Link href="/about-page" className="btn-dark mt-8 self-start">
            {t.common.readMore} <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Our products */}
      <section className="container-site grid gap-10 py-16 md:py-[90px] lg:grid-cols-[220px_1fr] lg:gap-[60px]">
        <div data-reveal="left" className="flex flex-col justify-center">
          <h2 className="text-[30px] uppercase text-ink md:text-[34px]">{h.ourProducts}</h2>
          <Link href="/shop" className="btn-dark mt-8 self-start">
            {t.common.shopNow} <ArrowRight className="size-4" />
          </Link>
        </div>
        <ProductTabs
          tabs={[
            { label: h.tabs[0], items: cards(products) },
            { label: h.tabs[1], items: cards(featured) },
            { label: h.tabs[2], items: cards(bestSellers) },
          ]}
        />
      </section>

      {/* Collections */}
      <section className="container-site">
        <SectionTitle className="mb-10">{h.collections}</SectionTitle>
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col} className="flex flex-col gap-5">
              {[collections[col], collections[col + 3]].map((c, row) => (
                <Link
                  key={c.slug}
                  href={`/product-category/${c.slug}`}
                  data-reveal="up"
                  style={{ "--d": `${col * 120 + row * 200}ms` } as React.CSSProperties}
                  className={`group relative block overflow-hidden ${c.h}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={catName(c.slug)} className="absolute inset-0 size-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110" />
                  <span className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/15" />
                  <span className="absolute inset-x-5 bottom-5 bg-white/85 py-5 text-center text-xl tracking-wide text-ink backdrop-blur-sm transition-all duration-500 group-hover:bottom-7 group-hover:bg-white group-hover:tracking-widest">{catName(c.slug)}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="container-site py-16 md:py-[90px]">
        <Carousel header={<SectionTitle>{h.newArrivals}</SectionTitle>}>
          {[
            <PromoTile key="promo" image="/media/553690898_17922447624118951_6549962314901708392_n.webp" title={h.newArrivalsPromo} label={t.common.shopNow} />,
            ...cards(sortProducts(products, "latest")),
          ]}
        </Carousel>
      </section>

      {/* Diamonds banner */}
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url(/media/black-marble-patterned-texture-background-marble-thailand-abstract-natural-marble-black-white-design.webp)" }}>
        <div className="absolute inset-0 bg-[#a9a9a9]/90" />
        <div className="container-site relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-[70px]">
          <div data-reveal="left" className="text-white">
            <p className="text-xl">{h.diamondsEyebrow}</p>
            <h2 className="mt-3 text-[30px] leading-snug md:text-[38px]">
              {h.diamondsTitle[0]}
              <br />
              {h.diamondsTitle[1]}
              <br />
              {h.diamondsTitle[2]}
            </h2>
            <p className="mt-4 text-sm">{h.diamondsText}</p>
            <Link href="/shop" className="btn-light mt-8 !text-sm !text-muted hover:!text-white">
              {t.common.shopNow}
            </Link>
          </div>
          <div data-reveal="zoom" style={{ "--d": "200ms" } as React.CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/media/485415831_17899433139118951_322728554133473953_n.webp" alt="Engagement ring" className="animate-float mx-auto w-full max-w-[460px] mix-blend-luminosity" />
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="container-site py-16 md:py-[90px]">
        <Carousel header={<SectionTitle>{h.popular}</SectionTitle>}>
          {[
            <PromoTile key="promo" image="/media/587814663_17930155281118951_8275402413673887215_n.webp" title={h.popularPromo} label={t.common.shopNow} />,
            ...cards(byDefault),
          ]}
        </Carousel>
      </section>

      {/* Showroom */}
      <section className="container-site grid items-center gap-10 pb-16 md:pb-[90px] lg:grid-cols-[1fr_1.4fr] lg:gap-[120px]">
        <div>
          <SectionTitle>{h.showroom}</SectionTitle>
          <p data-reveal="up" className="mt-10 text-[15px] leading-relaxed text-muted">{h.showroomText}</p>
          <Link href="/about-page" className="btn-dark mt-8">
            {t.common.readMore}
          </Link>
        </div>
        <video data-reveal="clip" className="aspect-[472/371] w-full bg-black object-cover" src="/media/showroom.mp4" autoPlay muted loop playsInline preload="metadata" />
      </section>

      {/* Questions */}
      <section className="grid items-center gap-10 pb-16 md:pb-[90px] lg:grid-cols-[1fr_1.1fr]">
        <div data-reveal="clip" className="overflow-hidden lg:max-w-[540px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/show.webp" alt="Gilich showroom" className="reveal-img h-[320px] w-full object-cover lg:h-[540px]" />
        </div>
        <div data-reveal="up" style={{ "--d": "200ms" } as React.CSSProperties} className="container-site lg:!pl-0">
          <h2 className="text-[38px] font-medium uppercase leading-[1.05] text-ink md:text-[52px]">
            {h.questions[0]}
            <br />
            {h.questions[1]}
          </h2>
          <p className="mb-8 mt-2 text-muted">{h.contactUs}</p>
          <ContactForm withSubject />
        </div>
      </section>

      {/* Instagram */}
      <section className="relative bg-cover bg-center py-16 md:py-[60px]" style={{ backgroundImage: "url(/media/h2-bg-insta.jpg)" }}>
        <div className="container-site">
          <Carousel
            header={
              <a href={site.instagram} target="_blank" rel="noreferrer">
                <SectionTitle>{h.instagram}</SectionTitle>
              </a>
            }
            itemClassName="basis-[75%] sm:basis-[calc((100%-24px)/2)] lg:basis-[calc((100%-48px)/3)]"
          >
            {instagram.map((src, i) => (
              <a key={src} href={site.instagram} target="_blank" rel="noreferrer" className={`group relative block overflow-hidden ${i % 2 === 1 ? "lg:mt-14" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110" />
                <span className="absolute inset-0 flex translate-y-3 items-center justify-center bg-black/40 text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {site.instagramHandle}
                </span>
              </a>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Services */}
      <section className="container-site grid grid-cols-2 gap-5 py-16 md:py-[70px] lg:grid-cols-4 lg:gap-6">
        {h.services.map((s, i) => (
          <div
            key={s.title}
            data-reveal="up"
            style={{ "--d": `${i * 120}ms` } as React.CSSProperties}
            className="card-lift group border border-line px-4 py-8 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={serviceIcons[i]} alt="" className="mx-auto size-[60px] transition duration-500 group-hover:-translate-y-1.5 group-hover:rotate-6" />
            <h3 className="mt-4 text-[15px] uppercase text-ink">{s.title}</h3>
            <p className="mt-1 text-sm text-muted">{s.text}</p>
            <Link href="/shop" className="mt-4 inline-block border-b border-ink text-sm uppercase text-ink">
              {t.common.shopNow}
            </Link>
          </div>
        ))}
      </section>
    </>
  );
}

function PromoTile({ image, title, label }: { image: string; title: string; label: string }) {
  return (
    <div className="group relative h-full min-h-[380px] overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 size-full object-cover transition duration-[1500ms] ease-out group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute inset-x-5 bottom-6 text-white">
        <h3 className="max-w-[180px] text-xl font-medium leading-tight">{title}</h3>
        <Link href="/shop" className="btn-light mt-4 !px-6 !py-3 !text-sm">
          {label}
        </Link>
      </div>
    </div>
  );
}
