"use client";

import { useActionState, useEffect, useState } from "react";
import { subscribe } from "@/app/actions";
import { CloseIcon } from "./icons";
import { useI18n } from "./lang";

const HIDE_KEY = "gilich-newsletter-hidden";

export function NewsletterPopup() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const [state, action, pending] = useActionState(subscribe, null);

  useEffect(() => {
    let hidden = false;
    try {
      hidden = localStorage.getItem(HIDE_KEY) === "1" || sessionStorage.getItem(HIDE_KEY) === "1";
    } catch {}
    if (hidden) return;
    const t = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    try {
      sessionStorage.setItem(HIDE_KEY, "1");
      if (dontShow || state?.ok) localStorage.setItem(HIDE_KEY, "1");
    } catch {}
    setOpen(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={close} />
      <div role="dialog" aria-modal="true" aria-labelledby="newsletter-title" className="relative grid w-full max-w-[760px] bg-white animate-fade-up md:grid-cols-[353px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/popup-newsletter.jpg" alt="" className="hidden h-full w-full object-cover md:block" />
        <div className="flex flex-col justify-center p-8 md:p-10">
          <button type="button" aria-label={t.header.closeMenu} onClick={close} className="absolute right-4 top-4 text-muted hover:text-ink">
            <CloseIcon className="size-5" />
          </button>
          <h3 id="newsletter-title" className="text-[28px] leading-tight text-ink">
            {t.newsletter.title}
          </h3>
          <p className="mt-3 text-sm text-muted">{t.newsletter.text}</p>
          {state?.ok ? (
            <p className="mt-6 text-[15px] text-ink">{state.message}</p>
          ) : (
            <form action={action} className="mt-6 space-y-3">
              <input type="hidden" name="lang" value={lang} />
              <input type="email" name="email" required placeholder={t.newsletter.placeholder} className="input" />
              {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
              <button type="submit" disabled={pending} className="btn-dark w-full">
                {pending ? "..." : t.newsletter.subscribe}
              </button>
            </form>
          )}
          <label className="mt-5 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
            {t.newsletter.dontShow}
          </label>
        </div>
      </div>
    </div>
  );
}
