import { expect, test } from "@playwright/test";

test("the site loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "EVEShip.fit - View, Create, and Share your EVE Online ship fits online" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute("href", "https://github.com/EVEShipFit");
  await expect(page.getByRole("link", { name: "Discord" })).toHaveAttribute("href", "https://discord.gg/S5V5BkvNf7");
});

test("the fitting window shows its statistics", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Fitting Window" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("region", { name: "Statistics" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Item Browser" })).toBeVisible();
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible();
  await expect(page.getByText(/^EVEShip\.fit \S+ · EVE data from \d{4}-\d{2}-\d{2}$/)).toBeVisible();
});

test("No skills flags the skills the fit misses", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("img", { name: /^Missing Skills/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Skills All L5" }).click();
  await page
    .getByRole("dialog", { name: "Skills" })
    .getByRole("button", { name: /^All L0/ })
    .click();
  await expect(page.getByRole("button", { name: "Skills All L0" })).toBeVisible();
  await expect(page.getByRole("img", { name: /^Missing Skills/ })).toBeVisible();
});

test("a fit link opens its fit, and the url keeps it", async ({ page }) => {
  // v3 link of "Link Rifter" with a 200mm AutoCannon I.
  await page.goto(
    "/?fit=v3:H4sIAAAAAAAAAyvOyCzQMbUw1/HJzMtWCMpMK0kt0uHKzU8pzUnV8chMz9Ax1DGyMDfWcUwuySxL1TG0MEWRNcKQTSnKz0vVMTKxMNMx1DHgSk4sSs8HSegYGhhwAQBLJK6dbwAAAA==&x=1#h",
  );
  await expect(page.getByText("Link Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).search + new URL(page.url()).hash).toMatch(/^\?x=1&fit=esf1:[\w-]+#h$/);

  await page.reload();
  await expect(page.getByText("Link Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
});

test("an edit to the fit updates the url", async ({ page }) => {
  const link = () => new URL(page.url()).searchParams.get("fit");
  await page.goto("/");
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  const empty = link();
  expect(empty).toMatch(/^esf1:/);

  await page.getByRole("tab", { name: "Modules" }).click();
  await page.getByRole("searchbox", { name: "Search" }).fill("damage control ii");
  await page.getByRole("button", { name: "Damage Control II", exact: true }).dblclick();
  const fitting = page.getByRole("region", { name: "Fitting" });
  await expect(fitting.getByRole("button", { name: /^Damage Control II,/ })).toBeVisible();
  await expect.poll(link).not.toBe(empty);
  const edited = link();

  const history = page.getByRole("group", { name: "Simulation History" });
  await history.getByRole("button", { name: "Back" }).click();
  await expect(fitting.getByRole("button", { name: /^Damage Control II,/ })).toHaveCount(0);
  expect(link()).toBe(empty);
  await history.getByRole("button", { name: "Forward" }).click();
  expect(link()).toBe(edited);

  await page.reload();
  await expect(fitting.getByRole("button", { name: /^Damage Control II,/ })).toBeVisible({ timeout: 30_000 });
});

test("a broken fit link opens a Rifter", async ({ page }) => {
  await page.goto("/?fit=v3:broken");
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).searchParams.get("fit")).toMatch(/^esf1:/);
});

test("the item browser and statistics go below the window on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Statistics" })).toBeAttached({ timeout: 30_000 });
  await expect(page.getByRole("region", { name: "Item Browser" })).toBeAttached();
  await expect(page.getByRole("button", { name: "Statistics" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Item Browser" })).toHaveCount(0);
});

test("Support shows both ways to donate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Support" }).click();
  const card = page.getByRole("dialog", { name: "Support EVEShip.fit" });
  await expect(card.getByRole("link", { name: "Sponsor on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/sponsors/EVEShipFit",
  );
  await expect(card.getByRole("link", { name: "EVEShip.fit" })).toHaveAttribute(
    "href",
    "https://evewho.com/corporation/98753333",
  );
  await expect(card.getByRole("button", { name: "Copy corporation name" })).toBeVisible();
});

test("fits saved by v1 move into the browser fittings", async ({ page }) => {
  const v1 = [{ name: "Old Rifter", shipTypeId: 587, modules: [], drones: [], cargo: [] }];
  await page.goto("/");
  await page.evaluate((fits) => localStorage.setItem("fits", JSON.stringify(fits)), v1);
  await page.reload();

  await page.getByRole("button", { name: "Browser Fittings" }).click({ timeout: 30_000 });
  const hulls = page.getByRole("list", { name: "Hulls" });
  await hulls.getByRole("button", { name: "Frigate" }).click();
  await hulls.getByRole("button", { name: /^Minmatar/ }).click();
  await expect(hulls.getByRole("button", { name: "Rifter", exact: true })).toHaveAccessibleDescription(
    /^Browser Fittings: 1 /,
  );
  await expect
    .poll(() => page.evaluate(() => [localStorage.getItem("fits"), localStorage.getItem("fits-v1")]))
    .toEqual([null, JSON.stringify(v1)]);
});
