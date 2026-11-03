"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LANG, getDict, localePath, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

/** Current language, its dictionary and a localized-link helper for client components */
export function useI18n() {
  const lang = useContext(LangContext);
  return { lang, t: getDict(lang), lp: (path: string) => localePath(lang, path) };
}
