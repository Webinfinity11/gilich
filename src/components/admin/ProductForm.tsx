"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct, uploadImages, type ProductInput } from "@/app/admin/actions";
import type { Attribute } from "@/lib/catalog";
import { slugify } from "@/lib/slug";
import { ImageUploader } from "./ImageUploader";

type Category = { id: number; name: string; parentId: number | null };
type Variation = ProductInput["variations"][number];

/** All combinations of attribute values, e.g. Size × Color */
function combinations(attrs: Attribute[]): Record<string, string>[] {
  return attrs.reduce<Record<string, string>[]>(
    (acc, a) => acc.flatMap((combo) => a.values.map((v) => ({ ...combo, [a.name]: v }))),
    [{}],
  );
}

const sameOptions = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);

/** Rebuild the variation list for the attributes, keeping data of combinations that still exist */
function syncVariations(attrs: Attribute[], current: Variation[], basePrice: string): Variation[] {
  const usable = attrs.filter((a) => a.name.trim() && a.values.length);
  if (!usable.length) return [];
  return combinations(usable).map(
    (options) =>
      current.find((v) => sameOptions(v.options, options)) ?? { options, sku: "", price: current[0]?.price ?? basePrice, salePrice: "", stock: "", image: null },
  );
}

// Common colour names -> swatch, so a typed "Gold" gets a sensible default
const knownColors: Record<string, string> = {
  gold: "#d4af37",
  "yellow gold": "#d4af37",
  "rose gold": "#b76e79",
  "white gold": "#e8e6e1",
  silver: "#c0c0c0",
  platinum: "#e5e4e2",
  black: "#111111",
  white: "#ffffff",
  red: "#c0392b",
  blue: "#2563eb",
  green: "#15803d",
  pink: "#f9a8d4",
  ოქრო: "#d4af37",
  "ვარდისფერი ოქრო": "#b76e79",
  "თეთრი ოქრო": "#e8e6e1",
  ვერცხლი: "#c0c0c0",
  შავი: "#111111",
  თეთრი: "#ffffff",
};

