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
  await expect(page.getByText("Rifter", { exact: true })).toBeVisible();
});

test("the statistics go below the window on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Statistics" })).toBeAttached({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "Statistics" })).toHaveCount(0);
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
