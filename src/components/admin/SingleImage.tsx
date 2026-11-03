"use client";

import { useRef, useState } from "react";
import { uploadImages } from "@/app/admin/actions";

/** One image with upload / replace. */
export function SingleImage({ value, onChange, aspect = "aspect-[16/9]" }: { value: string; onChange: (url: string) => void; aspect?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("files", file);
    const res = await uploadImages(fd);
    if (res.error) setError(res.error);
    else if (res.urls[0]) onChange(res.urls[0]);
    setBusy(false);
  };

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) upload(f);
        }}
        className={`group relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200 ${aspect}`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white opacity-0 transition group-hover:opacity-100">
              {busy ? "იტვირთება..." : "ფოტოს შეცვლა"}
            </span>
          </>
        ) : (
          <span className="text-sm text-zinc-500">{busy ? "იტვირთება..." : "+ ფოტოს ატვირთვა"}</span>
        )}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
