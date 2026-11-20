import { Suspense } from "react";
import { CampaignCheckoutPage } from "@/components/landing/CampaignCheckoutPage";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { getDict } from "@/lib/i18n";

export const metadata = { title: getDict("en").checkout.title, robots: { index: false } };

export default function CampaignCheckout({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense>
      <CampaignCheckoutPage params={params} step="checkout">
        {(href, slug) => <CheckoutForm campaignHref={href} campaignSlug={slug} />}
      </CampaignCheckoutPage>
    </Suspense>
  );
}
