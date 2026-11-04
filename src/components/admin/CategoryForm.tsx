"use client";

import { useActionState } from "react";
import { saveCategory } from "@/app/admin/actions";

type Category = { id: number; name: string; nameKa: string | null; descriptionKa: string | null; slug: string; parentId: number | null; image: string | null; description: string | null; sortOrder: number };

export function CategoryForm({ category, parents }: { category: Category | null; parents: { id: number; name: string }[] }) {
  const [state, action, pending] = useActionState(saveCategory, null);

  return (
    <form action={action} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <input type="hidden" name="currentImage" value={category?.image ?? ""} />
      <label className="block text-sm font-medium">
        Name (English) *
        <input name="name" required defaultValue={category?.name} className="admin-input mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Name (Georgian)
        <input name="nameKa" defaultValue={category?.nameKa ?? ""} className="admin-input mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Slug (empty = automatic)
        <input name="slug" defaultValue={category?.slug} className="admin-input mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Parent category
        <select name="parentId" defaultValue={category?.parentId ?? ""} className="admin-input mt-1">
          <option value="">— None (top level) —</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Description (English)
        <textarea name="description" rows={3} defaultValue={category?.description ?? ""} className="admin-input mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Description (Georgian)
        <textarea name="descriptionKa" rows={3} defaultValue={category?.descriptionKa ?? ""} className="admin-input mt-1" />
      </label>
      <label className="block text-sm font-medium">
        Sort order
        <input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className="admin-input mt-1" />
      </label>
      <div className="text-sm font-medium">
        Image
        {category?.image && (
          <div className="mt-2 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={category.image} alt="" className="size-16 rounded object-cover ring-1 ring-zinc-200" />
            <label className="flex items-center gap-1.5 text-xs font-normal text-red-600">
              <input type="checkbox" name="removeImage" /> Remove image
            </label>
          </div>
        )}
        <input name="image" type="file" accept="image/*" className="mt-2 block w-full text-sm font-normal" />
      </div>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="admin-btn w-full">
        {pending ? "Saving..." : category ? "Save" : "Add"}
      </button>
    </form>
  );
}
