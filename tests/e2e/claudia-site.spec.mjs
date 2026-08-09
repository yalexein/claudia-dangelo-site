import { expect, test } from "@playwright/test";

test("la Home apre la pagina Collage pubblica", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[href*="site-settings.css"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Optima");
  const collageLink = page.locator('a[href^="/collage/"]').first();
  await expect(collageLink).toBeAttached();
  await collageLink.click({ force: true });
  await expect(page).toHaveURL(/\/collage\//);
  await expect(page).toHaveTitle(/Collage/);
  await expect(page.locator("[data-composition-images] button")).toHaveCount(24);
  await expect.poll(() => page.locator("[data-composition-images] img").evaluateAll((images) => (
    images.every((image) => image.complete && image.naturalWidth > 0)
  ))).toBe(true);
});

test("la Home scambia Scritture e Curriculum sulle due immagini richieste", async ({ page }) => {
  await page.goto("/?lang=it");

  const formerWritingImage = page.locator('[data-id="image-1782474989202-11"]');
  await expect(formerWritingImage).toHaveAttribute("href", /\/cv\/\?lang=it$/);
  await expect(formerWritingImage).toHaveAttribute("aria-label", "Vai al curriculum");

  const formerCurriculumImage = page.locator('[data-id="image-1782474994604-13"]');
  await expect(formerCurriculumImage).toHaveAttribute("href", /\/scritture-esplorazioni\/g1-revisione\.html\?lang=it$/);
  await expect(formerCurriculumImage).toHaveAttribute("aria-label", "Vai alle scritture");
});

test("l’editor carica Collage con tutti gli elementi e i tre profili responsive", async ({ page }) => {
  await page.goto("/__editor/?page=collage");
  await expect(page.getByRole("heading", { name: "Nessun elemento" })).toBeVisible();
  await expect(page.locator("[data-page-select]")).toHaveValue("collage");
  await expect(page.locator("[data-device]")).toHaveCount(3);

  const quickSelect = page.locator("[data-quick-select]");
  await expect.poll(async () => quickSelect.locator("option").count()).toBeGreaterThanOrEqual(65);

  const frame = page.frameLocator("[data-preview]");
  await expect(frame.locator("[data-composition-images] button")).toHaveCount(24);
  await expect(page.locator("[data-save-state]")).toHaveText("Salvato");
});

test("le pagine canoniche condividono l’header con Home e il nome della pagina", async ({ page }) => {
  const pages = [
    ["/bio/?lang=it", "Bio"],
    ["/contatti/?lang=it", "Contatti"],
    ["/uccelli/?lang=it", "Uccelli"],
    ["/miscellanea/?lang=it", "Miscellanea"],
    ["/cv/?lang=it", "CV"],
    ["/collage/?lang=it", "Collage"],
    ["/scritture-esplorazioni/g1-revisione.html?lang=it", "Scritture"],
    ["/scritture-esplorazioni/libri.html?lang=it", "Libri"],
    ["/scritture-esplorazioni/racconti.html?lang=it", "Racconti"],
    ["/scritture-esplorazioni/articoli.html?lang=it", "Articoli"],
    ["/scritture-esplorazioni/blog.html?lang=it", "Blog"],
  ];

  for (const [path, title] of pages) {
    await page.goto(path);
    const header = page.locator(".site-page-header");
    await expect(header.getByRole("link", { name: "home", exact: true })).toBeVisible();
    await expect(header.locator(".site-page-header__title")).toBeVisible();
    await expect(header.locator(".site-page-header__title")).toContainText(title);
    await expect(header.locator(".site-language-switcher")).toBeVisible();
    await expect(header.locator("[data-locale-option]")).toHaveCount(2);
    await expect(page.locator('link[href*="site-settings.css"]')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Optima");
  }

  await page.goto("/miscellanea/?lang=it");
  await expect(page.getByText("in aggiornamento", { exact: true })).toHaveCount(0);
});

test("il toggle inglese traduce le pagine che prima erano monolingui", async ({ page }) => {
  await page.goto("/collage/?lang=en");
  await expect(page.locator(".site-language-switcher [aria-current='true']")).toHaveText("EN");
  await expect(page.getByText("24 opere · ritagli · sovrapposizioni", { exact: true })).toHaveCount(0);

  await page.goto("/scritture-esplorazioni/racconti.html?lang=en");
  await expect(page.locator(".archive-header h1")).toHaveText("Stories");
  await expect(page.getByRole("heading", { name: "Sailor Moon Friend", exact: true })).toBeVisible();

  await page.goto("/scritture-esplorazioni/g1-revisione.html?lang=en");
  await expect(page.getByText("Magical realism, horror, ‘Phlegraean Gothic’", { exact: false })).toBeVisible();
  await expect(page.getByText("Realismo magico, horror, “gotico flegreo”", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /All stories/ }).first()).toHaveAttribute("href", /racconti\.html\?lang=en$/);

  await page.goto("/cv/?lang=it");
  await expect(page.getByRole("tab", { name: "Scrittura", exact: true })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Bio", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Bio", exact: true }).click();
  await expect(page.getByText("Scrivo e faccio collage.", { exact: false })).toBeVisible();

  await page.goto("/cv/?lang=en");
  await page.getByRole("tab", { name: "Bio", exact: true }).click();
  await expect(page.getByText("I write and make collages.", { exact: false })).toBeVisible();
});

test("la dashboard Scritture crea una bozza, pubblica e poi elimina una scheda", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes("mobile"), "La dashboard protetta è una superficie desktop");
  await page.goto("/__editor/?dashboard=scritture");
  await expect(page.getByRole("heading", { name: "Dashboard Scritture" })).toBeVisible();
  await expect(page.locator("[data-writing-count]")).toContainText("20 di 20 schede");
  await expect(page.locator("[data-rich-toolbar]")).toHaveCount(2);
  await page.getByRole("button", { name: "Font del sito" }).click();
  await expect(page.getByRole("dialog").getByLabel("Famiglia del font")).toHaveValue(/Optima/);
  await page.getByRole("dialog").getByRole("button", { name: "Chiudi" }).click();

  await page.locator("[data-writing-new]").click();
  await page.locator('[data-writing-field="category"]').selectOption("blog");
  await page.locator('[data-writing-field="titleIt"]').fill("Scheda automatica di prova");
  await page.locator('[data-writing-field="excerptIt"]').fill("Questa scheda verifica il flusso editoriale.");
  await page.locator('[data-rich-editor="it"]').fill("Testo completo della scheda.");
  await page.locator("[data-writing-save-draft]").click();
  await expect(page.locator("[data-writing-status]")).toContainText("Bozza salvata");
  await page.locator('[data-writing-field="titleEn"]').fill("Automated test post");
  await page.locator('[data-writing-field="excerptEn"]').fill("This post verifies the editorial workflow.");
  await page.locator("[data-writing-form] button[type='submit']").click();
  await expect(page.locator("[data-writing-status]")).toContainText("Pubblicata nel sito");

  const publicPage = await page.context().newPage();
  await publicPage.goto("/scritture-esplorazioni/blog.html?lang=en");
  await expect(publicPage.getByRole("heading", { name: "Automated test post", exact: true })).toBeVisible();
  await publicPage.close();

  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("[data-writing-delete]").click();
  await expect(page.locator("[data-writing-status]")).toContainText("Scheda eliminata");
});
