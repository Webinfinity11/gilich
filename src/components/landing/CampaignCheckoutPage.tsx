import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedLanding } from "@/lib/landing";
import { landingPath } from "@/lib/landing-path";
import { getDict } from "@/lib/i18n";
import { CampaignHeader } from "./CampaignHeader";

export async function CampaignCheckoutPage({ params, step, children }: {
  params: Promise<{ slug: string }>;
  step: "cart" | "checkout" | "receipt";
  children: (href: string) => React.ReactNode;
}) {
  const { slug } = await params;
  const page = await getPublishedLanding(slug);
  if (!page) notFound();

  const href = landingPath(slug);
  const t = getDict("ka-ge");
  const heading = step === "cart" ? t.cart.title : step === "checkout" ? t.checkout.title : t.order.received;
  return (
    <>
      <CampaignHeader href={href} logo={page.logo} />
      <main className="min-h-[70vh] border-t border-line bg-white">
        <div className="container-site pt-8 md:pt-12">
          {step === "checkout" && <Link href={`${href}/cart`} className="mb-4 inline-block text-sm underline">{t.cart.title}</Link>}
          <h1 className="text-3xl text-ink">{heading}</h1>
        </div>
        {children(href)}
      </main>
    </>
  );
}
