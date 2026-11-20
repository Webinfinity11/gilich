"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductPurchase } from "@/components/site/ProductPurchase";
import { CloseIcon } from "@/components/site/icons";
import { useI18n } from "@/components/site/lang";
import type { ProductDetail } from "@/lib/catalog";

export function CampaignProducts({ products, discountPercent }: { products: ProductDetail[]; discountPercent: number }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (product && !dialog.current?.open) dialog.current?.showModal();
  }, [product]);

  const close = () => dialog.current?.close();

  return (
    <>
      <div className="campaign-grid">
        {products.map((item) => (
          <article key={item.id} className="campaign-product">
            <ProductCard product={item} discountPercent={discountPercent} onOpen={() => setProduct(item)} />
          </article>
        ))}
      </div>
      <dialog
        ref={dialog}
        aria-label={product?.name}
        onClose={() => setProduct(null)}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto overscroll-contain border border-line bg-white text-ink shadow-2xl backdrop:bg-black/60"
      >
        {product && (
          <div className="p-4 sm:p-8">
            <div className="mb-3 flex justify-end">
              <button type="button" autoFocus aria-label={t.header.closeMenu} onClick={close} className="flex size-10 items-center justify-center border border-line">
                <CloseIcon className="size-5" />
              </button>
            </div>
            <ProductPurchase key={product.id} product={product} onAdded={close} discountPercent={discountPercent}>
              {product.description && product.description !== product.shortDescription && (
                <div className="mt-6 border-t border-line pt-6">
                  <h3 className="font-medium">{t.product.description}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>
                </div>
              )}
            </ProductPurchase>
          </div>
        )}
      </dialog>
    </>
  );
}
