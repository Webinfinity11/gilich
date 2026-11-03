import type { Metadata } from "next";
import { ContactList } from "@/components/site/ContactList";
import { PageBanner } from "@/components/site/PageBanner";
import { SectionTitle } from "@/components/site/SectionTitle";
import { getDict, type Lang } from "@/lib/i18n";

const reasonIcons = ["/media/premium.png", "/media/best-price.png", "/media/online-chat.png"];

export async function generateMetadata({ params }: PageProps<"/[lang]/about-page">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).about.title };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about-page">) {
  const t = getDict((await params).lang as Lang);
  const a = t.about;

  return (
    <>
      <PageBanner title={a.title} crumbs={[{ label: a.title }]} />

      <section className="container-site grid items-center gap-10 py-16 md:py-[70px] lg:grid-cols-[1fr_2fr] lg:gap-[30px]">
        <div>
          <SectionTitle>{a.title}</SectionTitle>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
            <p>{t.home.aboutText[0]}</p>
            <p>{t.home.aboutText[1]}</p>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/586669317_17930155308118951_6212687174742704804_n-12.jpg" alt="" className="aspect-[870/577] w-full object-cover" />
      </section>

      <section className="container-site pb-16 md:pb-[70px]">
        <SectionTitle className="mb-10">{a.reasonsTitle}</SectionTitle>
        <div className="grid items-start gap-6 md:grid-cols-3">
          {a.reasons.map((r, i) => (
            <div key={r.title} className="grid grid-cols-[56px_1fr] items-center gap-4 border border-line p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reasonIcons[i]} alt="" className="size-14" />
              <div>
                <h3 className="text-[15px] font-medium text-ink">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site grid items-center gap-10 pb-16 md:pb-[90px] lg:grid-cols-[1fr_2fr] lg:gap-[30px]">
        <div>
          <SectionTitle>{a.contactTitle}</SectionTitle>
          <ContactList />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/472425500_17890899819118951_1909430815935361043_n1.jpg" alt="" className="aspect-[870/577] w-full object-cover" />
      </section>
    </>
  );
}
