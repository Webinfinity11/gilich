"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type CartItem = {
  key: string;
  productId: number;
  variationId: number | null;
  slug: string;
  name: string;
  variation: string | null;
  image: string | null;
  price: number;
  qty: number;
};

export type WishItem = {
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  price: number;
  maxPrice: number;
};

type StoreValue = {
  cart: CartItem[];
  wishlist: WishItem[];
  ready: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (item: WishItem) => void;
  inWishlist: (productId: number) => boolean;
  notice: string | null;
  dismissNotice: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

const CART_KEY = "gilich-cart";
const WISH_KEY = "gilich-wishlist";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode); state stays in memory
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setCart(read<CartItem[]>(CART_KEY, []));
    setWishlist(read<WishItem[]>(WISH_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) write(CART_KEY, cart);
  }, [cart, ready]);

  useEffect(() => {
    if (ready) write(WISH_KEY, wishlist);
  }, [wishlist, ready]);

  const addToCart = useCallback<StoreValue["addToCart"]>((item, qty = 1) => {
    const key = `${item.productId}:${item.variationId ?? 0}`;
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) return prev.map((i) => (i.key === key ? { ...i, ...item, qty: i.qty + qty } : i));
      return [...prev, { ...item, key, qty }];
    });
    setNotice(item.name);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((item: WishItem) => {
    setWishlist((prev) =>
      prev.some((w) => w.productId === item.productId)
        ? prev.filter((w) => w.productId !== item.productId)
        : [...prev, item],
    );
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      ready,
      cartCount: cart.reduce((s, i) => s + i.qty, 0),
      cartTotal: cart.reduce((s, i) => s + i.qty * i.price, 0),
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      inWishlist: (id) => wishlist.some((w) => w.productId === id),
      notice,
      dismissNotice: () => setNotice(null),
    }),
    [cart, wishlist, ready, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, notice],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

const noopSubscribe = () => () => {};

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  // False while this component hydrates, true afterwards. Suspense boundaries can hydrate
  // after the provider has already loaded localStorage, so each consumer renders the
  // server state (empty cart) until it has hydrated itself.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (hydrated) return ctx;
  return { ...ctx, cart: [], wishlist: [], ready: false, cartCount: 0, cartTotal: 0, inWishlist: () => false };
}
