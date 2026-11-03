"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettingsInput } from "@/lib/settings";
import { SingleImage } from "./SingleImage";

type TextKey = { [K in keyof SiteSettingsInput]: SiteSettingsInput[K] extends string ? K : never }[keyof SiteSettingsInput];

const tabs = [
  { id: "header", label: "ჰედერი" },
  { id: "contact", label: "კონტაქტი" },
  { id: "footer", label: "ფუტერი" },
  { id: "about", label: "ჩვენ შესახებ" },
  { id: "pages", label: "სხვა გვერდები" },
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
      {field(ka, `${label} — ქართული საიტი`, { ...opts, hint: opts.hint ?? "ცარიელი = ინგლისური ტექსტი" })}
      {field(en, `${label} — ინგლისური საიტი`, opts)}
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
            <div className="max-w-xs">{image("logo", "ლოგო", "aspect-[3/1]", "PNG გამჭვირვალე ფონით")}</div>
            {pair("announcement", "announcementKa", "ზედა განცხადების ზოლი", {
              hint: "მაგ.: უფასო მიწოდება თბილისში. ცარიელი = ზოლი არ ჩანს",
            })}
          </>
        )}

        {tab === "contact" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {field("phone", "ტელეფონი *", { placeholder: "+995 5XX XX XX XX" })}
              {field("email", "ელფოსტა *", { type: "email" })}
            </div>
            {pair("address", "addressKa", "მისამართი")}
            <div className="grid gap-4 md:grid-cols-2">
              {field("instagram", "Instagram ბმული", { placeholder: "https://www.instagram.com/..." })}
              {field("facebook", "Facebook ბმული", { placeholder: "https://www.facebook.com/..." })}
            </div>
            {field("mapQuery", "რუკა (კონტაქტის გვერდზე)", {
              hint: "ჩაწერეთ მისამართი ან ადგილის სახელი ისე, როგორც Google Maps-ში ეძებდით. ცარიელი = რუკა არ ჩანს",
            })}
          </>
        )}

        {tab === "footer" && (
          <>
            <div className="max-w-xs">{image("logoWhite", "ფუტერის ლოგო (თეთრი)", "aspect-[3/1]", undefined, true)}</div>
            {pair("footerText", "footerTextKa", "ქვედა ტექსტი (copyright)")}
            <p className="text-xs text-zinc-500">მისამართი, ტელეფონი, ელფოსტა და სოციალური ქსელები ფუტერში „კონტაქტის“ ჩანართიდან მოდის.</p>
          </>
        )}

        {tab === "about" && (
          <>
            {pair("aboutTitle", "aboutTitleKa", "სათაური")}
            {pair("aboutText", "aboutTextKa", "ტექსტი", { rows: 8, hint: "აბზაცები გამოყავით ცარიელი ხაზით. მთავარ გვერდზე პირველი 2 აბზაცი ჩანს" })}
            <div className="grid gap-5 md:grid-cols-2">
              {image("aboutImage", "ზედა ფოტო", "aspect-[870/577]")}
              {image("contactImage", "ქვედა ფოტო (კონტაქტის გვერდით)", "aspect-[870/577]")}
            </div>
            {pair("reasonsTitle", "reasonsTitleKa", "უპირატესობების სათაური")}
            {s.reasons.map((r, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-zinc-200 p-4">
                <p className="text-sm font-semibold">უპირატესობა {i + 1}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {(["titleKa", "title"] as const).map((k) => (
                    <label key={k} className="block text-sm">
                      {k === "title" ? "სათაური — ინგლისური საიტი" : "სათაური — ქართული საიტი"}
                      <input
                        value={r[k]}
                        onChange={(e) => setS((prev) => ({ ...prev, reasons: prev.reasons.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) }))}
                        className="admin-input mt-1"
                      />
                    </label>
                  ))}
                  {(["textKa", "text"] as const).map((k) => (
                    <label key={k} className="block text-sm">
                      {k === "text" ? "ტექსტი — ინგლისური საიტი" : "ტექსტი — ქართული საიტი"}
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
            <div className="max-w-xl">{image("pageBanner", "შიდა გვერდების ბანერის ფონი", "aspect-[4/1]", "ჩანს სათაურის უკან: ჩვენ შესახებ, კონტაქტი, მაღაზია და ა.შ.")}</div>
            {pair("terms", "termsKa", "წესები და პირობები", { rows: 12, hint: "აბზაცები ცარიელი ხაზით; სათაური ხაზის დასაწყისში „## “" })}
            {pair("privacy", "privacyKa", "კონფიდენციალურობის პოლიტიკა", { rows: 12, hint: "აბზაცები ცარიელი ხაზით; სათაური ხაზის დასაწყისში „## “" })}
          </>
        )}
      </section>

      <div className="sticky bottom-0 mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-200 bg-zinc-50/95 py-4 backdrop-blur">
        <button type="button" onClick={save} disabled={pending} className="admin-btn">
          {pending ? "ინახება..." : "შენახვა"}
        </button>
        {message && <p className={`text-sm ${message.ok ? "text-green-700" : "text-red-600"}`}>{message.text}</p>}
        <span className="text-xs text-zinc-500">ყველა ჩანართი ერთად ინახება</span>
      </div>
    </div>
  );
}
