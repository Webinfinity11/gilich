"use client";

import type { ProductCard } from "@/lib/catalog";
import { HeartIcon } from "./icons";
import { useI18n } from "./lang";
import { useStore } from "./store";

export function WishlistButton({
  product,
  className = "",
  label,
}: {
  product: Pick<ProductCard, "id" | "slug" | "name" | "images" | "minPrice" | "maxPrice">;
  className?: string;
  label?: boolean;
}) {
  const { toggleWishlist, inWishlist } = useStore();
  const { t } = useI18n();
  const active = inWishlist(product.id);
  const text = active ? t.product.removeFromWishlist : t.product.addToWishlist;
  return (
    <button
      type="button"
      aria-label={text}
      aria-pressed={active}
      className={className}
      onClick={() =>
        toggleWishlist({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0] ?? null,
          price: product.minPrice,
          maxPrice: product.maxPrice,
        })
      }
    >
      <HeartIcon className="size-5" filled={active} />
      {label && <span className="text-sm">{text}</span>}
    </button>
  );
}
