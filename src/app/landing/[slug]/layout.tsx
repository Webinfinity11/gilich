import { Suspense } from "react";
import { CartNotice } from "@/components/site/CartNotice";
import { LangProvider } from "@/components/site/lang";
import { StoreProvider } from "@/components/site/store";
import { landingPath } from "@/lib/landing-path";
import { getLandingProducts, getPublishedLanding } from "@/lib/landing";
import { effectivePrice } from "@/lib/catalog";
import { discountPrice } from "@/lib/money";
import "./landing.css";

export default function CampaignLayout({ children, params }: LayoutProps<"/landing/[slug]">) {
  return <Suspense fallback={null}><CampaignProviders params={params}>{children}</CampaignProviders></Suspense>;
}

async function CampaignProviders({ children, params }: LayoutProps<"/landing/[slug]">) {
  const { slug } = await params;
  const page = await getPublishedLanding(slug);
  const campaignPrices = page?.discountPercent ? Object.fromEntries(
    (await getLandingProducts(page)).flatMap((product) => [
      [`${product.id}:0`, discountPrice(effectivePrice(product), page.discountPercent)],
      ...product.variations.map((variation) => [
        `${product.id}:${variation.id}`, discountPrice(effectivePrice(variation), page.discountPercent),
      ]),
    ]),
  ) : undefined;
  return (
    <LangProvider lang="ka-ge">
      <StoreProvider key={slug} previousCartScope={page ? `campaign:${slug}` : undefined} campaignPrices={campaignPrices}>
        <div className="campaign">{children}</div>
        <CartNotice cartHref={`${landingPath(slug)}/cart`} />
      </StoreProvider>
    </LangProvider>
  );
}
