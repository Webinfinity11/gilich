"use client";

import { useMemo, useState } from "react";
import type { ProductDetail } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { ShareIcon, WhatsAppIcon } from "./icons";
import { useI18n } from "./lang";
import { PriceTag } from "./ProductCard";
import { useStore } from "./store";
import { WishlistButton } from "./WishlistButton";

const featureIcons = ["/media/icon3-product-detail.png", "/media/icon2-product-detail.png", "/media/h1-icon4.png"];

/** Gallery + options + add to cart. Picking a variation switches price and photo. */
export function ProductPurchase({ product, children }: { product: ProductDetail; children: React.ReactNode }) {
  const { addToCart } = useStore();
  const { t } = useI18n();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasVariations = product.variations.length > 0;
  const attrs = product.attributes.filter((a) => product.variations.some((v) => a.name in v.options));

  const variation = useMemo(() => {
    if (!hasVariations || attrs.some((a) => !selected[a.name])) return null;
    return product.variations.find((v) => attrs.every((a) => v.options[a.name] === selected[a.name])) ?? null;
  }, [hasVariations, attrs, selected, product.variations]);

  // Variation photo goes first in the gallery when selected
  const gallery = useMemo(() => {
    const imgs = [...product.images];
    if (variation?.image && !imgs.includes(variation.image)) imgs.unshift(variation.image);
    return imgs;
  }, [product.images, variation]);
  const mainImage = variation?.image ?? gallery[imageIndex] ?? gallery[0];

  const isAvailable = (name: string, value: string) =>
    product.variations.some(
      (v) => v.options[name] === value && (v.stock === null || v.stock > 0) && attrs.every((a) => a.name === name || !selected[a.name] || v.options[a.name] === selected[a.name]),
    );

  const stock = hasVariations ? variation?.stock ?? null : product.stock;
  const outOfStock = stock !== null && stock <= 0;

  const choose = (name: string, value: string) => {
    setError(null);
    setSelected((prev) => (prev[name] === value ? { ...prev, [name]: "" } : { ...prev, [name]: value }));
  };

  const add = () => {
    if (hasVariations && !variation) {
      setError(t.product.chooseOptions);
      return;
    }
    const price = variation
      ? variation.salePrice !== null && variation.salePrice < variation.price
        ? variation.salePrice
        : variation.price
      : product.salePrice !== null && product.salePrice < product.price
        ? product.salePrice
        : product.price;
    addToCart(
      {
        productId: product.id,
        variationId: variation?.id ?? null,
        slug: product.slug,
        name: product.name,
        variation: variation ? Object.entries(variation.options).map(([k, v]) => `${k}: ${v}`).join(", ") : null,
        image: variation?.image ?? product.images[0] ?? null,
        price,
      },
      qty,
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-[30px]">
      <div>
        <div className="aspect-square overflow-hidden border border-line bg-[#f6f6f6]">
          {mainImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImage} alt={product.name} className="size-full object-cover" />
          )}
        </div>
        {gallery.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-5">
            {gallery.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setImageIndex(i);
                  if (variation?.image && src !== variation.image) setSelected({});
                }}
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
          {attrs.map((a) => (
            <div key={a.name} className="mb-5">
              <p className="mb-2 text-sm uppercase text-ink">
                {a.name}
                {selected[a.name] && <span className="ml-2 normal-case text-muted">{selected[a.name]}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {a.values.map((value) => {
                  const on = selected[a.name] === value;
                  const available = isAvailable(a.name, value);
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      onClick={() => choose(a.name, value)}
                      className={`min-w-11 border px-3 py-2 text-sm transition ${on ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"} disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {attrs.some((a) => selected[a.name]) && (
            <button type="button" onClick={() => setSelected({})} className="mb-5 text-sm text-muted underline">
              {t.product.clear}
            </button>
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
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

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
