"use client";

import { useState, useTransition } from "react";
import { deleteAttribute, saveAttribute, type AttributeInput } from "@/app/admin/actions";

const blank = (): AttributeInput => ({ name: "", nameKa: "", values: [], valuesKa: {} });

/** Attributes like "Carat" with their values; values are then picked on each product variation */
export function AttributesEditor({ attributes }: { attributes: (AttributeInput & { id: number })[] }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {attributes.map((a) => (
        <AttributeCard key={`${a.id}-${a.name}-${JSON.stringify([a.values, a.valuesKa])}`} initial={a} />
      ))}
      <AttributeCard key={`new-${attributes.length}`} initial={blank()} />
    </div>
  );
}

function AttributeCard({ initial }: { initial: AttributeInput }) {
  const [a, setA] = useState(initial);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const isNew = !initial.id;

  const addValues = () => {
    // "0.5, 1, 1.5" adds three values at once
    const parts = draft.split(",").map((v) => v.trim()).filter((v) => v && !a.values.includes(v));
    if (parts.length) setA((prev) => ({ ...prev, values: [...prev.values, ...parts] }));
    setDraft("");
  };

  const save = () => {
    setMessage(null);
    const values = draft.trim() ? [...a.values, ...draft.split(",").map((v) => v.trim())] : a.values;
    startTransition(async () => {
      const res = await saveAttribute({ ...a, values });
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok) {
        setDraft("");
        if (isNew) setA(blank());
      }
    });
  };

  return (
    <section className="admin-card space-y-4 p-5">
      <h2 className="font-semibold">{isNew ? "New attribute" : initial.name}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Name (English) *
          <input value={a.name} onChange={(e) => setA({ ...a, name: e.target.value })} placeholder="e.g. Carat" className="admin-input mt-1" />
        </label>
        <label className="block text-sm font-medium">
          Name (Georgian)
          <input value={a.nameKa} onChange={(e) => setA({ ...a, nameKa: e.target.value })} placeholder="მაგ. კარატი" className="admin-input mt-1" />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium">Values</p>
        <div className="mt-2 space-y-2">
          {a.values.length > 0 && (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-zinc-500">
              <span>English</span>
              <span>Georgian (if empty, English is shown)</span>
              <span className="w-[76px]" />
            </div>
          )}
          {a.values.map((v, i) => (
            <div key={v} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
              <span className="truncate rounded-lg bg-zinc-100 px-3 py-2 text-sm ring-1 ring-zinc-200">{v}</span>
              <input
                value={a.valuesKa[v] ?? ""}
                onChange={(e) => setA({ ...a, valuesKa: { ...a.valuesKa, [v]: e.target.value } })}
                placeholder={v}
                className="admin-input min-w-0"
              />
              <div className="flex w-[76px] gap-1">
                <button type="button" onClick={() => setA({ ...a, values: swap(a.values, i, i - 1) })} disabled={i === 0} className="flex size-9 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 disabled:opacity-30" aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => setA({ ...a, values: a.values.filter((x) => x !== v) })} className="flex size-9 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label={`Remove ${v}`}>
                  ×
                </button>
              </div>
            </div>
          ))}
          {!a.values.length && <span className="text-sm text-zinc-500">No values yet</span>}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addValues();
              }
            }}
            placeholder="New value in English, e.g. 0.5 (comma for several)"
            className="admin-input min-w-0 flex-1"
          />
          <button type="button" onClick={addValues} className="admin-btn-ghost">
            + Add
          </button>
        </div>
      </div>

      {message && <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="admin-btn">
          {pending ? "Saving..." : isNew ? "Create attribute" : "Save"}
        </button>
        {!isNew && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(`Delete "${initial.name}"? Variations keep their names, the field disappears.`)) startTransition(() => deleteAttribute(initial.id!));
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </section>
  );
}

function swap<T>(list: T[], i: number, j: number) {
  const next = [...list];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}
