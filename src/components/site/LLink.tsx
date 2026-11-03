"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useI18n } from "./lang";

/** next/link that prefixes internal paths with the current language (/ka-ge/...) */
export function LLink({ href, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const { lp } = useI18n();
  return <Link href={href.startsWith("/") ? lp(href) : href} {...props} />;
}
