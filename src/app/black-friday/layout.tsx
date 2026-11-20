import LandingLayout from "@/app/landing/layout";
import CampaignLayout from "@/app/landing/[slug]/layout";
import { blackFridayParams } from "@/lib/landing-path";

export default function BlackFridayLayout({ children }: { children: React.ReactNode }) {
  return (
    <LandingLayout>
      <CampaignLayout params={blackFridayParams}>{children}</CampaignLayout>
    </LandingLayout>
  );
}
