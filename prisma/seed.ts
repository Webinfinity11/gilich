import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import data from "./seed-data.json";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

// Category card images used on the original home page
const categoryImages: Record<string, string> = {
  rings: "/media/497669317_17906051676118951_4752263994260651517_n.webp",
  necklaces: "/media/494828670_17904597699118951_3800176325813699161_n.webp",
  bracelets: "/media/491453375_17902466085118951_428811232577474565_n.webp",
  earrings: "/media/500361492_17907175461118951_1389394094923495218_n.webp",
};
// Georgian names, as on the original /ka-ge/ site
const categoryNamesKa: Record<string, string> = {
  accessories: "აქსესუარები",
  bangles: "მყარი სამაჯურები / ბენგლები",
  bracelets: "სამაჯურები",
  "chain-bracelets": "ძეწკვური სამაჯურები / ჯაჭვური სამაჯურები",
  chandelier: "ჭაღისებრი საყურეები / შანდელიერები",
  cocktail: "კოქტეილის ბეჭდები",
  cuffs: "კაფები",
  "drop-dangle": "ჩამოსაკიდი საყურეები",
  earrings: "საყურეები",
  "earrings-with-an-english-clasp": "საყურეები ინგლისური საკეთით",
  engagement: "ნიშნობის ბეჭდები",
  "glider-bracelets": "გლიდერული სამაჯურები",
  halo: "ჰალო",
  hoops: "საყურე-რგოლები / კონგო",
  necklaces: "ყელსაბამები",
  rings: "ბეჭდები",
  "signet-rings": "მასიური ბეჭდები",
  solitaire: "სოლიტერები",
  studs: "პუსეტები / წერტილა საყურეები",
  "tennis-bracelets": "ტენისის სამაჯურები",
  vintage: "ვინტაჟური ბეჭდები",
  "wedding-bands": "საქორწინო ბეჭდები"
};

const mainOrder = ["rings", "necklaces", "bracelets", "earrings"];

/** Demo: three colours, each with its own price and photos */
function demoVariations(images: string[]) {
  const list = [
    { name: "Gold", color: "#d4af37", price: 10000 },
    { name: "Rose Gold", color: "#b76e79", price: 15000 },
    { name: "White Gold", color: "#e8e6e1", price: 20000 },
  ];
  return {
    price: 10000,
    attributes: JSON.stringify([{ name: "Color", values: list.map((l) => l.name), type: "color", colors: Object.fromEntries(list.map((l) => [l.name, l.color])) }]),
    variations: {
      create: list.map((l, i) => {
        const own = images.length ? [images[i % images.length], ...images.filter((_, j) => j !== i % images.length)] : [];
        return { name: l.name, color: l.color, price: l.price, images: JSON.stringify(own), image: own[0] ?? null, options: JSON.stringify({ Color: l.name }), sortOrder: i };
      }),
    },
  };
}

async function main() {
  if (!process.argv.includes("--force") && (await db.category.count()) > 0) {
    console.log("Database already has data, skipping seed (use --force to reset)");
    return;
  }
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.productVariation.deleteMany();
  await db.productImage.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();

  const idByWp = new Map<number, number>();
  for (const c of data.categories) {
    const created = await db.category.create({
      data: {
        name: c.name,
        nameKa: categoryNamesKa[c.slug] ?? null,
        slug: c.slug,
        description: c.description,
        image: categoryImages[c.slug] ?? c.image,
        sortOrder: mainOrder.includes(c.slug) ? mainOrder.indexOf(c.slug) : 10,
      },
    });
    idByWp.set(c.wpId, created.id);
  }
  for (const c of data.categories) {
    if (c.parentWpId) {
      await db.category.update({ where: { id: idByWp.get(c.wpId)! }, data: { parentId: idByWp.get(c.parentWpId) } });
    }
  }

  for (const p of data.products) {
    const product = await db.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        salePrice: p.salePrice,
        sku: p.sku,
        shortDescription: p.shortDescription,
        description: p.description,
        featured: true,
        images: { create: p.images.map((url, i) => ({ url, sortOrder: i })) },
        categories: { connect: p.categories.map((slug) => ({ slug })) },
      },
    });

    // Demo: ring-1 gets colour variations, each with its own price and photos
    if (p.slug === "ring-1") {
      await db.product.update({ where: { id: product.id }, data: demoVariations(p.images) });
    }
  }
  console.log(`Seeded ${data.categories.length} categories and ${data.products.length} products`);
}

main().finally(() => db.$disconnect());
