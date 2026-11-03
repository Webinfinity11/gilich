"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "დაფა", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
  { href: "/admin/home", label: "მთავარი გვერდი", icon: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4" },
  { href: "/admin/orders", label: "შეკვეთები", icon: "M6 3h12l1 4H5l1-4zM5 7h14v13H5zM9 11h6" },
  { href: "/admin/products", label: "პროდუქცია", icon: "M12 3 3 7.5 12 12l9-4.5L12 3zM3 7.5V17l9 4.5 9-4.5V7.5" },
  { href: "/admin/categories", label: "კატეგორიები", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
  { href: "/admin/messages", label: "შეტყობინებები", icon: "M4 5h16v11H8l-4 4V5z" },
  { href: "/admin/settings", label: "საიტის პარამეტრები", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-semibold">Gilich ადმინი</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="admin-btn-ghost" aria-expanded={open}>
          მენიუ
        </button>
      </div>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-200 bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link href="/admin" className="flex items-center gap-3 border-b border-zinc-200 px-5 py-4" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/454470656_10161485103478908_9128196228993434540_n1-1.png" alt="" className="h-9 w-auto" />
          <span className="text-sm font-semibold">ადმინ პანელი</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active(item.href) ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
            >
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-zinc-200 p-3">
          <a href="/" target="_blank" className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
            საიტის ნახვა ↗
          </a>
          <form action={logout}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100">
              გასვლა
            </button>
          </form>
        </div>
      </aside>
      {open && <button type="button" aria-label="დახურვა" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
