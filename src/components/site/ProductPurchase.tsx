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
export function ProductPurchase({ product, children }: { product: ProductDetail; children: React.ReactNode }) {
  const { addToCart } = useStore();
  const { t } = useI18n();
  const inStock = (v: { stock: number | null }) => v.stock === null || v.stock > 0;
  // The first available variation is picked on load, so a single price and its photos show right away
  const [selectedId, setSelectedId] = useState<number | null>(() => (product.variations.find(inStock) ?? product.variations[0])?.id ?? null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const hasVariations = product.variations.length > 0;
  const variation = product.variations.find((v) => v.id === selectedId) ?? null;
  const hasSwatches = product.variations.some((v) => v.color);

  // The selected variation's own gallery replaces the product photos
  const gallery = variation?.images.length ? variation.images : product.images;
  const mainImage = gallery[imageIndex] ?? gallery[0];

  const stock = hasVariations ? (variation?.stock ?? null) : product.stock;
  const outOfStock = stock !== null && stock <= 0;

  const choose = (id: number) => {
    setSelectedId(id);
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
        image: gallery[0] ?? null,
        price: priced.salePrice !== null && priced.salePrice < priced.price ? priced.salePrice : priced.price,
      },
      qty,
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-[30px]">
      <div>
        {mainImage ? <ZoomImage src={mainImage} alt={product.name} /> : <div className="aspect-square border border-line bg-[#f6f6f6]" />}
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
        <h1 className="text-[28px] text-ink md:text-[32px]">{product.name}</h1>
        <div className="mt-2 text-[28px] font-medium text-ink">
          {variation ? (
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

        <div className="mt-6 border-t border-line pt-6">
          {hasVariations && (
            <div className="mb-5">
              <p className="mb-2 text-sm uppercase text-ink">
                {hasSwatches ? t.shop.color : t.product.option}
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
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
          </div>

          {stock !== null && <p className={`mb-3 text-sm ${outOfStock ? "text-red-600" : "text-green-700"}`}>{outOfStock ? t.product.outOfStock : t.product.inStock(stock)}</p>}

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-[48px] items-center border border-line">
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
            <button type="button" onClick={add} disabled={outOfStock} className="btn-dark h-[48px]">
              {t.product.addToCart}
            </button>
          </div>

          <div className="mt-4">
            <WishlistButton product={product} label className="flex items-center gap-2 text-ink hover:opacity-70" />
          </div>
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
