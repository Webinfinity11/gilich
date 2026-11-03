"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct, uploadImages, type ProductInput } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { ImageUploader } from "./ImageUploader";

type Category = { id: number; name: string; parentId: number | null };
type Variation = ProductInput["variations"][number];

/** All combinations of attribute values, e.g. Size × Color */
function combinations(attrs: ProductInput["attributes"]): Record<string, string>[] {
  return attrs.reduce<Record<string, string>[]>(
    (acc, a) => acc.flatMap((combo) => a.values.map((v) => ({ ...combo, [a.name]: v }))),
    [{}],
  );
}

const sameOptions = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);

export function ProductForm({ initial, categories, saved }: { initial: ProductInput; categories: Category[]; saved?: boolean }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(saved ? { ok: true, text: "შენახულია" } : null);
  const [pending, startTransition] = useTransition();
  const [descLang, setDescLang] = useState<"en" | "ka">("en");
  const [type, setType] = useState<"simple" | "variable">(initial.variations.length ? "variable" : "simple");
  // Raw text of attribute values while typing ("6, 7, 8")
  const [valueText, setValueText] = useState<string[]>(initial.attributes.map((a) => a.values.join(", ")));

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setP((prev) => ({ ...prev, [key]: value }));

  const setAttr = (i: number, patch: Partial<{ name: string; text: string }>) => {
    if (patch.text !== undefined) setValueText((t) => t.map((x, j) => (j === i ? patch.text! : x)));
    setP((prev) => ({
      ...prev,
      attributes: prev.attributes.map((a, j) =>
        j === i
          ? {
              name: patch.name ?? a.name,
              values: patch.text !== undefined ? patch.text.split(",").map((v) => v.trim()).filter(Boolean) : a.values,
            }
          : a,
      ),
    }));
  };

  const generate = () => {
    const attrs = p.attributes.filter((a) => a.name.trim() && a.values.length);
    if (!attrs.length) return setMessage({ ok: false, text: "ჯერ დაამატეთ ატრიბუტი და მნიშვნელობები" });
    const combos = combinations(attrs);
    const next: Variation[] = combos.map(
      (options) =>
        p.variations.find((v) => sameOptions(v.options, options)) ?? {
          options,
          sku: "",
          price: p.price,
          salePrice: "",
          stock: "",
          image: null,
        },
    );
    set("variations", next);
    setMessage(null);
  };

  const setVar = (i: number, patch: Partial<Variation>) =>
    set(
      "variations",
      p.variations.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    );

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
  const toggleCat = (id: number) =>
    set("categoryIds", p.categoryIds.includes(id) ? p.categoryIds.filter((c) => c !== id) : [...p.categoryIds, id]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_300px]"
    >
      <div className="space-y-6">
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
          <label className="block text-sm font-medium">
            სახელი ქართულად <span className="font-normal text-zinc-500">(ცარიელი = ინგლისური სახელი)</span>
            <input value={p.nameKa} onChange={(e) => set("nameKa", e.target.value)} className="admin-input mt-1" />
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
              <div>
                <p className="mb-2 text-sm font-medium">ატრიბუტები</p>
                <p className="mb-3 text-xs text-zinc-500">მაგ.: „ზომა“ → 6, 7, 8 ან „ფერი“ → ოქრო, ვერცხლი. მნიშვნელობები გამოყავით მძიმით.</p>
                <div className="space-y-2">
                  {p.attributes.map((a, i) => (
                    <div key={i} className="flex flex-wrap gap-2">
                      <input value={a.name} onChange={(e) => setAttr(i, { name: e.target.value })} placeholder="სახელი (Size)" className="admin-input w-40" />
                      <input
                        value={valueText[i] ?? ""}
                        onChange={(e) => setAttr(i, { text: e.target.value })}
                        placeholder="მნიშვნელობები: 6, 7, 8"
                        className="admin-input min-w-0 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setValueText((t) => t.filter((_, j) => j !== i));
                          set("attributes", p.attributes.filter((_, j) => j !== i));
                        }}
                        className="admin-btn-ghost text-red-600"
                      >
                        წაშლა
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValueText((t) => [...t, ""]);
                      set("attributes", [...p.attributes, { name: "", values: [] }]);
                    }}
                    className="admin-btn-ghost"
                  >
                    + ატრიბუტი
                  </button>
                  <button type="button" onClick={generate} className="admin-btn">
                    ვარიაციების გენერირება
                  </button>
                </div>
              </div>

              {p.variations.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">ვარიაციები ({p.variations.length})</p>
                  {p.variations.map((v, i) => (
                    <div key={i} className="rounded-lg border border-zinc-200 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(v.options).map(([k, val]) => (
                            <span key={k} className="rounded bg-zinc-100 px-2 py-0.5 text-xs">
                              {k}: <b>{val}</b>
                            </span>
                          ))}
                        </div>
                        <button type="button" onClick={() => set("variations", p.variations.filter((_, j) => j !== i))} className="text-xs text-red-600 hover:underline">
                          წაშლა
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[72px_1fr_1fr_1fr_1fr]">
                        <VariationImage
                          image={v.image}
                          gallery={p.images}
                          onPick={(url) => setVar(i, { image: url })}
                          onUpload={(file) => uploadVariationImage(i, file)}
                        />
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
            რჩეული პროდუქტი (Featured)
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
