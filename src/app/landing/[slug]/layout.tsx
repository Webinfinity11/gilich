import { Suspense } from "react";
import { CartNotice } from "@/components/site/CartNotice";
import { LangProvider } from "@/components/site/lang";
import { StoreProvider } from "@/components/site/store";
import { landingPath } from "@/lib/landing-path";
import "./landing.css";

export default function CampaignLayout({ children, params }: LayoutProps<"/landing/[slug]">) {
  return <Suspense fallback={null}><CampaignProviders params={params}>{children}</CampaignProviders></Suspense>;
}

async function CampaignProviders({ children, params }: LayoutProps<"/landing/[slug]">) {
  const { slug } = await params;
  return (
    <LangProvider lang="ka-ge">
      <StoreProvider key={slug} scope={`campaign:${slug}`}>
        <div className="campaign">{children}</div>
        <CartNotice cartHref={`${landingPath(slug)}/cart`} />
      </StoreProvider>
    </LangProvider>
  );
}
