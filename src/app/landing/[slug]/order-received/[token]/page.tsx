import { Suspense } from "react";
import { CampaignCheckoutPage } from "@/components/landing/CampaignCheckoutPage";
import { OrderReceipt } from "@/components/site/OrderReceipt";
import type { Lang } from "@/lib/i18n";

export const metadata = { title: "Order received", robots: { index: false } };

export default function CampaignOrderReceived({ params }: { params: Promise<{ slug: string; token: string }> }) {
  return (
    <Suspense>
      <CampaignCheckoutPage params={params} step="receipt">
        {(href, _slug, lang) => <CampaignReceipt params={params} href={href} lang={lang} />}
      </CampaignCheckoutPage>
    </Suspense>
  );
}

async function CampaignReceipt({ params, href, lang }: { params: Promise<{ token: string }>; href: string; lang: Lang }) {
  const { token } = await params;
  return <OrderReceipt token={token} lang={lang} campaignHref={href} />;
}
