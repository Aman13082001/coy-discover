import { execSync } from "node:child_process";
import { expect, type Locator, type Page } from "@playwright/test";

/** Resets the e2e database to the deterministic seed. */
export function reseed() {
  execSync("npx tsx prisma/seed.ts", { stdio: "pipe", env: { ...process.env, DATABASE_URL: "file:./e2e.db" } });
}

export const topCard = (page: Page) => page.getByTestId("top-card");

export async function expectTopCard(page: Page, name: string) {
  await expect(topCard(page).getByRole("heading", { level: 2 })).toContainText(name);
}

/** Real pointer drag with the mouse (pointer events, as on desktop). */
export async function mouseDrag(page: Page, card: Locator, dx: number) {
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x + (dx * i) / steps, y + i, { steps: 1 });
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(80); // settle so release velocity is low; distance decides
  await page.mouse.up();
}

/** Real touch drag via the Chrome DevTools Protocol (touch → pointer events, as on a phone). */
export async function touchDrag(page: Page, card: Locator, dx: number) {
  const box = (await card.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + (dx * i) / steps, y: y + i }] });
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(80);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/** Collects every JSON body returned by /api/* during the test. */
export function captureApi(page: Page) {
  const bodies: { url: string; status: number; body: unknown }[] = [];
  page.on("response", async (res) => {
    if (!res.url().includes("/api/")) return;
    try {
      bodies.push({ url: res.url(), status: res.status(), body: await res.json() });
    } catch {
      /* non-JSON */
    }
  });
  return bodies;
}

export function allKeys(value: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, out));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      out.add(k);
      allKeys(v, out);
    }
  }
  return out;
}
