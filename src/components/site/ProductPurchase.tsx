"use client";

import { useMemo, useState } from "react";
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
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = product.variations.find(inStock) ?? product.variations[0];
    return first ? { ...first.options } : {};
  });
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const hasVariations = product.variations.length > 0;
  const attrs = product.attributes.filter((a) => product.variations.some((v) => a.name in v.options));

  const variation = useMemo(() => {
    if (!hasVariations || attrs.some((a) => !selected[a.name])) return null;
    return product.variations.find((v) => attrs.every((a) => v.options[a.name] === selected[a.name])) ?? null;
  }, [hasVariations, attrs, selected, product.variations]);

  // Photos follow the selection: galleries of the picked values (e.g. colour "Rose Gold"),
  // otherwise the variation photo first, then the product photos
  const gallery = useMemo(() => {
    const own = attrs.flatMap((a) => (selected[a.name] ? (a.images?.[selected[a.name]] ?? []) : []));
    if (own.length) return [...new Set(own)];
    const imgs = [...product.images];
    if (variation?.image) return [variation.image, ...imgs.filter((u) => u !== variation.image)];
    return imgs;
  }, [attrs, selected, product.images, variation]);
  const mainImage = gallery[imageIndex] ?? gallery[0];
  const attrLabel = (name: string) => (name.toLowerCase() === "color" ? t.shop.color : name.toLowerCase() === "size" ? t.shop.size : name);

  const isAvailable = (name: string, value: string) => product.variations.some((v) => v.options[name] === value && inStock(v));

  const stock = hasVariations ? variation?.stock ?? null : product.stock;
  const outOfStock = stock !== null && stock <= 0;

  /** Pick a value; if that combination does not exist, switch to the closest variation that has it */
  const choose = (name: string, value: string) => {
    setError(null);
    setImageIndex(0);
    setSelected((prev) => {
      const next = { ...prev, [name]: value };
      const exact = product.variations.find((v) => attrs.every((a) => v.options[a.name] === next[a.name]));
      if (exact) return next;
      const score = (v: (typeof product.variations)[number]) => attrs.filter((a) => v.options[a.name] === next[a.name]).length + (inStock(v) ? 0.5 : 0);
      const best = product.variations.filter((v) => v.options[name] === value).sort((a, b) => score(b) - score(a))[0];
      return best ? { ...best.options } : next;
    });
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
          {attrs.map((a) => (
            <div key={a.name} className="mb-5">
              <p className="mb-2 text-sm uppercase text-ink">
                {attrLabel(a.name)}
                {selected[a.name] && <span className="ml-2 normal-case text-muted">{selected[a.name]}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {a.values.map((value) => {
                  const on = selected[a.name] === value;
                  const available = isAvailable(a.name, value);
                  const hex = a.type === "color" ? a.colors?.[value] : undefined;
                  if (hex)
                    return (
                      <button
                        key={value}
                        type="button"
                        title={value}
                        aria-label={value}
                        aria-pressed={on}
                        disabled={!available}
                        onClick={() => choose(a.name, value)}
                        className={`relative flex size-10 items-center justify-center rounded-full border transition ${on ? "border-ink" : "border-transparent hover:border-line"} disabled:cursor-not-allowed disabled:opacity-35`}
                      >
                        <span className="size-8 rounded-full ring-1 ring-black/10" style={{ background: hex }} />
                        {!available && <span className="absolute h-px w-9 rotate-45 bg-ink" />}
                      </button>
                    );
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
