"use client";

import { formatPrice } from "@/lib/money";
import { CloseIcon } from "./icons";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";
import { useStore } from "./store";

export function WishlistView() {
  const { wishlist, ready, toggleWishlist } = useStore();
  const { t } = useI18n();
  if (!ready) return <div className="min-h-[300px]" />;

  return (
    <div className="container-site py-12 md:py-[60px]">
      {wishlist.length === 0 ? (
        <div className="text-center">
          <p className="text-ink">{t.wishlist.empty}</p>
          <Link href="/shop" className="btn-dark mt-6">
            {t.common.returnToShop}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {wishlist.map((w) => (
            <li key={w.productId} className="flex items-center gap-5 py-5">
              <button type="button" aria-label={`${t.common.remove}: ${w.name}`} onClick={() => toggleWishlist(w)} className="text-muted hover:text-ink">
                <CloseIcon className="size-5" />
              </button>
              {w.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.image} alt="" className="size-20 border border-line object-cover" />
              )}
              <Link href={`/product/${w.slug}`} className="flex-1 text-ink hover:underline">
                {w.name}
              </Link>
              <span className="hidden sm:block">
                {formatPrice(w.price)}
              </span>
              <Link href={`/product/${w.slug}`} className="btn-dark !px-5 !py-3 !text-[13px]">
                {t.common.viewProduct}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
