import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cleanSiteSettings, createSiteSettingsStorage } from "../scripts/lib/site-settings.mjs";

test("imposta Optima e rifiuta valori CSS o URL non sicuri", () => {
  assert.match(cleanSiteSettings({}).fontFamily, /^Optima/);
  const settings = cleanSiteSettings({ fontFamily: "Arial;display:none", fontUrl: "https://example.test/font.css" });
  assert.match(settings.fontFamily, /^Optima/);
  assert.equal(settings.fontUrl, "");
});

test("salva e genera il foglio tipografico globale", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "claudia-site-settings-"));
  const defaultPath = path.join(root, "defaults.json");
  await writeFile(defaultPath, '{"version":1,"fontFamily":"Optima, sans-serif","fontUrl":""}\n');
  const storage = createSiteSettingsStorage({ dataDir: path.join(root, "runtime"), defaultPath });
  try {
    await storage.save({ fontFamily: "Avenir, sans-serif", fontUrl: "" });
    assert.equal((await storage.read()).fontFamily, "Avenir, sans-serif");
    assert.match(await storage.css(), /--site-font-family:Avenir, sans-serif/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
