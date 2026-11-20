import CampaignOrderReceived, { metadata as receiptMetadata } from "@/app/landing/[slug]/order-received/[token]/page";
import { blackFridayParams } from "@/lib/landing-path";

export const metadata = receiptMetadata;

export default function BlackFridayOrderReceived({ params }: PageProps<"/black-friday/order-received/[token]">) {
  const campaignParams = Promise.all([blackFridayParams, params]).then(([campaign, receipt]) => ({ ...campaign, ...receipt }));
  return <CampaignOrderReceived params={campaignParams} />;
}
