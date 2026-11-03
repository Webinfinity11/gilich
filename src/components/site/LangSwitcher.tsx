"use client";

import { useEffect, useId, useRef, useState } from "react";
import { localePath, type Lang } from "@/lib/i18n";
import { ChevronRight } from "./icons";
import { useI18n } from "./lang";

const FLAGS: Record<Lang, string> = { en: "/media/ICON-1.png", "ka-ge": "/media/flag-ge.svg" };
const CODES: Record<Lang, string> = { en: "EN", "ka-ge": "KA" };

/** Animated language dropdown. `current` is the page path without the language prefix. */
export function LangSwitcher({ current, align = "center" }: { current: string; align?: "center" | "start" }) {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options: { lang: Lang; label: string }[] = [
    { lang: "en", label: t.lang.en },
    { lang: "ka-ge", label: t.lang.ka },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2 py-1 text-[13px] font-medium uppercase tracking-wide text-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FLAGS[lang]} alt="" className="h-3 w-[18px] object-cover" />
        {CODES[lang]}
        <ChevronRight className={`size-3.5 transition-transform duration-300 ${open ? "-rotate-90" : "rotate-90"}`} />
      </button>

      <ul
        id={menuId}
        role="menu"
        className={`absolute top-full z-50 mt-3 min-w-[160px] origin-top border border-line bg-white py-1.5 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.3)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        } ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-95 opacity-0"}`}
      >
        {options.map((o, i) => {
          const active = o.lang === lang;
          return (
            <li key={o.lang} role="none">
              {/* Plain <a>: switching language swaps <html lang>, so it needs a full page load */}
              <a
                role="menuitem"
                href={localePath(o.lang, current)}
                hrefLang={o.lang === "ka-ge" ? "ka" : "en"}
                aria-current={active ? "true" : undefined}
                tabIndex={open ? 0 : -1}
                style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition duration-300 hover:bg-panel ${
                  open ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"
                } ${active ? "font-medium text-ink" : "text-[#555] hover:text-ink"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FLAGS[o.lang]} alt="" className="h-3 w-[18px] object-cover" />
                <span className="flex-1">{o.label}</span>
                {active && <span className="size-1.5 rounded-full bg-ink" />}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
