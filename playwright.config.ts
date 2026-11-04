import { defineConfig } from "@playwright/test";

/**
 * Mobile layout tests.
 *   npm run test:mobile                                   # against a dev server on :3000
 *   BASE_URL=https://www.gilich.jewelry npm run test:mobile   # against production
 *
 * Uses the locally installed Google Chrome (channel "chrome"), so no browser download is needed.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // reference images are named by project only (no OS suffix) so one set lives in the repo
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    channel: "chrome",
    isMobile: true,
    hasTouch: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "small-android-360", use: { viewport: { width: 360, height: 740 }, deviceScaleFactor: 3 } },
    { name: "iphone-390", use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 } },
    { name: "large-phone-430", use: { viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 } },
  ],
});
