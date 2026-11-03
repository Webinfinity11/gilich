"use client";

import { useEffect } from "react";
import { CloseIcon } from "./icons";
import { useI18n } from "./lang";
import { LLink } from "./LLink";
import { useStore } from "./store";

/** Toast shown after adding to cart, like the original "Product was successfully added" popup */
export function CartNotice() {
  const { notice, dismissNotice } = useStore();
  const { t } = useI18n();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(dismissNotice, 5000);
    return () => clearTimeout(t);
  }, [notice, dismissNotice]);

  if (!notice) return null;
  return (
    <div role="status" className="fixed bottom-6 right-4 z-50 w-[min(360px,calc(100vw-32px))] border border-line bg-white p-5 shadow-2xl animate-fade-up">
      <button type="button" aria-label={t.header.closeMenu} onClick={dismissNotice} className="absolute right-3 top-3 text-muted hover:text-ink">
        <CloseIcon className="size-4" />
      </button>
      <p className="pr-6 text-[15px]">
        <strong className="font-medium">{notice}</strong> {t.notice.added}
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={dismissNotice} className="btn-light flex-1 border border-ink !py-2.5 !text-[13px]">
          {t.common.continue}
        </button>
        <LLink href="/cart" onClick={dismissNotice} className="btn-dark flex-1 !py-2.5 !text-[13px]">
          {t.common.viewCart}
        </LLink>
      </div>
    </div>
  );
}
