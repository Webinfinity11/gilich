"use client";

import Link from "next/link";
import { useI18n } from "@/components/site/lang";
import { useStore } from "@/components/site/store";
import { CartIcon } from "@/components/site/icons";

export function CampaignCartLink({ href }: { href: string }) {
  const { cartCount } = useStore();
  const { t } = useI18n();
  return (
    <Link href={href} aria-label={`${t.cart.title} (${cartCount})`} className="relative flex size-11 items-center justify-center">
      <CartIcon className="size-[26px]" />
      <span aria-hidden="true" className="absolute right-0 top-0 min-w-[18px] rounded-full bg-ink px-1 text-center text-[10px] leading-[18px] text-white">{cartCount}</span>
    </Link>
  );
}
