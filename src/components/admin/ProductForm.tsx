"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct, uploadImages, type ProductInput, type VariationInput } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import { ImageUploader } from "./ImageUploader";

type Category = { id: number; name: string; parentId: number | null };

const emptyVariation = (): VariationInput => ({ name: "", color: "", sku: "", price: "", salePrice: "", stock: "", inStock: true, images: [] });

export function ProductForm({ initial, categories, saved }: { initial: ProductInput; categories: Category[]; saved?: boolean }) {
  const router = useRouter();
  const [p, setP] = useState<ProductInput>(initial);
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(saved ? { ok: true, text: "შენახულია" } : null);
  const [pending, startTransition] = useTransition();
  const [descLang, setDescLang] = useState<"en" | "ka">("en");

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setP((prev) => ({ ...prev, [key]: value }));
  const setVariations = (fn: (list: VariationInput[]) => VariationInput[]) => setP((prev) => ({ ...prev, variations: fn(prev.variations) }));
  const setVar = (i: number, patch: Partial<VariationInput>) => setVariations((list) => list.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const moveVar = (i: number, to: number) =>
    setVariations((list) => {
      if (to < 0 || to >= list.length) return list;
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(to, 0, item);
      return next;
    });

  const submit = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveProduct(p);
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
          <h2 className="mb-4 font-semibold">სურათები</h2>
          <ImageUploader value={p.images} onChange={(images) => set("images", images)} />
        </section>

        <section className="admin-card p-5">
          <h2 className="font-semibold">მთავარი პროდუქტი</h2>
          <p className="mt-1 text-sm text-zinc-500">საიტზე ჯერ მთავარი პროდუქტი ჩანს ამ ფასით და ზედა ფოტოებით. ვარიაციის არჩევისას ფასი და ფოტოები შეიცვლება.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <label className="block text-sm font-medium">
              ფასი ($) *
              <input type="number" step="0.01" min="0" required value={p.price} onChange={(e) => set("price", e.target.value)} className="admin-input mt-1" />
            </label>
            <label className="block text-sm font-medium">
              ფასდაკლებით
              <input type="number" step="0.01" min="0" placeholder="არა" value={p.salePrice} onChange={(e) => set("salePrice", e.target.value)} className="admin-input mt-1" />
            </label>
                <label className="block text-sm font-medium">
                  მარაგი (ც.)
                  <input type="number" min="0" placeholder="არ ითვლება" value={p.stock} onChange={(e) => set("stock", e.target.value)} className="admin-input mt-1" />
                </label>
                <label className="block text-sm font-medium">
                  SKU / კოდი
                  <input value={p.sku} onChange={(e) => set("sku", e.target.value)} className="admin-input mt-1" />
                </label>
          </div>
        </section>

        <section className="admin-card p-5">
          <h2 className="font-semibold">ფერები / ვარიაციები ({p.variations.length})</h2>
          <p className="mt-2 text-sm text-zinc-500">
            ცარიელი ფასი = პროდუქტის ფასი. ცარიელი მარაგი = არ ითვლება. თუ ვარიაციას ფოტო არ აქვს, პროდუქტის ფოტო ჩანს.
          </p>

          <div className="mt-4 space-y-4">
            {p.variations.map((v, i) => (
              <VariationCard
                key={v.id ?? `new-${i}`}
                index={i}
                total={p.variations.length}
                v={v}
                productPrice={p.price}
                productImages={p.images}
                onChange={(patch) => setVar(i, patch)}
                onMove={(to) => moveVar(i, to)}
                onDuplicate={() => setVariations((list) => [...list.slice(0, i + 1), { ...v, id: undefined, name: `${v.name} (ასლი)`, sku: "" }, ...list.slice(i + 1)])}
                onRemove={() => setVariations((list) => list.filter((_, j) => j !== i))}
                onError={(text) => setMessage({ ok: false, text })}
              />
            ))}
          </div>

          <button type="button" onClick={() => setVariations((list) => [...list, emptyVariation()])} className="admin-btn-ghost mt-4">
            + ვარიაციის დამატება
          </button>
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

const iconBtn = "flex size-10 items-center justify-center rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 disabled:opacity-30";

function VariationCard({
  index,
  total,
  v,
  productPrice,
  productImages,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onError,
}: {
  index: number;
  total: number;
  v: VariationInput;
  productPrice: string;
  productImages: string[];
  onChange: (patch: Partial<VariationInput>) => void;
  onMove: (to: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onError: (text: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);

  const upload = async (files: FileList) => {
    setBusy(true);
    const urls: string[] = [];
    for (const file of [...files]) {
      const fd = new FormData();
      fd.append("files", file);
      const res = await uploadImages(fd);
      if (res.error) onError(res.error);
      urls.push(...res.urls);
    }
    onChange({ images: [...v.images, ...urls] });
    setBusy(false);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= v.images.length) return;
    const next = [...v.images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ images: next });
  };

  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-sm text-zinc-400">{index + 1}.</span>
        <label
          title="ფერი"
          className="relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-zinc-300"
          style={
            v.color
              ? { background: v.color }
              : { backgroundImage: "repeating-conic-gradient(#e4e4e7 0% 25%, #fff 0% 50%)", backgroundSize: "10px 10px" }
          }
        >
          <input type="color" value={v.color || "#cccccc"} onChange={(e) => onChange({ color: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <input value={v.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="სახელი, მაგ. Rose Gold" required className="admin-input min-w-0 flex-1 !py-2.5 font-semibold" />
        <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} className={iconBtn} aria-label="ზემოთ">
          ↑
        </button>
        <button type="button" onClick={() => onMove(index + 1)} disabled={index === total - 1} className={iconBtn} aria-label="ქვემოთ">
          ↓
        </button>
        <button type="button" onClick={onDuplicate} className={iconBtn} aria-label="დუბლირება" title="დუბლირება">
          ⧉
        </button>
        <button type="button" onClick={onRemove} className={`${iconBtn} border-red-200 text-red-600 hover:bg-red-50`} aria-label="წაშლა" title="წაშლა">
          ✕
        </button>
      </div>
      {v.color && (
        <button type="button" onClick={() => onChange({ color: "" })} className="ml-[88px] mt-1 text-xs text-zinc-500 hover:underline">
          ფერის მოხსნა
        </button>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="block text-xs text-zinc-600">
          ფასი ($)
          <input type="number" step="0.01" min="0" placeholder={productPrice || "პროდუქტის ფასი"} value={v.price} onChange={(e) => onChange({ price: e.target.value })} className="admin-input mt-1" />
        </label>
        <label className="block text-xs text-zinc-600">
          ფასდაკლებით
          <input type="number" step="0.01" min="0" placeholder="არა" value={v.salePrice} onChange={(e) => onChange({ salePrice: e.target.value })} className="admin-input mt-1" />
        </label>
        <label className="block text-xs text-zinc-600">
          მარაგი (ც.)
          <input type="number" min="0" placeholder="არ ითვლება" disabled={!v.inStock} value={v.stock} onChange={(e) => onChange({ stock: e.target.value })} className="admin-input mt-1 disabled:opacity-50" />
        </label>
        <label className="block text-xs text-zinc-600">
          SKU / კოდი
          <input value={v.sku} onChange={(e) => onChange({ sku: e.target.value })} className="admin-input mt-1" />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={v.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} className="size-4" />
          მარაგშია
        </label>
        {productImages.length > 0 && (
          <button type="button" onClick={() => setPicking((x) => !x)} className="font-medium text-blue-700 hover:underline">
            პროდუქტის ფოტოდან არჩევა
          </button>
        )}
      </div>

      {picking && (
        <div className="mt-3 flex flex-wrap gap-2 rounded-lg bg-zinc-50 p-2 ring-1 ring-zinc-200">
          {productImages.map((url) => {
            const on = v.images.includes(url);
            return (
              <button
                key={url}
                type="button"
                onClick={() => onChange({ images: on ? v.images.filter((u) => u !== url) : [...v.images, url] })}
                className={`size-14 overflow-hidden rounded-md ring-2 ${on ? "ring-blue-600" : "ring-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3">
        {v.images.map((url, i) => (
          <div key={url} className="group relative size-20 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-zinc-900 px-1 text-[9px] text-white">მთავარი</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 text-xs text-white opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => moveImage(i, i - 1)} className="px-1.5" aria-label="მარცხნივ">
                ←
              </button>
              <button type="button" onClick={() => onChange({ images: v.images.filter((u) => u !== url) })} className="px-1.5" aria-label="წაშლა">
                ×
              </button>
              <button type="button" onClick={() => moveImage(i, i + 1)} className="px-1.5" aria-label="მარჯვნივ">
                →
              </button>
            </div>
          </div>
        ))}
        <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-500">
          {busy ? "იტვირთება..." : "+ ფოტო"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => {
              if (e.target.files?.length) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
