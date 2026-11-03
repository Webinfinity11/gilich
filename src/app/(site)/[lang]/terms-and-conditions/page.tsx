import type { Metadata } from "next";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

// Placeholder copy — replace with the store's actual terms.
const content = {
  en: [
    { h: null, p: `These terms apply to all purchases made on the ${site.fullName} website.` },
    { h: "Orders", p: "After you place an order, our manager will contact you to confirm the details, size and delivery time. Custom pieces are made after confirmation." },
    { h: "Payment", p: "You can pay in cash on delivery, by bank transfer, or by card in our showroom." },
    { h: "Delivery", p: "We deliver across Georgia. Delivery terms for other countries are agreed individually." },
    { h: "Returns", p: "Items in their original condition can be returned within 7 days of delivery. Custom-made pieces cannot be returned unless defective." },
    { h: "Contact", p: `Questions? Call us at ${site.phone} or visit our showroom.` },
  ],
  ka: [
    { h: null, p: `ეს პირობები ვრცელდება ${site.fullName}-ის ვებგვერდზე განხორციელებულ ყველა შესყიდვაზე.` },
    { h: "შეკვეთა", p: "შეკვეთის გაფორმების შემდეგ ჩვენი მენეჯერი დაგიკავშირდებათ დეტალების, ზომისა და მიწოდების დროის დასაზუსტებლად. ინდივიდუალური ნივთები მზადდება დადასტურების შემდეგ." },
    { h: "გადახდა", p: "გადახდა შესაძლებელია ნაღდი ფულით მიწოდებისას, საბანკო გადარიცხვით ან ბარათით ჩვენს შოურუმში." },
    { h: "მიწოდება", p: "მიწოდება ხორციელდება მთელ საქართველოში. სხვა ქვეყნებში მიწოდების პირობები ინდივიდუალურად თანხმდება." },
    { h: "დაბრუნება", p: "ნივთი, რომელიც პირვანდელ მდგომარეობაშია, შეიძლება დაბრუნდეს მიწოდებიდან 7 დღის განმავლობაში. ინდივიდუალური შეკვეთით დამზადებული ნივთი არ ბრუნდება, თუ არ აქვს დეფექტი." },
    { h: "კონტაქტი", p: `შეკითხვები? დაგვირეკეთ ${site.phone} ან ეწვიეთ ჩვენს შოურუმს.` },
  ],
};

export async function generateMetadata({ params }: PageProps<"/[lang]/terms-and-conditions">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).footer.terms };
}

export default async function TermsPage({ params }: PageProps<"/[lang]/terms-and-conditions">) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return (
    <>
      <PageBanner title={t.footer.terms} crumbs={[{ label: t.footer.terms }]} />
      <article className="prose-site container-site max-w-[900px] py-16 text-[15px] leading-relaxed text-muted">
        {content[lang === "ka-ge" ? "ka" : "en"].map((s) => (
          <section key={s.p}>
            {s.h && <h2>{s.h}</h2>}
            <p>{s.p}</p>
          </section>
        ))}
      </article>
    </>
  );
}
