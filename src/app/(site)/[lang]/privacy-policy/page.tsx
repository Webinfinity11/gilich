import type { Metadata } from "next";
import { PageBanner } from "@/components/site/PageBanner";
import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

// Placeholder copy — replace with the store's actual policy.
const content = {
  en: [
    { h: "What we collect", p: "When you place an order or contact us, we collect your name, phone number, email and delivery address." },
    { h: "How we use it", p: "We use this information only to process your order, contact you about it, and, if you subscribed, to send you our newsletter." },
    { h: "Storage", p: "Your cart and wishlist are stored in your own browser. Order data is stored securely and is never sold to third parties." },
    { h: "Your rights", p: `To view or delete your data, contact us at ${site.email} or ${site.phone}.` },
  ],
  ka: [
    { h: "რა მონაცემებს ვაგროვებთ", p: "შეკვეთის გაფორმებისას ან ჩვენთან დაკავშირებისას ვინახავთ თქვენს სახელს, ტელეფონის ნომერს, ელფოსტას და მიწოდების მისამართს." },
    { h: "როგორ ვიყენებთ", p: "ამ ინფორმაციას ვიყენებთ მხოლოდ შეკვეთის დასამუშავებლად, თქვენთან დასაკავშირებლად და, თუ გამოწერილი გაქვთ, სიახლეების გამოსაგზავნად." },
    { h: "შენახვა", p: "კალათა და სურვილების სია ინახება თქვენსავე ბრაუზერში. შეკვეთების მონაცემები დაცულად ინახება და არასდროს გადაეცემა მესამე პირებს." },
    { h: "თქვენი უფლებები", p: `მონაცემების სანახავად ან წასაშლელად დაგვიკავშირდით: ${site.email} ან ${site.phone}.` },
  ],
};

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy-policy">): Promise<Metadata> {
  return { title: getDict((await params).lang as Lang).footer.privacy };
}

export default async function PrivacyPage({ params }: PageProps<"/[lang]/privacy-policy">) {
  const lang = (await params).lang as Lang;
  const t = getDict(lang);
  return (
    <>
      <PageBanner title={t.footer.privacy} crumbs={[{ label: t.footer.privacy }]} />
      <article className="prose-site container-site max-w-[900px] py-16 text-[15px] leading-relaxed text-muted">
        {content[lang === "ka-ge" ? "ka" : "en"].map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
      </article>
    </>
  );
}
