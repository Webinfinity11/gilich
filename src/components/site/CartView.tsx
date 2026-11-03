"use client";

import { formatPrice } from "@/lib/money";
import { CloseIcon, SadIcon } from "./icons";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";
import { useStore } from "./store";

export function CartView({ emptyExtra }: { emptyExtra: React.ReactNode }) {
  const { cart, ready, cartTotal, setQty, removeFromCart } = useStore();
  const { t } = useI18n();

  if (!ready) return <div className="min-h-[400px]" />;

  if (cart.length === 0) {
    return (
      <div className="container-site py-12 md:py-[60px]">
        <div className="text-center">
          <SadIcon className="mx-auto size-16 text-ink" />
          <p className="mt-5 text-ink">{t.cart.empty}</p>
          <Link href="/shop" className="btn-dark mt-6">
            {t.common.returnToShop}
          </Link>
        </div>
        {emptyExtra}
      </div>
    );
  }

  return (
    <div className="container-site grid gap-10 py-12 md:py-[60px] lg:grid-cols-[1fr_380px]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-sm uppercase text-ink">
              <th className="pb-4 font-medium" colSpan={2}>
                {t.cart.product}
              </th>
              <th className="pb-4 font-medium">{t.cart.price}</th>
              <th className="pb-4 font-medium">{t.cart.quantity}</th>
              <th className="pb-4 font-medium">{t.common.subtotal}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.key} className="border-b border-line">
                <td className="w-[100px] py-5">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="size-20 border border-line object-cover" />
                  )}
                </td>
                <td className="py-5 pr-4">
                  <Link href={`/product/${item.slug}`} className="text-ink hover:underline">
                    {item.name}
                  </Link>
                  {item.variation && <p className="text-sm text-muted">{item.variation}</p>}
                </td>
                <td className="py-5">{formatPrice(item.price)}</td>
                <td className="py-5">
                  <div className="inline-flex h-10 items-center border border-line">
                    <button type="button" aria-label="Decrease" onClick={() => setQty(item.key, item.qty - 1)} className="w-9 text-muted hover:text-ink">
                      −
                    </button>
                    <span className="w-8 text-center">{item.qty}</span>
                    <button type="button" aria-label="Increase" onClick={() => setQty(item.key, item.qty + 1)} className="w-9 text-muted hover:text-ink">
                      +
                    </button>
                  </div>
                </td>
                <td className="py-5 font-medium">{formatPrice(item.price * item.qty)}</td>
                <td className="py-5 text-right">
                  <button type="button" aria-label={`${t.common.remove}: ${item.name}`} onClick={() => removeFromCart(item.key)} className="text-muted hover:text-ink">
                    <CloseIcon className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link href="/shop" className="mt-6 inline-block border-b border-ink text-sm uppercase">
          {t.common.continueShopping}
        </Link>
      </div>

      <div className="h-fit border border-line p-6 md:p-8">
        <h2 className="text-xl uppercase text-ink">{t.cart.totals}</h2>
        <dl className="mt-6 space-y-4 text-[15px]">
          <div className="flex justify-between border-b border-line pb-4">
            <dt>{t.common.subtotal}</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
          <div className="flex justify-between border-b border-line pb-4">
            <dt>{t.common.shipping}</dt>
            <dd className="text-muted">{t.common.freeShipping}</dd>
          </div>
          <div className="flex justify-between text-lg font-medium">
            <dt>{t.common.total}</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn-dark mt-8 w-full">
          {t.cart.proceed}
        </Link>
      </div>
    </div>
  );
}
