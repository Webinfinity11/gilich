import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression tests: full-page screenshots of the main pages on phones, compared with the
 * reference images in tests/visual.spec.ts-snapshots/. A layout change shows up as a failed test
 * with a diff image in playwright-report/.
 *
 *   npm run test:visual                  # compare against the references
 *   npm run test:visual -- --update-snapshots   # accept the current look as the new reference
 *
 * References are made against the seeded database (`npm run db:seed`), so run them locally,
 * not against production where products and texts differ.
 */

const PAGES = [
  { name: "home", path: "/" },
  { name: "shop", path: "/shop" },
  { name: "category", path: "/product-category/rings" },
  { name: "product", path: "/product/necklace-1" },
  { name: "cart", path: "/cart", withCartItem: true },
  { name: "checkout", path: "/checkout", withCartItem: true },
  { name: "about", path: "/about-page" },
  { name: "contact", path: "/contact-page" },
  { name: "ka-home", path: "/ka-ge" },
  { name: "ka-product", path: "/ka-ge/product/necklace-1" },
];

// Reduced motion switches off the scroll-reveal animations, so every section is drawn in its final state.
test.use({ reducedMotion: "reduce", deviceScaleFactor: 1 });

// Two phone widths are enough for layout regressions and keep the reference images small.
test.beforeEach(({}, info) => {
  test.skip(info.project.name === "large-phone-430", "visual references cover 360px and 390px");
});

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // load every lazy image before the full-page shot
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

for (const p of PAGES) {
  test(`looks right: ${p.name}`, async ({ page }) => {
    if (p.withCartItem) {
      await page.goto("/product/necklace-1");
      await page.getByRole("button", { name: /add to cart/i }).first().click();
    }
    await page.goto(p.path);
    await settle(page);
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      // moving parts: the auto-playing hero slider, the showroom video and the Google map
      mask: [page.locator('section[aria-roledescription="carousel"]'), page.locator("video"), page.locator("iframe")],
      maxDiffPixelRatio: 0.01,
    });
  });
}

test("looks right: mobile menu open", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page).toHaveScreenshot("menu-open.png", { animations: "disabled", mask: [page.locator('section[aria-roledescription="carousel"]')] });
});

test("looks right: shop filters drawer", async ({ page }) => {
  await page.goto("/shop");
  await settle(page);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page).toHaveScreenshot("filters-open.png", { animations: "disabled" });
});
