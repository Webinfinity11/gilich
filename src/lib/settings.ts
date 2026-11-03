import { cacheLife, cacheTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { getDict, type Lang } from "@/lib/i18n";
import { site } from "@/lib/site";

/** Editable site settings as stored (both languages). Empty Georgian fields fall back to English. */
export type SiteSettingsInput = {
  // Header
  logo: string;
  announcement: string;
  announcementKa: string;
  // Contact
  phone: string;
  email: string;
  address: string;
  addressKa: string;
  instagram: string;
  facebook: string;
  mapQuery: string;
  // Footer
  logoWhite: string;
  footerText: string;
  footerTextKa: string;
  // Pages
  pageBanner: string;
  aboutTitle: string;
  aboutTitleKa: string;
  aboutText: string;
  aboutTextKa: string;
  aboutImage: string;
  reasonsTitle: string;
  reasonsTitleKa: string;
  reasons: { title: string; titleKa: string; text: string; textKa: string }[];
  contactImage: string;
  // Legal pages: blank line between paragraphs, "## " starts a heading
  terms: string;
  termsKa: string;
  privacy: string;
  privacyKa: string;
};

/** Settings resolved for one language, ready for the site components */
export type SiteInfo = {
  logo: string;
  logoWhite: string;
  announcement: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  mapEmbed: string;
  footerText: string;
  pageBanner: string;
  aboutTitle: string;
  aboutParagraphs: string[];
  aboutImage: string;
  reasonsTitle: string;
  reasons: { title: string; text: string }[];
  contactImage: string;
  terms: string;
  privacy: string;
};

const en = getDict("en");
const ka = getDict("ka-ge");

export const defaultSettings: SiteSettingsInput = {
  logo: site.logo,
  announcement: "",
  announcementKa: "",
  phone: site.phone,
  email: site.email,
  address: en.footer.address,
  addressKa: ka.footer.address,
  instagram: site.instagram,
  facebook: site.facebook,
  mapQuery: "Gilich Jewelry House, 39b Ilia Chavchavadze Avenue, Tbilisi",
  logoWhite: site.logoWhite,
  footerText: `GILICH Jewelry House ©2026 | ${en.footer.rights}`,
  footerTextKa: `GILICH Jewelry House ©2026 | ${ka.footer.rights}`,
  pageBanner: site.pageBanner,
  aboutTitle: en.home.aboutTitle,
  aboutTitleKa: ka.home.aboutTitle,
  aboutText: en.home.aboutText.join("\n\n"),
  aboutTextKa: ka.home.aboutText.join("\n\n"),
  aboutImage: "/media/586669317_17930155308118951_6212687174742704804_n-12.jpg",
  reasonsTitle: en.about.reasonsTitle,
  reasonsTitleKa: ka.about.reasonsTitle,
  reasons: en.about.reasons.map((r, i) => ({ title: r.title, titleKa: ka.about.reasons[i].title, text: r.text, textKa: ka.about.reasons[i].text })),
  contactImage: "/media/472425500_17890899819118951_1909430815935361043_n1.jpg",
  terms: `These terms apply to all purchases made on the Gilich Jewelry House website.

## Orders
After you place an order, our manager will contact you to confirm the details, size and delivery time. Custom pieces are made after confirmation.

## Payment
You can pay in cash on delivery, by bank transfer, or by card in our showroom.

## Delivery
We deliver across Georgia. Delivery terms for other countries are agreed individually.

## Returns
Items in their original condition can be returned within 7 days of delivery. Custom-made pieces cannot be returned unless defective.

## Contact
Questions? Call us at ${site.phone} or visit our showroom.`,
  termsKa: `ეს პირობები ვრცელდება Gilich Jewelry House-ის ვებგვერდზე განხორციელებულ ყველა შესყიდვაზე.

## შეკვეთა
შეკვეთის გაფორმების შემდეგ ჩვენი მენეჯერი დაგიკავშირდებათ დეტალების, ზომისა და მიწოდების დროის დასაზუსტებლად. ინდივიდუალური ნივთები მზადდება დადასტურების შემდეგ.

## გადახდა
გადახდა შესაძლებელია ნაღდი ფულით მიწოდებისას, საბანკო გადარიცხვით ან ბარათით ჩვენს შოურუმში.

## მიწოდება
მიწოდება ხორციელდება მთელ საქართველოში. სხვა ქვეყნებში მიწოდების პირობები ინდივიდუალურად თანხმდება.

## დაბრუნება
ნივთი, რომელიც პირვანდელ მდგომარეობაშია, შეიძლება დაბრუნდეს მიწოდებიდან 7 დღის განმავლობაში. ინდივიდუალური შეკვეთით დამზადებული ნივთი არ ბრუნდება, თუ არ აქვს დეფექტი.

## კონტაქტი
შეკითხვები? დაგვირეკეთ ${site.phone} ან ეწვიეთ ჩვენს შოურუმს.`,
  privacy: `## What we collect
When you place an order or contact us, we collect your name, phone number, email and delivery address.

## How we use it
We use this information only to process your order, contact you about it, and, if you subscribed, to send you our newsletter.

## Storage
Your cart and wishlist are stored in your own browser. Order data is stored securely and is never sold to third parties.

## Your rights
To view or delete your data, contact us at ${site.email} or ${site.phone}.`,
  privacyKa: `## რა მონაცემებს ვაგროვებთ
შეკვეთის გაფორმებისას ან ჩვენთან დაკავშირებისას ვინახავთ თქვენს სახელს, ტელეფონის ნომერს, ელფოსტას და მიწოდების მისამართს.

## როგორ ვიყენებთ
ამ ინფორმაციას ვიყენებთ მხოლოდ შეკვეთის დასამუშავებლად, თქვენთან დასაკავშირებლად და, თუ გამოწერილი გაქვთ, სიახლეების გამოსაგზავნად.

## შენახვა
კალათა და სურვილების სია ინახება თქვენსავე ბრაუზერში. შეკვეთების მონაცემები დაცულად ინახება და არასდროს გადაეცემა მესამე პირებს.

## თქვენი უფლებები
მონაცემების სანახავად ან წასაშლელად დაგვიკავშირდით: ${site.email} ან ${site.phone}.`,
};

/** Stored settings merged over the defaults (not cached; for the admin editor) */
export async function loadSettingsInput(): Promise<SiteSettingsInput> {
  const row = await db.setting.findUnique({ where: { key: "site" } });
  if (!row) return defaultSettings;
  try {
    return { ...defaultSettings, ...(JSON.parse(row.value) as Partial<SiteSettingsInput>) };
  } catch {
    return defaultSettings;
  }
}

const pickText = (lang: Lang, en: string, ka: string) => (lang === "ka-ge" && ka.trim() ? ka : en);

export async function getSiteInfo(lang: Lang): Promise<SiteInfo> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const s = await loadSettingsInput();
  const handle = s.instagram.replace(/\/+$/, "").split("/").pop();
  return {
    logo: s.logo || site.logo,
    logoWhite: s.logoWhite || site.logoWhite,
    announcement: pickText(lang, s.announcement, s.announcementKa),
    phone: s.phone,
    phoneHref: `tel:${s.phone.replace(/[^\d+]/g, "")}`,
    email: s.email,
    address: pickText(lang, s.address, s.addressKa),
    instagram: s.instagram,
    instagramHandle: handle ? `@${handle}` : "",
    facebook: s.facebook,
    mapEmbed: s.mapQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&t=m&z=16&output=embed&iwloc=near` : "",
    footerText: pickText(lang, s.footerText, s.footerTextKa),
    pageBanner: s.pageBanner || site.pageBanner,
    aboutTitle: pickText(lang, s.aboutTitle, s.aboutTitleKa),
    aboutParagraphs: pickText(lang, s.aboutText, s.aboutTextKa)
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    aboutImage: s.aboutImage,
    reasonsTitle: pickText(lang, s.reasonsTitle, s.reasonsTitleKa),
    reasons: s.reasons.filter((r) => r.title || r.text).map((r) => ({ title: pickText(lang, r.title, r.titleKa), text: pickText(lang, r.text, r.textKa) })),
    contactImage: s.contactImage,
    terms: pickText(lang, s.terms, s.termsKa),
    privacy: pickText(lang, s.privacy, s.privacyKa),
  };
}
