"use client";

import { landingTheme, type LandingDesign, type LandingSection } from "@/lib/landing-design";

const sectionNames: Record<LandingSection, string> = {
  hero: "Hero slider", products: "Products", about: "About",
};

const themeNames: Record<keyof LandingDesign["theme"], string> = {
  background: "Page background", text: "Page text", accent: "Accent",
  header: "Header background", announcement: "Announcement background",
  announcementText: "Announcement text", about: "About background", aboutText: "About text",
  footer: "Footer background", footerText: "Footer text",
};

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="color" className="h-8 w-10 cursor-pointer" value={value} onChange={(event) => onChange(event.target.value)} />
      <span>{label} <span className="text-xs text-zinc-500">{value}</span></span>
    </label>
  );
}

export function LandingDesignEditor({ design, onChange }: {
  design: LandingDesign; onChange: (update: (current: LandingDesign) => LandingDesign) => void;
}) {
  const set = <K extends keyof LandingDesign>(key: K, value: LandingDesign[K]) =>
    onChange((current) => ({ ...current, [key]: value }));

  function move(section: LandingSection, offset: number) {
    onChange((current) => {
      const sections = [...current.sections];
      const index = sections.indexOf(section);
      const target = index + offset;
      if (target < 0 || target >= sections.length) return current;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, sections };
    });
  }

  return (
    <>
      <section className="admin-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Section order and visibility</h2>
        <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {design.sections.map((section, index) => (
            <li key={section} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!design.hidden.includes(section)} onChange={(event) => {
                  const visible = event.target.checked;
                  onChange((current) => ({
                    ...current,
                    hidden: visible ? current.hidden.filter((item) => item !== section) : [...current.hidden, section],
                  }));
                }} />
                {sectionNames[section]}
              </label>
              <div className="flex gap-1">
                <button type="button" className="admin-btn-ghost disabled:opacity-30" disabled={index === 0} aria-label={`Move ${sectionNames[section]} up`} onClick={() => move(section, -1)}>Move up</button>
                <button type="button" className="admin-btn-ghost disabled:opacity-30" disabled={index === design.sections.length - 1} aria-label={`Move ${sectionNames[section]} down`} onClick={() => move(section, 1)}>Move down</button>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="admin-card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Color theme</h2>
          <button type="button" className="admin-btn-ghost" onClick={() => set("theme", { ...landingTheme })}>Reset colors</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(themeNames) as (keyof typeof themeNames)[]).map((key) => (
            <ColorField key={key} label={themeNames[key]} value={design.theme[key]} onChange={(color) =>
              onChange((current) => ({ ...current, theme: { ...current.theme, [key]: color } }))} />
          ))}
        </div>
      </section>
      <section className="admin-card space-y-4 p-6">
        <h2 className="text-lg font-semibold">Hero appearance</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField label="Overlay color" value={design.overlayColor} onChange={(value) => set("overlayColor", value)} />
          <ColorField label="Hero text color" value={design.heroTextColor} onChange={(value) => set("heroTextColor", value)} />
          <label className="grid gap-1 text-sm">
            <span>Overlay opacity ({design.overlayOpacity}%)</span>
            <input type="range" min={0} max={100} value={design.overlayOpacity} onChange={(event) => set("overlayOpacity", Number(event.target.value))} />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Overlay style</span>
            <select className="admin-input" value={design.overlayStyle} onChange={(event) => set("overlayStyle", event.target.value as LandingDesign["overlayStyle"])}>
              <option value="gradient">Gradient</option><option value="solid">Solid</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>Text alignment</span>
            <select className="admin-input" value={design.heroAlign} onChange={(event) => set("heroAlign", event.target.value as LandingDesign["heroAlign"])}>
              <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>Hero height</span>
            <select className="admin-input" value={design.heroHeight} onChange={(event) => set("heroHeight", event.target.value as LandingDesign["heroHeight"])}>
              <option value="compact">Compact</option><option value="standard">Standard</option><option value="tall">Tall</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>Autoplay interval in seconds (0 pauses autoplay)</span>
            <input className="admin-input" type="number" min={0} max={20} step={1} value={design.autoplaySeconds} onChange={(event) => set("autoplaySeconds", Number(event.target.value))} />
          </label>
        </div>
      </section>
    </>
  );
}
