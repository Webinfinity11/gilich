"use client";

import Link from "next/link";
import { useI18n } from "@/components/site/lang";
import { useStore } from "@/components/site/store";

export function CampaignCartLink({ href }: { href: string }) {
  const { cartCount } = useStore();
  const { t } = useI18n();
  return <Link href={href} className="campaign-header-button">{t.cart.title} ({cartCount})</Link>;
}
