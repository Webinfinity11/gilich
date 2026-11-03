import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { ContactList } from "@/components/site/ContactList";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact-page">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).contact.title };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact-page">) {
  const { lang: raw } = await params;
  const lang = raw as Lang;
  const t = getDict(lang);
  return (
    <>
      <PageBanner title={t.contact.title} crumbs={[{ label: t.contact.title }]} />
      <section className="container-site py-16 md:py-[70px]">
        <iframe
          title={t.contact.map}
          src={site.mapEmbed}
          className="h-[300px] w-full border-0 md:h-[400px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="mt-14 grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-[60px]">
          <ContactList />
          <div>
            <h2 className="mb-8 text-2xl uppercase text-ink">{t.contact.getInTouch}</h2>
            <ContactForm buttonLabel={t.form.send} />
          </div>
        </div>
      </section>
    </>
  );
}
