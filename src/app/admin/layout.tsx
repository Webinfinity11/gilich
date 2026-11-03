import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import "../globals.css";

const georgian = Noto_Sans_Georgian({ subsets: ["georgian", "latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "ადმინ პანელი", template: "%s – ადმინი" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body className={`${georgian.className} min-h-full bg-zinc-100 text-zinc-900`}>{children}</body>
    </html>
  );
}