export function ProductForm({ initial, categories, saved }: { initial: ProductInput; categories: Category[]; saved?: boolean }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(saved ? { ok: true, text: "შენახულია" } : null);
  const [pending, startTransition] = useTransition();
  const [descLang, setDescLang] = useState<"en" | "ka">("en");
  const [type, setType] = useState<"simple" | "variable">(initial.variations.length ? "variable" : "simple");

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setP((prev) => ({ ...prev, [key]: value }));

  /** Change attributes and regenerate variations in one step */
  const setAttributes = (fn: (attrs: Attribute[]) => Attribute[], renameFrom?: { from: string; to: string }) =>
    setP((prev) => {
      const attributes = fn(prev.attributes);
      let current = prev.variations;
      if (renameFrom) {
        current = current.map((v) => {
          if (!(renameFrom.from in v.options)) return v;
          const { [renameFrom.from]: value, ...rest } = v.options;
          return { ...v, options: { ...rest, [renameFrom.to]: value } };
        });
      }
      return { ...prev, attributes, variations: syncVariations(attributes, current, prev.price) };
    });

  const setVar = (i: number, patch: Partial<Variation>) => set("variations", p.variations.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  const uploadVariationImage = async (i: number, file: File) => {
    const fd = new FormData();
    fd.append("files", file);
    const res = await uploadImages(fd);
    if (res.error) return setMessage({ ok: false, text: res.error });
    const url = res.urls[0];
    setVar(i, { image: url });
    // Also add to the gallery so it shows among product photos
    if (url && !p.images.includes(url)) setP((prev) => ({ ...prev, images: [...prev.images, url] }));
  };

  const submit = () => {
    setMessage(null);
    if (type === "variable" && !p.variations.length) return setMessage({ ok: false, text: "დაამატეთ ატრიბუტი მნიშვნელობებით, ან აირჩიეთ „მარტივი პროდუქტი“" });
    const payload: ProductInput = type === "simple" ? { ...p, attributes: [], variations: [] } : p;
    startTransition(async () => {
      const res = await saveProduct(payload);
      if (res.ok && res.id) {
        // The page remounts the form with fresh data; ?saved=1 carries the success notice
        router.replace(`/admin/products/${res.id}?saved=1`);
        router.refresh();
      } else {
        setMessage({ ok: res.ok, text: res.message });
      }
    });
  };

  const topLevel = categories.filter((c) => !c.parentId);
  const childrenOf = (id: number) => categories.filter((c) => c.parentId === id);
  const toggleCat = (id: number) => set("categoryIds", p.categoryIds.includes(id) ? p.categoryIds.filter((c) => c !== id) : [...p.categoryIds, id]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_300px]"
    >
      <div className="min-w-0 space-y-6">
        <section className="admin-card space-y-4 p-5">
          <label className="block text-sm font-medium">
            სახელი (English) *
            <input
              value={p.name}
              required
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className="admin-input mt-1"
            />
          </label>
          <label className="block text-sm font-medium">
            სახელი ქართულად <span className="font-normal text-zinc-500">(თუ ცარიელია, ინგლისური სახელი გამოჩნდება)</span>
            <input value={p.nameKa} onChange={(e) => set("nameKa", e.target.value)} className="admin-input mt-1" />
          </label>
          <label className="block text-sm font-medium">
            URL (slug)
            <div className="mt-1 flex items-center rounded-lg border border-zinc-300 bg-zinc-50 pl-3 text-sm text-zinc-500">
              /product/
              <input
                value={p.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                className="admin-input !rounded-l-none !border-0 !border-l"
              />
            </div>
          </label>
          <div className="flex gap-1 border-b border-zinc-200 pt-2 text-sm">
            {(["en", "ka"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setDescLang(l)}
                className={`-mb-px border-b-2 px-3 py-1.5 ${descLang === l ? "border-zinc-900 font-medium" : "border-transparent text-zinc-500"}`}
              >
                {l === "en" ? "აღწერა: English" : "აღწერა: ქართული"}
              </button>
            ))}
          </div>
          {descLang === "en" ? (
            <>
              <label className="block text-sm font-medium">
                მოკლე აღწერა (EN)
                <textarea value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={3} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                სრული აღწერა (EN)
                <textarea value={p.description} onChange={(e) => set("description", e.target.value)} rows={7} className="admin-input mt-1" />
              </label>
            </>
          ) : (
            <>
              <label className="block text-sm font-medium">
                მოკლე აღწერა (ქართ.)
                <textarea value={p.shortDescriptionKa} onChange={(e) => set("shortDescriptionKa", e.target.value)} rows={3} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                სრული აღწერა (ქართ.)
                <textarea value={p.descriptionKa} onChange={(e) => set("descriptionKa", e.target.value)} rows={7} className="admin-input mt-1" />
              </label>
            </>
          )}
        </section>

        <section className="admin-card p-5">
          <h2 className="mb-4 font-semibold">ფოტოები</h2>
          <ImageUploader value={p.images} onChange={(images) => set("images", images)} />
        </section>

        <section className="admin-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">ფასი და ვარიაციები</h2>
            <div className="flex rounded-lg bg-zinc-100 p-1 text-sm">
              {(["simple", "variable"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-md px-3 py-1.5 ${type === t ? "bg-white shadow-sm" : "text-zinc-600"}`}
                >
                  {t === "simple" ? "მარტივი პროდუქტი" : "ვარიაციებით"}
                </button>
              ))}
            </div>
          </div>

          {type === "simple" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <label className="block text-sm font-medium">
                ფასი ($) *
                <input type="number" step="0.01" min="0" required value={p.price} onChange={(e) => set("price", e.target.value)} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                ფასდაკლებული ფასი
                <input type="number" step="0.01" min="0" value={p.salePrice} onChange={(e) => set("salePrice", e.target.value)} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                მარაგი
                <input type="number" min="0" placeholder="∞" value={p.stock} onChange={(e) => set("stock", e.target.value)} className="admin-input mt-1" />
              </label>
              <label className="block text-sm font-medium">
                SKU
                <input value={p.sku} onChange={(e) => set("sku", e.target.value)} className="admin-input mt-1" />
              </label>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              <AttributesEditor attributes={p.attributes} onChange={setAttributes} />

              {p.variations.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">ვარიაციები ({p.variations.length})</p>
                    <p className="text-xs text-zinc-500">თითოეულ ვარიაციას აქვს საკუთარი ფასი, მარაგი და ფოტო. საიტზე არჩევისას ეს მონაცემები შეიცვლება.</p>
                  </div>
                  <BulkFill onApply={(patch) => set("variations", p.variations.map((v) => ({ ...v, ...patch })))} />
                  {p.variations.map((v, i) => (
                    <div key={JSON.stringify(v.options)} className="rounded-lg border border-zinc-200 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(v.options).map(([k, val]) => {
                            const attr = p.attributes.find((a) => a.name === k);
                            const hex = attr?.type === "color" ? attr.colors?.[val] : undefined;
                            return (
                              <span key={k} className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-2 py-0.5 text-xs">
                                {hex && <span className="size-3 rounded-full ring-1 ring-black/15" style={{ background: hex }} />}
                                {k}: <b>{val}</b>
                              </span>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => setVar(i, { stock: v.stock === "0" ? "" : "0" })}
                          className={`text-xs hover:underline ${v.stock === "0" ? "text-green-700" : "text-zinc-500"}`}
                        >
                          {v.stock === "0" ? "მარაგში დაბრუნება" : "არ არის მარაგში"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[72px_1fr_1fr_1fr_1fr]">
                        <VariationImage image={v.image} gallery={p.images} onPick={(url) => setVar(i, { image: url })} onUpload={(file) => uploadVariationImage(i, file)} />
                        <label className="block text-xs">
                          ფასი ($) *
                          <input type="number" step="0.01" min="0" required value={v.price} onChange={(e) => setVar(i, { price: e.target.value })} className="admin-input mt-1" />
                        </label>
                        <label className="block text-xs">
                          ფასდაკლება
                          <input type="number" step="0.01" min="0" value={v.salePrice} onChange={(e) => setVar(i, { salePrice: e.target.value })} className="admin-input mt-1" />
                        </label>
                        <label className="block text-xs">
                          მარაგი
                          <input type="number" min="0" placeholder="∞" value={v.stock} onChange={(e) => setVar(i, { stock: e.target.value })} className="admin-input mt-1" />
                        </label>
                        <label className="block text-xs">
                          SKU
                          <input value={v.sku} onChange={(e) => setVar(i, { sku: e.target.value })} className="admin-input mt-1" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <section className="admin-card space-y-4 p-5 lg:sticky lg:top-6">
          <label className="block text-sm font-medium">
            სტატუსი
            <select value={p.status} onChange={(e) => set("status", e.target.value as ProductInput["status"])} className="admin-input mt-1">
              <option value="published">გამოქვეყნებული</option>
              <option value="draft">დრაფტი (დამალული)</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} />
            რჩეული პროდუქტი (მთავარ გვერდზე)
          </label>
          {message && <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="admin-btn flex-1">
              {pending ? "ინახება..." : "შენახვა"}
            </button>
            {initial.id && (
              <Link href={`/product/${p.slug}`} target="_blank" className="admin-btn-ghost">
                ნახვა ↗
              </Link>
            )}
          </div>
        </section>

        <section className="admin-card p-5">
          <h2 className="mb-3 font-semibold">კატეგორიები</h2>
          <div className="max-h-[420px] space-y-1.5 overflow-y-auto text-sm">
            {topLevel.map((c) => (
              <div key={c.id}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={p.categoryIds.includes(c.id)} onChange={() => toggleCat(c.id)} />
                  {c.name}
                </label>
                {childrenOf(c.id).map((ch) => (
                  <label key={ch.id} className="ml-6 mt-1.5 flex items-center gap-2 text-zinc-700">
                    <input type="checkbox" checked={p.categoryIds.includes(ch.id)} onChange={() => toggleCat(ch.id)} />
                    {ch.name}
                  </label>
                ))}
              </div>
            ))}
          </div>
          <Link href="/admin/categories" className="mt-3 inline-block text-xs text-zinc-500 hover:underline">
            + კატეგორიების მართვა
          </Link>
        </section>
      </aside>
    </form>
  );
}

/** Attributes (Color, Size, ...) with chip values; colour attributes get a colour picker per value */
function AttributesEditor({
  attributes,
  onChange,
}: {
  attributes: Attribute[];
  onChange: (fn: (attrs: Attribute[]) => Attribute[], rename?: { from: string; to: string }) => void;
}) {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const has = (name: string) => attributes.some((a) => a.name.toLowerCase() === name.toLowerCase());
  const update = (i: number, fn: (a: Attribute) => Attribute) => onChange((list) => list.map((a, j) => (j === i ? fn(a) : a)));

  const addValues = (i: number, raw: string) => {
    const parts = raw.split(",").map((v) => v.trim()).filter(Boolean);
    if (!parts.length) return;
    update(i, (a) => {
      const values = [...a.values];
      const colors = { ...a.colors };
      for (const v of parts) {
        if (values.includes(v)) continue;
        values.push(v);
        if (a.type === "color") colors[v] = knownColors[v.toLowerCase()] ?? "#cccccc";
      }
      return a.type === "color" ? { ...a, values, colors } : { ...a, values };
    });
    setDrafts((d) => ({ ...d, [i]: "" }));
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium">ატრიბუტები</p>
      <p className="mb-3 text-xs text-zinc-500">
        დაამატეთ მაგ. „ფერი“ და „ზომა“, ჩაწერეთ მნიშვნელობები და დააჭირეთ Enter-ს. ყველა კომბინაციის ვარიაცია ავტომატურად შეიქმნება ქვემოთ.
      </p>

      <div className="space-y-3">
        {attributes.map((a, i) => (
          <div key={i} className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={a.name}
                onChange={(e) => {
                  const to = e.target.value;
                  onChange((list) => list.map((x, j) => (j === i ? { ...x, name: to } : x)), { from: a.name, to });
                }}
                placeholder="სახელი (მაგ. Size)"
                className="admin-input w-40"
              />
              <div className="flex rounded-lg bg-zinc-100 p-0.5 text-xs">
                {(["button", "color"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      update(i, (x) =>
                        t === "color"
                          ? { ...x, type: "color", colors: Object.fromEntries(x.values.map((v) => [v, x.colors?.[v] ?? knownColors[v.toLowerCase()] ?? "#cccccc"])) }
                          : { name: x.name, values: x.values },
                      )
                    }
                    className={`rounded-md px-2.5 py-1 ${(a.type ?? "button") === t ? "bg-white shadow-sm" : "text-zinc-600"}`}
                  >
                    {t === "button" ? "ღილაკები" : "ფერები"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onChange((list) => list.filter((_, j) => j !== i))} className="ml-auto text-xs text-red-600 hover:underline">
                ატრიბუტის წაშლა
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {a.values.map((v) => (
                <span key={v} className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-1.5 pr-2 text-sm ring-1 ring-zinc-200">
                  {a.type === "color" ? (
                    <label className="relative size-5 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/15" style={{ background: a.colors?.[v] ?? "#cccccc" }} title="ფერის შეცვლა">
                      <input
                        type="color"
                        value={a.colors?.[v] ?? "#cccccc"}
                        onChange={(e) => update(i, (x) => ({ ...x, colors: { ...x.colors, [v]: e.target.value } }))}
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </label>
                  ) : (
                    <span className="w-0.5" />
                  )}
                  {v}
                  <button
                    type="button"
                    aria-label={`${v} წაშლა`}
                    onClick={() =>
                      update(i, (x) => {
                        const values = x.values.filter((y) => y !== v);
                        if (x.type !== "color") return { ...x, values };
                        const { [v]: _removed, ...colors } = x.colors ?? {};
                        return { ...x, values, colors };
                      })
                    }
                    className="text-zinc-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={drafts[i] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.endsWith(",")) addValues(i, val);
                  else setDrafts((d) => ({ ...d, [i]: val }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addValues(i, drafts[i] ?? "");
                  }
                }}
                onBlur={() => addValues(i, drafts[i] ?? "")}
                placeholder={a.type === "color" ? "+ ფერი (მაგ. Gold)" : "+ მნიშვნელობა (მაგ. 17)"}
                className="admin-input !w-48 !py-1.5"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {!has("Color") && (
          <button type="button" onClick={() => onChange((list) => [...list, { name: "Color", values: [], type: "color", colors: {} }])} className="admin-btn-ghost">
            + ფერი
          </button>
        )}
        {!has("Size") && (
          <button type="button" onClick={() => onChange((list) => [...list, { name: "Size", values: [] }])} className="admin-btn-ghost">
            + ზომა
          </button>
        )}
        <button type="button" onClick={() => onChange((list) => [...list, { name: "", values: [] }])} className="admin-btn-ghost">
          + სხვა ატრიბუტი
        </button>
      </div>
    </div>
  );
}

/** Set price / sale / stock for all variations at once */
function BulkFill({ onApply }: { onApply: (patch: Partial<Variation>) => void }) {
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const apply = () => {
    const patch: Partial<Variation> = {};
    if (price) patch.price = price;
    if (salePrice) patch.salePrice = salePrice;
    if (stock) patch.stock = stock;
    if (Object.keys(patch).length) onApply(patch);
  };
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-lg bg-zinc-50 p-3 text-xs ring-1 ring-zinc-200">
      <span className="mb-2 w-full font-medium text-zinc-700 sm:mb-2.5 sm:w-auto">ყველასთვის ერთად:</span>
      <label className="block">
        ფასი
        <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="admin-input mt-1 !w-24" />
      </label>
      <label className="block">
        ფასდაკლება
        <input type="number" step="0.01" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} className="admin-input mt-1 !w-24" />
      </label>
      <label className="block">
        მარაგი
        <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="admin-input mt-1 !w-20" />
      </label>
      <button type="button" onClick={apply} className="admin-btn-ghost">
        გამოყენება
      </button>
    </div>
  );
}

function VariationImage({
  image,
  gallery,
  onPick,
  onUpload,
}: {
  image: string | null;
  gallery: string[];
  onPick: (url: string | null) => void;
  onUpload: (file: File) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <span className="block text-xs">ფოტო</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex size-[52px] items-center justify-center overflow-hidden rounded-lg bg-zinc-100 text-lg text-zinc-400 ring-1 ring-zinc-200"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          "+"
        )}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg bg-white p-3 shadow-xl ring-1 ring-zinc-200">
          <p className="mb-2 text-xs text-zinc-500">აირჩიეთ პროდუქტის ფოტოებიდან ან ატვირთეთ ახალი</p>
          <div className="grid grid-cols-4 gap-1.5">
            {gallery.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  onPick(url);
                  setOpen(false);
                }}
                className={`aspect-square overflow-hidden rounded ring-2 ${url === image ? "ring-zinc-900" : "ring-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between gap-2">
            <label className="cursor-pointer text-xs text-zinc-700 hover:underline">
              ატვირთვა
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  setOpen(false);
                }}
              />
            </label>
            {image && (
              <button
                type="button"
                onClick={() => {
                  onPick(null);
                  setOpen(false);
                }}
                className="text-xs text-red-600 hover:underline"
              >
                მოხსნა
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
