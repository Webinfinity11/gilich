import { Suspense } from "react";
import { CartNotice } from "@/components/site/CartNotice";
import { LangProvider } from "@/components/site/lang";
import { StoreProvider } from "@/components/site/store";
import { landingPath } from "@/lib/landing-path";
import { getLandingProducts, getPublishedLanding } from "@/lib/landing";
import { effectivePrice } from "@/lib/catalog";
import { discountPrice } from "@/lib/money";
import { getLandingLanguage } from "@/lib/landing-language";
import "./landing.css";

export default function CampaignLayout({ children, params }: LayoutProps<"/landing/[slug]">) {
  return <Suspense fallback={null}><CampaignProviders params={params}>{children}</CampaignProviders></Suspense>;
}

async function CampaignProviders({ children, params }: LayoutProps<"/landing/[slug]">) {
  const { slug } = await params;
  const [page, lang] = await Promise.all([getPublishedLanding(slug), getLandingLanguage()]);
  const products = page ? await getLandingProducts(page, lang) : [];
  const campaignPrices = page?.discountPercent ? Object.fromEntries(
    products.flatMap((product) => [
      [`${product.id}:0`, discountPrice(effectivePrice(product), page.discountPercent)],
      ...product.variations.map((variation) => [
        `${product.id}:${variation.id}`, discountPrice(effectivePrice(variation), page.discountPercent),
      ]),
    ]),
  ) : undefined;
  const campaignLabels = Object.fromEntries(products.flatMap((product) => [
    [`${product.id}:0`, { name: product.name, variation: null }],
    ...product.variations.map((variation) => [`${product.id}:${variation.id}`, { name: product.name, variation: variation.name }]),
  ]));
  return (
    <LangProvider lang={lang}>
      <StoreProvider key={slug} previousCartScope={page ? `campaign:${slug}` : undefined} campaignPrices={campaignPrices} campaignLabels={campaignLabels}>
        <div className="campaign" lang={lang === "en" ? "en" : "ka"}>
          {children}
          <CartNotice cartHref={`${landingPath(slug)}/cart`} />
        </div>
      </StoreProvider>
    </LangProvider>
  );
}
