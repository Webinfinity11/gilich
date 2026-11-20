"use server";

import { cookies } from "next/headers";
import { isLang } from "@/lib/i18n";
import { LANDING_LANGUAGE_COOKIE } from "@/lib/landing-language";

export async function setLandingLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANDING_LANGUAGE_COOKIE, lang, {
    path: "/", sameSite: "lax", httpOnly: true, maxAge: 60 * 60 * 24 * 365,
  });
}
