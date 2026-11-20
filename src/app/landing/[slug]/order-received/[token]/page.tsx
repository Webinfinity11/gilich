import { Suspense } from "react";
import { CampaignCheckoutPage } from "@/components/landing/CampaignCheckoutPage";
import { OrderReceipt } from "@/components/site/OrderReceipt";
import { getDict } from "@/lib/i18n";

export const metadata = { title: getDict("ka-ge").order.received, robots: { index: false } };

export default function CampaignOrderReceived({ params }: { params: Promise<{ slug: string; token: string }> }) {
  return (
    <Suspense>
      <CampaignCheckoutPage params={params} step="receipt">
        {(href) => <CampaignReceipt params={params} href={href} />}
      </CampaignCheckoutPage>
    </Suspense>
  );
}

async function CampaignReceipt({ params, href }: { params: Promise<{ token: string }>; href: string }) {
  const { token } = await params;
  return <OrderReceipt token={token} lang="ka-ge" campaignHref={href} />;
}
