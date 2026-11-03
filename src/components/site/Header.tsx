"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localePath, stripLang } from "@/lib/i18n";
import { formatPrice } from "@/lib/money";
import { site } from "@/lib/site";
import { CartIcon, CloseIcon, HeartIcon, MenuIcon } from "./icons";
import { useI18n } from "./lang";
import { LLink } from "./LLink";
import { useStore } from "./store";

export function Header() {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const { cartCount, wishlist, cart, cartTotal, removeFromCart } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close overlays on navigation
    setMenuOpen(false);
    setCartOpen(false);
  }, [pathname]);

  const current = stripLang(pathname);
  const isActive = (href: string) => (href === "/" ? current === "/" : current.startsWith(href));
  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/about-page", label: t.nav.about },
    { href: "/shop", label: t.nav.shop },
    { href: "/contact-page", label: t.nav.contact },
  ];

  // Same page in the other language
  const switcher = (
    <span className="flex items-center gap-3">
      <LangFlag active={lang === "en"} href={localePath("en", current)} src="/media/ICON-1.png" label={t.lang.en} />
      <LangFlag active={lang === "ka-ge"} href={localePath("ka-ge", current)} src="/media/flag-ge.svg" label={t.lang.ka} />
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="container-site flex h-[72px] items-center justify-between gap-6 md:h-[88px]">
        <button type="button" className="lg:hidden" aria-label={t.header.openMenu} onClick={() => setMenuOpen(true)}>
          <MenuIcon className="size-7" />
        </button>

        <LLink href="/" className="shrink-0" aria-label={site.fullName}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo} alt={site.fullName} className="h-[46px] w-auto md:h-[58px]" />
        </LLink>

        <nav className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <LLink
              key={item.href}
              href={item.href}
              className={`text-[15px] uppercase transition hover:text-ink ${isActive(item.href) ? "font-medium text-ink" : "text-[#555]"}`}
            >
              {item.label}
            </LLink>
          ))}
          {switcher}
        </nav>

        <div className="flex items-center gap-5">
          <LLink href="/wishlist" aria-label={t.nav.wishlist} className="relative">
            <HeartIcon className="size-[26px]" />
            {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
          </LLink>
          <div className="relative">
            <button type="button" aria-label={t.nav.cart} className="relative" onClick={() => setCartOpen((v) => !v)}>
              <CartIcon className="size-[26px]" />
              <Badge>{cartCount}</Badge>
            </button>
            {cartOpen && (
              <div className="absolute right-0 top-full z-50 mt-5 w-[320px] border border-line bg-white p-5 shadow-xl">
                {cart.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted">{t.header.noProducts}</p>
                ) : (
                  <>
                    <ul className="max-h-[300px] divide-y divide-line overflow-y-auto">
                      {cart.map((item) => (
                        <li key={item.key} className="flex gap-3 py-3">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt="" className="size-16 shrink-0 border border-line object-cover" />
                          )}
                          <div className="min-w-0 flex-1 text-sm">
                            <LLink href={`/product/${item.slug}`} className="block truncate hover:underline">
                              {item.name}
                            </LLink>
                            {item.variation && <p className="text-xs text-muted">{item.variation}</p>}
                            <p className="mt-1 text-muted">
                              {item.qty} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <button type="button" aria-label={t.common.remove} onClick={() => removeFromCart(item.key)} className="self-start text-muted hover:text-ink">
                            <CloseIcon className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between border-t border-line pt-3 text-sm">
                      <span>{t.common.subtotal}:</span>
                      <span className="font-medium">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <LLink href="/cart" className="btn-light border border-ink !px-2 !py-2.5 !text-[13px]">
                        {t.common.viewCart}
                      </LLink>
                      <LLink href="/checkout" className="btn-dark !px-2 !py-2.5 !text-[13px]">
                        {t.common.checkout}
                      </LLink>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={t.header.closeMenu} className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <nav className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-white p-6">
            <button type="button" aria-label={t.header.closeMenu} className="mb-6 self-end" onClick={() => setMenuOpen(false)}>
              <CloseIcon className="size-6" />
            </button>
            {nav.map((item) => (
              <LLink key={item.href} href={item.href} className="border-b border-line py-3 uppercase">
                {item.label}
              </LLink>
            ))}
            <LLink href="/wishlist" className="border-b border-line py-3 uppercase">
              {t.nav.wishlist}
            </LLink>
            <LLink href="/cart" className="border-b border-line py-3 uppercase">
              {t.nav.cart}
            </LLink>
            <div className="mt-6">{switcher}</div>
          </nav>
        </div>
      )}
    </header>
  );
}

function LangFlag({ active, href, src, label }: { active: boolean; href: string; src: string; label: string }) {
  return (
    // Plain <a>: switching language swaps <html lang>, so it needs a full page load
    <a href={href} hrefLang={href.startsWith("/ka-ge") ? "ka" : "en"} title={label} aria-label={label} aria-current={active ? "true" : undefined} className={active ? "" : "opacity-60 hover:opacity-100"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={`h-3 w-[18px] object-cover ${active ? "ring-1 ring-ink ring-offset-2" : ""}`} />
    </a>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-2 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-ink text-[10px] font-medium text-white">
      {children}
    </span>
  );
}
