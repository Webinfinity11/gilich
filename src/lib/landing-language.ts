import { cache } from "react";
import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export const LANDING_LANGUAGE_COOKIE = "gilich_campaign_language";

export const getLandingLanguage = cache(async (): Promise<Lang> =>
  (await cookies()).get(LANDING_LANGUAGE_COOKIE)?.value === "ka-ge" ? "ka-ge" : "en",
);
