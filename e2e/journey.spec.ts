/**
 * The complete demo journey from the assignment, against the seeded database.
 * Seeded feed order for the demo user: pooja, rohan, dev, kavya, sana, zoya, aditi, ...
 * zoya has (privately) liked the demo user; pooja and rohan have not.
 */
import { expect, test } from "@playwright/test";
import { allKeys, captureApi, expectTopCard, mouseDrag, reseed, topCard, touchDrag } from "./helpers";

test.beforeEach(() => reseed());

test("full journey: like, pass, match, matches list, reload persistence, no leaks", async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name === "mobile";
  const drag = isMobile ? touchDrag : mouseDrag;
  const api = captureApi(page);
  let swipeRequests = 0;
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().endsWith("/api/swipe")) swipeRequests++;
  });
  const consoleErrors: string[] = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

  // 1–3. Open the app, go to Discover, see one profile.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home", level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Discover" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await expectTopCard(page, "Pooja");
  await expect(page.getByTestId("top-card")).toHaveCount(1);

  // 4–6. Drag-like a profile that has not liked the user: no match, card gone.
  await drag(page, topCard(page), 220);
  await expectTopCard(page, "Rohan");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // A drag below the threshold snaps back and records nothing.
  expect(swipeRequests).toBe(1);
  await drag(page, topCard(page), 50);
  await page.waitForTimeout(500);
  await expectTopCard(page, "Rohan");
  expect(swipeRequests).toBe(1);

  // 7–8. Pass with the button.
  await page.getByRole("button", { name: "Pass on Rohan" }).click();
  await expectTopCard(page, "Dev");

  // Pass a few more (drag left, button, button) to reach Zoya.
  await drag(page, topCard(page), -220);
  await expectTopCard(page, "Kavya");
  await page.getByRole("button", { name: "Pass on Kavya" }).click();
  await expectTopCard(page, "Sana");
  await page.getByRole("button", { name: "Pass on Sana" }).click();
  await expectTopCard(page, "Zoya");

  // 9–10. Like someone who already liked the user: the match overlay appears.
  await page.getByRole("button", { name: "Like Zoya" }).click();
  const dialog = page.getByRole("dialog", { name: "It's a match!" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("You and Zoya liked each other.");
  await page.screenshot({ path: testInfo.outputPath("match.png") });

  // 11–12. Open Matches: only the mutual match is listed.
  await dialog.getByRole("button", { name: "See your matches" }).click();
  await expect(page).toHaveURL(/\/matches$/);
  const list = page.getByRole("list", { name: "Your matches" });
  await expect(list.getByRole("listitem")).toHaveCount(1);
  await expect(list).toContainText("Zoya");
  await expect(list).not.toContainText("Pooja"); // one-sided like is not a match

  // 13–14. Refresh: the match persists.
  await page.reload();
  await expect(page.getByRole("list", { name: "Your matches" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("1 mutual match")).toBeVisible();

  // 15. Swiped profiles stay excluded after reload.
  await page.goto("/discover");
  await expectTopCard(page, "Aditi");
  const feed = api.filter((r) => r.url.endsWith("/api/feed")).at(-1)!.body as { data: { profiles: { id: string }[] } };
  const ids = feed.data.profiles.map((p) => p.id);
  for (const gone of ["pooja", "rohan", "dev", "kavya", "sana", "zoya"]) expect(ids).not.toContain(gone);
  expect(ids).toHaveLength(31 - 6);

  // 16. No API response leaked incoming-like information.
  const forbidden = /liked|likes|incoming|admirer|swipedBy|count/i;
  for (const r of api) for (const key of allKeys(r.body)) expect(key, `${r.url} leaked "${key}"`).not.toMatch(forbidden);
  // Unreciprocated likers (e.g. meera) appear in the feed exactly like everyone else.
  const meera = feed.data.profiles.find((p) => p.id === "meera");
  expect(Object.keys(meera!).sort()).toEqual(["age", "bio", "id", "interests", "location", "name", "photoUrl"]);

  expect(consoleErrors).toEqual([]);
});

test("keyboard: arrow keys pass and like", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "keyboard shortcuts are a desktop affordance");
  await page.goto("/discover");
  await expectTopCard(page, "Pooja");
  await page.keyboard.press("ArrowLeft");
  await expectTopCard(page, "Rohan");
  await page.keyboard.press("ArrowRight");
  await expectTopCard(page, "Dev");
});

test("empty state after everyone is swiped, and it survives reload", async ({ page }) => {
  await page.goto("/discover");
  await expectTopCard(page, "Pooja");
  for (let i = 0; i < 31; i++) {
    const name = await topCard(page).getByRole("heading", { level: 2 }).innerText();
    await page.getByRole("button", { name: `Pass on ${name.replace(/\s*\d+$/, "").trim()}` }).click();
  }
  await expect(page.getByRole("heading", { name: "You're all caught up" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "You're all caught up" })).toBeVisible();
});

test("no horizontal overflow on Discover and Matches", async ({ page }) => {
  for (const path of ["/", "/discover", "/matches"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("360×640: card and both action buttons fit above the tab bar", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "small-phone check runs once");
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/discover");
  await expectTopCard(page, "Pooja");
  const nav = (await page.locator("nav[aria-label='Primary']").filter({ visible: true }).boundingBox())!;
  for (const name of ["Like Pooja", "Pass on Pooja"]) {
    const btn = (await page.getByRole("button", { name }).boundingBox())!;
    expect(btn.y + btn.height, name).toBeLessThanOrEqual(nav.y);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
