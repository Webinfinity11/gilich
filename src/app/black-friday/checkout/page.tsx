import CampaignCheckout, { metadata as checkoutMetadata } from "@/app/landing/[slug]/checkout/page";
import { blackFridayParams } from "@/lib/landing-path";

export const metadata = checkoutMetadata;

export default function BlackFridayCheckout() {
  return <CampaignCheckout params={blackFridayParams} />;
}
