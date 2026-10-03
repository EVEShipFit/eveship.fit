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
  await page.getByRole("combobox", { name: "Skills:" }).selectOption("None");
  await expect(page.getByRole("img", { name: /^Missing Skills/ })).toBeVisible();
});

test("a fit link opens its fit once", async ({ page }) => {
  // v3 link of "Link Rifter" with a 200mm AutoCannon I.
  await page.goto(
    "/?fit=v3:H4sIAAAAAAAAAyvOyCzQMbUw1/HJzMtWCMpMK0kt0uHKzU8pzUnV8chMz9Ax1DGyMDfWcUwuySxL1TG0MEWRNcKQTSnKz0vVMTKxMNMx1DHgSk4sSs8HSegYGhhwAQBLJK6dbwAAAA==&x=1#h",
  );
  await expect(page.getByText("Link Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).search + new URL(page.url()).hash).toBe("?x=1#h");
});

test("a broken fit link opens a Rifter", async ({ page }) => {
  await page.goto("/?fit=v3:broken");
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).search).toBe("");
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
