import CampaignCart, { metadata as cartMetadata } from "@/app/landing/[slug]/cart/page";
import { blackFridayParams } from "@/lib/landing-path";

export const metadata = cartMetadata;

export default function BlackFridayCart() {
  return <CampaignCart params={blackFridayParams} />;
}
