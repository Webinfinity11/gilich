"use client";

import { createContext, useContext } from "react";
import type { SiteInfo } from "@/lib/settings";

const SiteInfoContext = createContext<SiteInfo | null>(null);

/** Makes the admin-editable site settings available to client components */
export function SiteInfoProvider({ info, children }: { info: SiteInfo; children: React.ReactNode }) {
  return <SiteInfoContext.Provider value={info}>{children}</SiteInfoContext.Provider>;
}

export function useSiteInfo() {
  const info = useContext(SiteInfoContext);
  if (!info) throw new Error("useSiteInfo must be used inside SiteInfoProvider");
  return info;
}
