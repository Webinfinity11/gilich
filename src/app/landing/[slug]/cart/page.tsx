import { Suspense } from "react";
import { CampaignCheckoutPage } from "@/components/landing/CampaignCheckoutPage";
import { CartView } from "@/components/site/CartView";
import { getDict } from "@/lib/i18n";

export const metadata = { title: getDict("en").cart.title, robots: { index: false } };

export default function CampaignCart({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <CampaignCheckoutPage params={params} step="cart">
        {(href) => <CartView campaignHref={href} />}
      </CampaignCheckoutPage>
    </Suspense>
  );
}
