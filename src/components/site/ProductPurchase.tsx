"use client";

import { useState } from "react";
import type { ProductDetail } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { ShareIcon, WhatsAppIcon } from "./icons";
import { useI18n } from "./lang";
import { PriceTag } from "./ProductCard";
import { useStore } from "./store";
import { WishlistButton } from "./WishlistButton";
import { ZoomImage } from "./ZoomImage";

const featureIcons = ["/media/icon3-product-detail.png", "/media/icon2-product-detail.png", "/media/h1-icon4.png"];

/** Gallery + options + add to cart. Picking a variation switches price and photo. */
export function ProductPurchase({ product, children, onAdded, discountPercent = 0 }: {
  product: ProductDetail; children?: React.ReactNode; onAdded?: () => void; discountPercent?: number;
}) {
  const { addToCart, ready } = useStore();
  const { t } = useI18n();
  const Heading = onAdded ? "h2" : "h1";
  const inStock = (v: { stock: number | null }) => v.stock === null || v.stock > 0;

  // Main product first; a variation applies only when the customer picks one
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const hasVariations = product.variations.length > 0;
  const variation = product.variations.find((v) => v.id === selectedId) ?? null;

  // A picked variation is shown as its own product: its photos only (none = "no photo"), its title and price
  const gallery = variation ? variation.images : product.images;
  const title = variation ? variation.name : product.name;
  const mainImage = gallery[imageIndex] ?? gallery[0];

  const stock = variation ? variation.stock : product.stock;
  // Main product's attributes, overridden by the picked variation's
  const specs = variation ? [...product.specs.filter((s) => !variation.specs.some((x) => x.label === s.label)), ...variation.specs] : product.specs;
  const outOfStock = stock !== null && stock <= 0;

  /** Clicking the picked variation again (or "clear") goes back to the main product */
  const choose = (id: number | null) => {
    setSelectedId((cur) => (cur === id ? null : id));
    setImageIndex(0);
  };

  const add = () => {
    const priced = variation ?? product;
    addToCart(
      {
        productId: product.id,
        variationId: variation?.id ?? null,
        slug: product.slug,
        name: product.name,
        variation: variation?.name ?? null,
        image: gallery[0] ?? product.images[0] ?? null,
        price: priced.salePrice !== null && priced.salePrice < priced.price ? priced.salePrice : priced.price,
      },
      qty,
    );
    onAdded?.();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-[30px]">
      <div>
        {mainImage ? (
          <ZoomImage key={mainImage} src={mainImage} alt={title} />
        ) : (
          <div className="flex aspect-square flex-col items-center justify-center gap-3 border border-line bg-[#f6f6f6] text-muted">
            <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" aria-hidden>
              <path d="M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M3 3l18 18" />
            </svg>
            <span className="text-sm">{t.product.noPhoto}</span>
          </div>
        )}
        {gallery.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-5">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImageIndex(i)}
                className={`size-[97px] overflow-hidden border ${src === mainImage ? "border-ink" : "border-line"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Heading className="text-[28px] text-ink md:text-[32px]">{title}</Heading>
        <div className="mt-2 text-[28px] font-medium text-ink">
          {discountPercent ? <PriceTag p={variation ?? product} discountPercent={discountPercent} /> : variation ? (
            variation.salePrice !== null && variation.salePrice < variation.price ? (
              <>
                <del className="mr-3 text-xl font-normal text-muted">{formatPrice(variation.price)}</del>
                {formatPrice(variation.salePrice)}
              </>
            ) : (
              formatPrice(variation.price)
            )
          ) : (
            <PriceTag p={product} />
          )}
        </div>
        {product.shortDescription && <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted">{product.shortDescription}</p>}

        {specs.length > 0 && (
          <dl className="mt-4 space-y-1 text-[15px]">
            {specs.map((s) => (
              <div key={s.label} className="flex gap-2">
                <dt className="text-muted">{s.label}:</dt>
                <dd className="text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-6 border-t border-line pt-6">
          {hasVariations && (
            <div className="mb-5">
              <p className="mb-2 text-sm uppercase text-ink">
                {product.variationLabel ?? t.product.option}
                {variation && <span className="ml-2 normal-case text-muted">{variation.name}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => {
                  const on = v.id === selectedId;
                  const available = inStock(v);
                  if (v.color)
                    return (
                      <button
                        key={v.id}
                        type="button"
                        title={v.name}
                        aria-label={v.name}
                        aria-pressed={on}
                        onClick={() => choose(v.id)}
                        className={`relative flex size-10 items-center justify-center rounded-full border transition ${on ? "border-ink" : "border-transparent hover:border-line"} ${available ? "" : "opacity-40"}`}
                      >
                        <span className="size-8 rounded-full ring-1 ring-black/10" style={{ background: v.color }} />
                        {!available && <span className="absolute h-px w-9 rotate-45 bg-ink" />}
                      </button>
                    );
                  return (
                    <button
                      key={v.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => choose(v.id)}
                      className={`min-w-11 border px-3 py-2 text-sm transition ${on ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"} ${available ? "" : "opacity-40 line-through"}`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
              {variation && (
                <button type="button" onClick={() => choose(null)} className="mt-3 inline-flex items-center gap-1 text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  <span aria-hidden>×</span> {t.product.clear}
                </button>
              )}
            </div>
          )}

          {!onAdded && <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <WishlistButton product={product} className="flex size-[38px] items-center justify-center border border-line hover:border-ink" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={t.product.share}
                className="flex size-[38px] items-center justify-center border border-line hover:border-ink"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
                  else navigator.clipboard?.writeText(window.location.href);
                }}
              >
                <ShareIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${product.name} ${window.location.href}`)}`, "_blank", "noopener")}
                className="flex h-[38px] items-center gap-2 border border-line px-4 text-sm hover:border-ink"
              >
                <WhatsAppIcon className="size-4" /> {t.product.shareWhatsapp}
              </button>
            </div>
          </div>}

          {stock !== null && <p className={`mb-3 text-sm ${outOfStock ? "text-red-600" : "text-green-700"}`}>{outOfStock ? t.product.outOfStock : t.product.inStock(stock)}</p>}

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-[48px] shrink-0 items-center border border-line">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 text-xl text-muted hover:text-ink">
                −
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                aria-label={t.product.quantity}
                className="w-10 [appearance:textfield] text-center outline-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className="w-11 text-xl text-muted hover:text-ink">
                +
              </button>
            </div>
            <button type="button" onClick={add} disabled={outOfStock || (!!onAdded && !ready)} className="btn-dark h-[48px] min-w-0 flex-1 !px-4 sm:flex-none sm:!px-8">
              {t.product.addToCart}
            </button>
          </div>

          {!onAdded && <div className="mt-4">
            <WishlistButton product={product} label className="flex items-center gap-2 text-ink hover:opacity-70" />
          </div>}
        </div>

        <div className="mt-6 border-t border-line pt-6">
          <div className="grid grid-cols-3 border border-line px-2 py-6">
            {featureIcons.map((icon, i) => (
              <div key={icon} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" className="mx-auto size-[46px]" />
                <p className="mt-3 text-xs uppercase text-ink">{t.product.features[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
