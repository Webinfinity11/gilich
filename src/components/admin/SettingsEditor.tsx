"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettingsInput } from "@/lib/settings";
import { SingleImage } from "./SingleImage";

type TextKey = { [K in keyof SiteSettingsInput]: SiteSettingsInput[K] extends string ? K : never }[keyof SiteSettingsInput];

const tabs = [
  { id: "header", label: "Header" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
  { id: "about", label: "About us" },
  { id: "pages", label: "Other pages" },
] as const;

export function SettingsEditor({ initial }: { initial: SiteSettingsInput }) {
  const [s, setS] = useState(initial);
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("header");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (key: TextKey, value: string) => setS((prev) => ({ ...prev, [key]: value }));

  const field = (key: TextKey, label: string, opts: { rows?: number; placeholder?: string; hint?: string; type?: string } = {}) => (
    <label className="block text-sm font-medium">
      {label}
      {opts.rows ? (
        <textarea rows={opts.rows} value={s[key]} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value)} className="admin-input mt-1" />
      ) : (
        <input type={opts.type ?? "text"} value={s[key]} placeholder={opts.placeholder} onChange={(e) => set(key, e.target.value)} className="admin-input mt-1" />
      )}
      {opts.hint && <span className="mt-1 block text-xs font-normal text-zinc-500">{opts.hint}</span>}
    </label>
  );

  /** Georgian (shown on /ka-ge) first, English (shown on /) second */
  const pair = (en: TextKey, ka: TextKey, label: string, opts: { rows?: number; hint?: string } = {}) => (
    <div className="grid gap-4 md:grid-cols-2">
      {field(ka, `${label} — Georgian site`, { ...opts, hint: opts.hint ?? "Empty = English text is shown" })}
      {field(en, `${label} — English site`, opts)}
    </div>
  );

  const image = (key: TextKey, label: string, aspect: string, hint?: string, dark?: boolean) => (
    <div>
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className={dark ? "rounded-lg bg-zinc-800 p-3" : ""}>
        <SingleImage value={s[key]} onChange={(url) => set(key, url)} aspect={aspect} />
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const res = await saveSettings(s);
      setMessage({ ok: res.ok, text: res.message });
    });

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-zinc-200 text-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 ${tab === t.id ? "border-zinc-900 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="admin-card space-y-5 p-5">
        {tab === "header" && (
          <>
            <div className="max-w-xs">{image("logo", "Logo", "aspect-[3/1]", "PNG with a transparent background")}</div>
            {pair("announcement", "announcementKa", "Announcement bar", {
              hint: "e.g. Free delivery in Tbilisi. Empty = bar is hidden",
            })}
          </>
        )}

        {tab === "contact" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {field("phone", "Phone *", { placeholder: "+995 5XX XX XX XX" })}
              {field("email", "Email *", { type: "email" })}
            </div>
            {pair("address", "addressKa", "Address")}
            <div className="grid gap-4 md:grid-cols-2">
              {field("instagram", "Instagram link", { placeholder: "https://www.instagram.com/..." })}
              {field("facebook", "Facebook link", { placeholder: "https://www.facebook.com/..." })}
            </div>
            {field("mapQuery", "Map (on the contact page)", {
              hint: "Type the address or place name as you would search for it in Google Maps. Empty = no map",
            })}
          </>
        )}

        {tab === "footer" && (
          <>
            <div className="max-w-xs">{image("logoWhite", "Footer logo (white)", "aspect-[3/1]", undefined, true)}</div>
            {pair("footerText", "footerTextKa", "Bottom text (copyright)")}
            <p className="text-xs text-zinc-500">The address, phone, email and social links in the footer come from the Contact tab.</p>
          </>
        )}

        {tab === "about" && (
          <>
            {pair("aboutTitle", "aboutTitleKa", "Title")}
            {pair("aboutText", "aboutTextKa", "Text", { rows: 8, hint: "Separate paragraphs with an empty line. The home page shows the first 2 paragraphs" })}
            <div className="grid gap-5 md:grid-cols-2">
              {image("aboutImage", "Top image", "aspect-[870/577]")}
              {image("contactImage", "Bottom image (next to the contact details)", "aspect-[870/577]")}
            </div>
            {pair("reasonsTitle", "reasonsTitleKa", "Reasons title")}
            {s.reasons.map((r, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-semibold">Reason {i + 1}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(["titleKa", "title"] as const).map((k) => (
                    <label key={k} className="block text-sm">
                      {k === "title" ? "Title — English site" : "Title — Georgian site"}
                      <input
                        value={r[k]}
                        onChange={(e) => setS((prev) => ({ ...prev, reasons: prev.reasons.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }))}
                        className="admin-input mt-1"
                      />
                    </label>
                  ))}
                  {(["textKa", "text"] as const).map((k) => (
                    <label key={k} className="block text-sm">
                      {k === "text" ? "Text — English site" : "Text — Georgian site"}
                      <textarea
                        rows={4}
                        value={r[k]}
                        onChange={(e) => setS((prev) => ({ ...prev, reasons: prev.reasons.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }))}
                        className="admin-input mt-1"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "pages" && (
          <>
            <div className="max-w-xl">{image("pageBanner", "Inner page banner background", "aspect-[4/1]", "Shown behind the page title: About us, Contact, Shop, etc.")}</div>
            {pair("terms", "termsKa", "Terms & conditions", { rows: 12, hint: "Paragraphs separated by an empty line; start a line with “## ” for a heading" })}
            {pair("privacy", "privacyKa", "Privacy policy", { rows: 12, hint: "Paragraphs separated by an empty line; start a line with “## ” for a heading" })}
          </>
        )}
      </section>

      <div className="sticky bottom-0 mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-zinc-50/95 py-4 backdrop-blur">
        <button type="button" onClick={save} disabled={pending} className="admin-btn">
          {pending ? "Saving..." : "Save"}
        </button>
        {message && <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
        <span className="text-xs text-zinc-500">All tabs are saved together</span>
      </div>
    </div>
  );
}
