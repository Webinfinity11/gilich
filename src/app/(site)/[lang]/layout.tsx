import type { Metadata } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import "../../globals.css";
import { CartNotice } from "@/components/site/CartNotice";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { LangProvider } from "@/components/site/lang";
import { RevealObserver } from "@/components/site/RevealObserver";
import { StoreProvider } from "@/components/site/store";
import { SiteInfoProvider } from "@/components/site/SiteInfo";
import { getDict, isLang, LANGS, localePath } from "@/lib/i18n";
import { getSiteInfo } from "@/lib/settings";

// Google Sans has no Georgian glyphs; Noto Sans Georgian fills them in
const georgian = Noto_Sans_Georgian({ subsets: ["georgian"], weight: ["300", "400", "500", "600"], variable: "--font-georgian" });

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "https://gilich.jewelry"),
    title: { default: "Gilich Jewelry", template: "%s – Gilich Jewelry" },
    description: getDict(lang).meta.description,
    alternates: { languages: { en: localePath("en", "/"), ka: localePath("ka-ge", "/") } },
  };
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const info = await getSiteInfo(lang);

  return (
    <html lang={lang === "ka-ge" ? "ka" : "en"} className={`h-full antialiased ${georgian.variable}`}>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes on <body> before hydration */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <LangProvider lang={lang}>
          <SiteInfoProvider info={info}>
          <StoreProvider>
            <Suspense fallback={<div className="h-[72px] border-b border-line md:h-[88px]" />}>
              <Header />
            </Suspense>
            {/* overflow-x-clip: slide-in reveals start up to 48px past the screen edge; without it phones can drag the page sideways */}
            <main className="flex-1 overflow-x-clip">
              <Suspense fallback={<div className="min-h-[60vh]" />}>{children}</Suspense>
            </main>
            <Footer lang={lang} info={info} />
            <CartNotice />
            <RevealObserver />
          </StoreProvider>
          </SiteInfoProvider>
        </LangProvider>
      </body>
    </html>
  );
}
