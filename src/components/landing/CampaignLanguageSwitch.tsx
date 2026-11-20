"use client";

import { useTransition } from "react";
import { setLandingLanguage } from "@/app/landing/language-action";
import { useI18n } from "@/components/site/lang";

export function CampaignLanguageSwitch() {
  const { lang } = useI18n();
  const [pending, start] = useTransition();

  return (
    <div role="group" aria-label={lang === "en" ? "Language" : "ენა"} className="flex shrink-0 items-center gap-1 text-xs">
      {([["en", "EN", "English"], ["ka-ge", "KA", "ქართული"]] as const).map(([value, label, name]) => (
        <button key={value} type="button" lang={value === "en" ? "en" : "ka"} aria-label={name} aria-pressed={lang === value}
          disabled={pending || lang === value} className="min-h-8 px-1 aria-pressed:font-semibold aria-pressed:underline"
          onClick={() => start(() => setLandingLanguage(value))}>{label}</button>
      ))}
    </div>
  );
}
