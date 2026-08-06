import { expect, test } from "@playwright/test";

test("la Home apre la pagina Collage pubblica", async ({ page }) => {
  await page.goto("/");
  const collageLink = page.locator('a[href^="/collage/"]').first();
  await expect(collageLink).toBeAttached();
  await collageLink.click({ force: true });
  await expect(page).toHaveURL(/\/collage\//);
  await expect(page).toHaveTitle(/Collage/);
  await expect(page.locator("[data-composition-images] button")).toHaveCount(24);
});

test("l’editor carica Collage con 66 elementi e i tre profili responsive", async ({ page }) => {
  await page.goto("/__editor/?page=collage");
  await expect(page.getByRole("heading", { name: "Nessun elemento" })).toBeVisible();
  await expect(page.locator("[data-page-select]")).toHaveValue("collage");
  await expect(page.locator("[data-device]")).toHaveCount(3);

  const quickSelect = page.locator("[data-quick-select]");
  await expect.poll(async () => quickSelect.locator("option").count()).toBe(66);

  const frame = page.frameLocator("[data-preview]");
  await expect(frame.locator("[data-composition-images] button")).toHaveCount(24);
  await expect(page.locator("[data-save-state]")).toHaveText("Salvato");
});
