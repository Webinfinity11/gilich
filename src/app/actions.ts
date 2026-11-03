"use server";

import { db } from "@/lib/db";
import { effectivePrice, parseJson, variationName } from "@/lib/catalog";

export type FormState = { ok: boolean; message: string } | null;

const clean = (v: FormDataEntryValue | null, max = 500) => String(v ?? "").trim().slice(0, max);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const messages = {
  en: {
    badEmail: "Please enter a valid email address.",
    subscribed: "Thank you for subscribing!",
    contactMissing: "Please fill in your name, a valid email and a message.",
    contactSent: "Thank you for your message. It has been sent.",
    required: "Please fill in all required fields.",
    payment: "Please choose a payment method.",
    empty: "Your cart is empty.",
    unavailable: "A product in your cart is no longer available.",
    options: (n: string) => `Please choose options for ${n}.`,
    stock: (n: string) => `Not enough stock for ${n}.`,
  },
  ka: {
    badEmail: "გთხოვთ, მიუთითოთ სწორი ელფოსტა.",
    subscribed: "გმადლობთ გამოწერისთვის!",
    contactMissing: "გთხოვთ, მიუთითოთ სახელი, სწორი ელფოსტა და შეტყობინება.",
    contactSent: "გმადლობთ! თქვენი შეტყობინება გაიგზავნა.",
    required: "გთხოვთ, შეავსოთ ყველა სავალდებულო ველი.",
    payment: "გთხოვთ, აირჩიოთ გადახდის მეთოდი.",
    empty: "თქვენი კალათა ცარიელია.",
    unavailable: "კალათაში არსებული პროდუქტი აღარ არის ხელმისაწვდომი.",
    options: (n: string) => `აირჩიეთ პარამეტრები: ${n}.`,
    stock: (n: string) => `არასაკმარისი მარაგი: ${n}.`,
  },
};
const msg = (lang: unknown) => (lang === "ka-ge" ? messages.ka : messages.en);

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const m = msg(formData.get("lang"));
  const email = clean(formData.get("email"), 200).toLowerCase();
  if (!isEmail(email)) return { ok: false, message: m.badEmail };
  await db.subscriber.upsert({ where: { email }, create: { email }, update: {} });
  return { ok: true, message: m.subscribed };
}

export async function sendContactMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const m = msg(formData.get("lang"));
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200);
  const phone = clean(formData.get("phone"), 40);
  const subject = clean(formData.get("subject"), 200);
  const message = clean(formData.get("message"), 5000);
  if (!name || !isEmail(email) || !message) {
    return { ok: false, message: m.contactMissing };
  }
  await db.contactMessage.create({ data: { name, email, phone: phone || null, subject: subject || null, message } });
  return { ok: true, message: m.contactSent };
}

export type CheckoutLine = { productId: number; variationId: number | null; qty: number };

export type CheckoutResult = { ok: true; token: string } | { ok: false; message: string };

export async function placeOrder(input: {
  lines: CheckoutLine[];
  customer: Record<string, string>;
  paymentMethod: string;
  lang?: string;
}): Promise<CheckoutResult> {
  const m = msg(input.lang);
  const c = Object.fromEntries(Object.entries(input.customer).map(([k, v]) => [k, String(v ?? "").trim().slice(0, 500)]));
  const required = ["firstName", "lastName", "email", "phone", "country", "city", "address"];
  if (required.some((k) => !c[k])) return { ok: false, message: m.required };
  if (!isEmail(c.email)) return { ok: false, message: m.badEmail };
  if (!["cod", "bank"].includes(input.paymentMethod)) return { ok: false, message: m.payment };

  const lines = input.lines.filter((l) => Number.isInteger(l.productId) && l.qty > 0 && l.qty <= 99);
  if (!lines.length) return { ok: false, message: m.empty };

  // Prices always come from the database, never from the browser
  const products = await db.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) }, status: "published" },
    include: { images: { orderBy: { sortOrder: "asc" } }, variations: true },
  });

  const items: { productId: number; variationId: number | null; name: string; variation: string | null; image: string | null; price: number; quantity: number }[] = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) return { ok: false, message: m.unavailable };
    // No variation picked = the main product itself
    const v = line.variationId ? product.variations.find((x) => x.id === line.variationId) : undefined;
    if (line.variationId && !v) return { ok: false, message: m.options(product.name) };
    if (v) {
      if (v.stock !== null && v.stock < line.qty) return { ok: false, message: m.stock(product.name) };
      items.push({
        productId: product.id,
        variationId: v.id,
        name: product.name,
        variation: variationName(v),
        image: parseJson<string[]>(v.images, [])[0] ?? v.image ?? product.images[0]?.url ?? null,
        price: effectivePrice(v),
        quantity: line.qty,
      });
    } else {
      if (product.stock !== null && product.stock < line.qty) return { ok: false, message: m.stock(product.name) };
      items.push({
        productId: product.id,
        variationId: null,
        name: product.name,
        variation: null,
        image: product.images[0]?.url ?? null,
        price: effectivePrice(product),
        quantity: line.qty,
      });
    }
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = 0; // free shipping

  const order = await db.$transaction(async (tx) => {
    for (const i of items) {
      if (i.variationId) {
        await tx.productVariation.updateMany({ where: { id: i.variationId, stock: { not: null } }, data: { stock: { decrement: i.quantity } } });
      } else {
        await tx.product.updateMany({ where: { id: i.productId, stock: { not: null } }, data: { stock: { decrement: i.quantity } } });
      }
    }
    return tx.order.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        country: c.country,
        city: c.city,
        address: c.address,
        note: c.note || null,
        paymentMethod: input.paymentMethod,
        subtotal,
        shipping,
        total: subtotal + shipping,
        items: { create: items },
      },
    });
  });

  return { ok: true, token: order.token };
}
