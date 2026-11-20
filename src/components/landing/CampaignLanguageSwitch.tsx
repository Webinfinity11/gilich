"use client";

import { useTransition } from "react";
import { setLandingLanguage } from "@/app/landing/language-action";
import { LangSwitcher } from "@/components/site/LangSwitcher";

export function CampaignLanguageSwitch() {
  const [pending, start] = useTransition();
  return <LangSwitcher align="end" pending={pending} onSelect={(lang) => start(() => setLandingLanguage(lang))} />;
}
