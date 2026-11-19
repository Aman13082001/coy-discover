/**
 * Captures UI screenshots for the README / visual review.
 * Usage: start the app (npm run dev or npm start), reseed (npm run db:seed), then
 *   node scripts/screenshots.mjs [baseUrl] [outDir]
 * Note: this performs real swipes (it creates a match), so reseed afterwards.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "docs/screenshots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();

async function shoot(viewport, prefix) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  await page.goto(`${base}/discover`);
  await page.getByTestId("top-card").waitFor();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${prefix}-discover.png` });

  // Mid-drag state: grab the card and hold it to the right.
  const box = await page.getByTestId("top-card").boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 40, cy, { steps: 4 });
  await page.mouse.move(cx + 95, cy + 6, { steps: 6 });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/${prefix}-drag.png` });
  await page.mouse.up();
  await page.waitForTimeout(500);

  // Create a few real mutual matches (these seeded profiles have liked the demo user). 409s are fine.
  for (const profileId of ["zoya", "aanya", "kabir", "mira", "farhan"]) {
    await page.request.post(`${base}/api/swipe`, { data: { profileId, action: "LIKE" } });
  }

  await page.goto(`${base}/matches`);
  await page.getByRole("list", { name: "Your matches" }).waitFor();
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${prefix}-matches.png` });
  await page.close();
}

await shoot({ width: 390, height: 844 }, "mobile");
await shoot({ width: 1440, height: 900 }, "desktop");
await browser.close();
console.log(`Saved screenshots to ${out}`);
