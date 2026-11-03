"use client";

import { useRef, useState } from "react";
import { uploadImages } from "@/app/admin/actions";

/** Upload + reorder + remove product photos. The first photo is the main one. */
export function ImageUploader({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const upload = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    setError(null);
    const urls: string[] = [];
    // One request per file keeps each body well under the 4.5 MB serverless limit
    for (const file of list) {
      const fd = new FormData();
      fd.append("files", file);
      const res = await uploadImages(fd);
      if (res.error) setError(res.error);
      urls.push(...res.urls);
    }
    onChange([...value, ...urls]);
    setBusy(false);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className="group relative aspect-square cursor-move overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white">მთავარი</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
              <button type="button" onClick={() => move(i, i - 1)} className="px-1.5 text-white" aria-label="მარცხნივ">
                ←
              </button>
              <button type="button" onClick={() => onChange(value.filter((u) => u !== url))} className="px-1.5 text-xs text-white" aria-label="წაშლა">
                წაშლა
              </button>
              <button type="button" onClick={() => move(i, i + 1)} className="px-1.5 text-white" aria-label="მარჯვნივ">
                →
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
          }}
          className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-800"
        >
          <span className="text-2xl">+</span>
          {busy ? "იტვირთება..." : "ფოტოს დამატება"}
        </button>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) upload(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-zinc-500">გადაათრიეთ ფოტოები თანმიმდევრობის შესაცვლელად. მაქს. 4 MB თითო ფოტო.</p>
    </div>
  );
}
