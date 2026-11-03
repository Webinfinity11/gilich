"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/actions";
import { formatPrice } from "@/lib/money";
import { useI18n } from "./lang";
import { LLink as Link } from "./LLink";
import { useStore } from "./store";

export function CheckoutForm() {
  const router = useRouter();
  const { cart, ready, cartTotal, clearCart } = useStore();
  const { t, lang, lp } = useI18n();
  const c = t.checkout;
  const fields = [
    { name: "firstName", label: c.firstName, half: true },
    { name: "lastName", label: c.lastName, half: true },
    { name: "country", label: c.country, defaultValue: c.defaultCountry },
    { name: "city", label: c.city },
    { name: "address", label: c.address },
    { name: "phone", label: c.phone, type: "tel", half: true },
    { name: "email", label: c.email, type: "email", half: true },
  ];
  const [payment, setPayment] = useState("cod");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!ready) return <div className="min-h-[400px]" />;

  if (cart.length === 0) {
    return (
      <div className="container-site py-16 text-center">
        <p className="text-ink">{c.empty}</p>
        <Link href="/shop" className="btn-dark mt-6">
          {t.common.returnToShop}
        </Link>
      </div>
    );
  }

  const submit = (formData: FormData) => {
    setError(null);
    const customer = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
    startTransition(async () => {
      const res = await placeOrder({
        lines: cart.map((i) => ({ productId: i.productId, variationId: i.variationId, qty: i.qty })),
        customer,
        paymentMethod: payment,
        lang,
      });
      if (res.ok) {
        clearCart();
        router.push(lp(`/order-received/${res.token}`));
      } else {
        setError(res.message);
      }
    });
  };

  return (
    <form action={submit} className="container-site grid gap-10 py-12 md:py-[60px] lg:grid-cols-[1fr_420px]">
      <div>
        <h2 className="text-xl uppercase text-ink">{c.billing}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <label key={f.name} className={`block text-sm text-ink ${f.half ? "" : "sm:col-span-2"}`}>
              {f.label} <span className="text-red-600">*</span>
              <input name={f.name} type={f.type ?? "text"} required defaultValue={f.defaultValue} className="input mt-2" />
            </label>
          ))}
          <label className="block text-sm text-ink sm:col-span-2">
            {c.notes}
            <textarea name="note" rows={4} placeholder={c.notesPlaceholder} className="input mt-2" />
          </label>
        </div>
      </div>

      <div className="h-fit border border-line p-6 md:p-8">
        <h2 className="text-xl uppercase text-ink">{c.yourOrder}</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line text-[15px]">
          {cart.map((i) => (
            <li key={i.key} className="flex justify-between gap-4 py-3">
              <span>
                {i.name} <span className="text-muted">× {i.qty}</span>
                {i.variation && <span className="block text-xs text-muted">{i.variation}</span>}
              </span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3 text-[15px]">
          <div className="flex justify-between">
            <dt>{t.common.subtotal}</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t.common.shipping}</dt>
            <dd className="text-muted">{t.common.freeShipping}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-lg font-medium">
            <dt>{t.common.total}</dt>
            <dd>{formatPrice(cartTotal)}</dd>
          </div>
        </dl>

        <fieldset className="mt-6 space-y-3 text-[15px]">
          <legend className="sr-only">{t.order.payment}</legend>
          {[
            { value: "cod", label: c.cod, note: c.codNote },
            { value: "bank", label: c.bank, note: c.bankNote },
          ].map((m) => (
            <label key={m.value} className="block cursor-pointer">
              <span className="flex items-center gap-2">
                <input type="radio" name="payment" value={m.value} checked={payment === m.value} onChange={() => setPayment(m.value)} />
                {m.label}
              </span>
              {payment === m.value && <span className="mt-2 block bg-panel p-3 text-sm text-muted">{m.note}</span>}
            </label>
          ))}
        </fieldset>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={pending} className="btn-dark mt-6 w-full">
          {pending ? c.placing : c.place}
        </button>
      </div>
    </form>
  );
}
