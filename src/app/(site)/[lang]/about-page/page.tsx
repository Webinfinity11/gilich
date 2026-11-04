import type { Metadata } from "next";
import { ContactList } from "@/components/site/ContactList";
import { PageBanner } from "@/components/site/PageBanner";
import { SectionTitle } from "@/components/site/SectionTitle";
import { getDict, type Lang } from "@/lib/i18n";
import { getSiteInfo } from "@/lib/settings";

const reasonIcons = ["/media/premium.png", "/media/best-price.png", "/media/online-chat.png"];

export async function generateMetadata({ params }: PageProps<"/[lang]/about-page">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).about.title };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about-page">) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  const a = t.about;
  const info = await getSiteInfo(lang);

  return (
    <>
      <PageBanner title={a.title} crumbs={[{ label: a.title }]} />

      <section className="container-site grid items-center gap-10 py-16 md:py-[70px] lg:grid-cols-[1fr_2fr] lg:gap-[30px]">
        <div>
          <SectionTitle>{info.aboutTitle}</SectionTitle>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-muted">
            {info.aboutParagraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {info.aboutImage && <img src={info.aboutImage} alt="" className="aspect-[870/577] w-full object-cover" />}
      </section>

      <section className="container-site pb-16 md:pb-[70px]">
        <SectionTitle className="mb-10">{info.reasonsTitle}</SectionTitle>
        <div className="grid items-start gap-6 md:grid-cols-3">
          {info.reasons.map((r, i) => (
            <div key={i} className="grid gap-4 border border-line p-5 sm:grid-cols-[56px_1fr] sm:items-center sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reasonIcons[i % reasonIcons.length]} alt="" className="size-12 sm:size-14" />
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
        {info.contactImage && <img src={info.contactImage} alt="" className="aspect-[870/577] w-full object-cover" />}
      </section>
    </>
  );
}
