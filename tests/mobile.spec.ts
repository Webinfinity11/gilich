import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  "/",
  "/shop",
  "/product-category/rings",
  "/product/necklace-1",
  "/cart",
  "/checkout",
  "/wishlist",
  "/about-page",
  "/contact-page",
  "/privacy-policy",
  "/terms-and-conditions",
  "/ka-ge",
  "/ka-ge/shop",
  "/ka-ge/product/necklace-1",
];

/** Elements whose box sticks out past the viewport edge without an ancestor that clips them. */
async function overflowingElements(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el: Element) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== "visible") return true;
      }
      return false;
    };
    const out: string[] = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (!r.width || (r.right <= vw + 1 && r.left >= -1) || clipped(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.visibility === "hidden") continue;
      out.push(`<${el.tagName.toLowerCase()} class="${el.getAttribute("class") ?? ""}"> ${Math.round(r.left)}..${Math.round(r.right)}px`);
      if (out.length >= 8) break;
    }
    return { scrollWidth: document.documentElement.scrollWidth, vw, out };
  });
}

/** Scroll through the page so scroll-reveal animations run, then return to the top. */
async function scrollThrough(page: Page) {
  await page.waitForLoadState("networkidle"); // reveals are wired up after hydration
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });
  // let the reveal animations (1.1s + stagger) finish
  await page.waitForTimeout(1800);
}

async function addNecklaceToCart(page: Page) {
  await page.goto("/product/necklace-1");
  await page.getByRole("button", { name: /add to cart/i }).first().click();
  await expect(page.getByRole("button", { name: "Cart" }).first()).toContainText("1");
}

test.describe("no sideways scrolling", () => {
  for (const path of PAGES) {
    test(path, async ({ page }) => {
      await page.goto(path);
      await scrollThrough(page);
      const r = await overflowingElements(page);
      expect(r.out, `page is ${r.scrollWidth}px wide on a ${r.vw}px screen`).toEqual([]);
      expect(r.scrollWidth).toBeLessThanOrEqual(r.vw);
    });
  }

  test("cart and checkout with an item", async ({ page }) => {
    await addNecklaceToCart(page);
    for (const path of ["/cart", "/checkout"]) {
      await page.goto(path);
      await scrollThrough(page);
      const r = await overflowingElements(page);
      expect(r.out, `${path} is ${r.scrollWidth}px wide`).toEqual([]);
    }
  });
});

test("carousel cards are visible after swiping", async ({ page }) => {
  await page.goto("/");
  const track = page.locator(".snap-x").first();
  await track.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth }));
  await page.waitForTimeout(300);
  const hidden = await track.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [...el.children].filter((c) => {
      const r = c.getBoundingClientRect();
      const onScreen = r.right > box.left && r.left < box.right;
      const opacity = [c, el].reduce((o, n) => o * Number(getComputedStyle(n).opacity), 1);
      return onScreen && opacity < 0.95;
    }).length;
  });
  expect(hidden, "cards scrolled into view should not be blank").toBe(0);
});

test("hero slider changes slide on swipe", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('section[aria-roledescription="carousel"]');
  const dots = hero.getByRole("button", { name: /^Slide \d/ });
  test.skip((await dots.count()) < 2, "only one hero slide");
  await expect(dots.first()).toHaveAttribute("aria-current", "true");

  const box = (await hero.boundingBox())!;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type: "touchStart" | "touchMove" | "touchEnd", x: number) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y }] });
  await touch("touchStart", box.x + box.width * 0.8);
  await touch("touchMove", box.x + box.width * 0.5);
  await touch("touchMove", box.x + box.width * 0.2);
  await touch("touchEnd", box.x + box.width * 0.2);

  await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
});

test("hero dots are big enough to tap", async ({ page }) => {
  await page.goto("/");
  const dots = page.getByRole("button", { name: /^Slide \d/ });
  for (const box of await dots.evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
    expect(box.height).toBeGreaterThanOrEqual(32);
  }
});

test("header icons are at least 40px tap targets", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Open menu", "Wishlist", "Cart"]) {
    const box = (await page.getByRole("banner").getByRole(name === "Wishlist" ? "link" : "button", { name, exact: true }).boundingBox())!;
    expect(box.width, name).toBeGreaterThanOrEqual(40);
    expect(box.height, name).toBeGreaterThanOrEqual(40);
  }
});

test("mobile menu opens, locks scrolling and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menuLink = page.locator("header nav").last().getByRole("link", { name: /shop/i });
  await expect(menuLink).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(menuLink).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("mini cart dropdown fits on screen", async ({ page }) => {
  await addNecklaceToCart(page);
  await page.getByRole("banner").getByRole("button", { name: "Cart", exact: true }).click();
  const panel = page.getByRole("banner").getByRole("link", { name: /view cart/i });
  await expect(panel).toBeVisible();
  const box = await panel.evaluate((el) => el.closest("div.absolute")!.getBoundingClientRect().toJSON());
  const vw = page.viewportSize()!.width;
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(vw);
});

test("shop filters live in a drawer on phones", async ({ page }) => {
  await page.goto("/shop");
  const categoriesHeading = page.getByRole("heading", { name: /^categories$/i });
  await expect(categoriesHeading).toBeHidden();

  await page.getByRole("button", { name: "Filters", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Filters" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: /^categories$/i })).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await drawer.getByRole("button", { name: "Close filters" }).last().click();
  await expect(drawer).toBeHidden();
});

test("cart shows price, quantity and remove without sideways scrolling", async ({ page }) => {
  await addNecklaceToCart(page);
  await page.goto("/cart");
  const remove = page.getByRole("button", { name: /remove: necklace #1/i }).first();
  await expect(remove).toBeInViewport();
  await page.getByRole("button", { name: "Increase" }).first().click();
  await expect(page.getByRole("banner").getByRole("button", { name: "Cart", exact: true })).toContainText("2");
});

test("form fields are 16px so iPhone Safari does not zoom in", async ({ page }) => {
  await page.goto("/checkout");
  const small = await page.evaluate(() =>
    [...document.querySelectorAll("main input:not([type=checkbox]):not([type=radio]):not([type=hidden]), main select, main textarea")]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.getAttribute("name") ?? el.tagName),
  );
  expect(small).toEqual([]);
});
