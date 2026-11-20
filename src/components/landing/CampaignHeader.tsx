/* eslint-disable @next/next/no-img-element -- Campaign logos can come from admin uploads. */
import Link from "next/link";
import { getSiteInfo } from "@/lib/settings";
import { CampaignCartLink } from "./CampaignCartLink";
import { CampaignLanguageSwitch } from "./CampaignLanguageSwitch";
import { getLandingLanguage } from "@/lib/landing-language";

export async function CampaignHeader({ href, logo, collectionButton, showCart = false }: {
  href: string; logo: string; collectionButton?: string; showCart?: boolean;
}) {
  const image = logo || (await getSiteInfo(await getLandingLanguage())).logo;
  return (
    <header className="campaign-header">
      <div className="campaign-wrap campaign-header-inner">
        <div className="min-w-0 justify-self-start">
          {collectionButton && <a className="campaign-header-button" href="#products">{collectionButton}</a>}
        </div>
        <Link href={href} className="justify-self-center"><img className="campaign-logo" src={image} alt="Gilich Jewelry House" /></Link>
        <div className="flex items-center justify-self-end">
          <CampaignLanguageSwitch />
          {showCart && <CampaignCartLink href={`${href}/cart`} />}
        </div>
      </div>
    </header>
  );
}
