# Gilich Jewelry

Next.js 16 + Prisma ონლაინ მაღაზია ადმინ პანელით. ეს არის mediumslateblue-pony-336763.hostingersite.com-ის (WooCommerce) ასლი.

## გაშვება

```bash
npm install
npx prisma migrate dev      # ქმნის prisma/dev.db-ს
npm run db:seed             # ტვირთავს კატეგორიებს და პროდუქტებს ძველი საიტიდან
npm run dev                 # http://localhost:3000
```

ადმინ პანელი: http://localhost:3000/admin. ელფოსტა და პაროლი მითითებულია `.env` ფაილში (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

## სტრუქტურა

| გვერდი | ფაილი |
| --- | --- |
| მთავარი, Shop, კატეგორია, პროდუქტი | `src/app/(site)/[lang]/…` |
| კალათა, Checkout, Wishlist | `src/app/(site)/[lang]/cart`, `checkout`, `wishlist` |
| ადმინი: დაფა, პროდუქცია, კატეგორიები, შეკვეთები, შეტყობინებები | `src/app/admin/(panel)/…` |
| ადმინის server actions | `src/app/admin/actions.ts` |
| შეკვეთის გაფორმება, საკონტაქტო ფორმა, newsletter | `src/app/actions.ts` |
| კატალოგის მონაცემები (ქეშით) | `src/lib/catalog.ts` |
| საკონტაქტო ინფო, მენიუ, ლოგო | `src/lib/site.ts` |

- **ენები.** ინგლისური ვერსია არის `/`, `/shop`, ... მისამართებზე, ქართული კი `/ka-ge`, `/ka-ge/shop`, ... მისამართებზე (როგორც ორიგინალზე). ინტერფეისის ტექსტები ინახება `src/lib/i18n.ts`-ში. პროდუქტის და კატეგორიის ქართული სახელი და აღწერა ადმინში შეიყვანება; თუ ცარიელია, ინგლისური ჩანს. `src/proxy.ts` ინგლისურ მისამართებს შიდა `/en/...` route-ზე გადამისამართებს.
- **ვარიაციები.** თითოეულ პროდუქტს შეიძლება ჰქონდეს ატრიბუტები (მაგ. Size, Color). ყველა ვარიაციას აქვს საკუთარი ფასი, ფასდაკლება, მარაგი, SKU და ფოტო. საიტზე ვარიაციის არჩევისას იცვლება ფასი და ფოტო.
- **ფასები** ბაზაში ცენტებში ინახება. შეკვეთისას ფასი ყოველთვის ბაზიდან მოდის და არა ბრაუზერიდან.
- **ფოტოები.** ლოკალურად ინახება `public/uploads`-ში. Vercel-ზე მიუთითეთ `BLOB_READ_WRITE_TOKEN` და ფოტოები Vercel Blob-ში აიტვირთება.
- **კალათა და wishlist** ინახება ბრაუზერის localStorage-ში.

## Production (Vercel)

SQLite Vercel-ზე არ მუშაობს. საჭიროა Postgres (მაგ. Neon ან Prisma Postgres Vercel Marketplace-დან):

1. `prisma/schema.prisma`-ში შეცვალეთ `provider = "postgresql"`.
2. `npm i @prisma/adapter-pg pg` და `src/lib/db.ts`-ში გამოიყენეთ `PrismaPg` adapter.
3. წაშალეთ `prisma/migrations`, გაუშვით `npx prisma migrate dev --name init`, შემდეგ `npm run db:seed`.
4. Vercel-ზე დააყენეთ `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `SITE_URL`.
