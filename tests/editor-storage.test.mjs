import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createEditorPages } from "../scripts/lib/editor-registry.mjs";
import { createEditorStorage } from "../scripts/lib/editor-storage.mjs";

const legacyConfiguration = {
  version: 1,
  global: { fontUrl: "", variables: {} },
  elements: {
    '[data-contact-edit="writing-title"]': {
      label: "Titolo",
      text: "Versione salvata nel vecchio editor",
      styles: { base: { width: "42rem" } },
    },
  },
};

test("migra guestbook, backup e configurazioni legacy senza sovrascrivere lo stato runtime", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "claudia-storage-test-"));
  const siteRoot = path.join(root, "site");
  const dataDir = path.join(root, "runtime");
  const legacyRoot = path.join(root, "legacy-site");
  const legacyData = path.join(legacyRoot, "data");
  const editorPages = createEditorPages(siteRoot, dataDir);
  const storage = createEditorStorage({ dataDir, editorPages });

  try {
    await mkdir(path.join(legacyRoot, "public"), { recursive: true });
    await mkdir(path.join(legacyData, "contact-editor-backups"), { recursive: true });
    await writeFile(path.join(legacyRoot, "public", "scritture-home-customization.json"), JSON.stringify(legacyConfiguration));
    await writeFile(path.join(legacyData, "guestbook.json"), "[]\n");
    await writeFile(path.join(legacyData, "contact-editor-backups", "backup.json"), "{}\n");

    await storage.migrateLegacyData({ legacyDataDir: legacyData, legacyRootDir: legacyRoot });

    const migrated = JSON.parse(await readFile(editorPages["scritture-home"].runtimePath, "utf8"));
    assert.equal(migrated.elements['[data-contact-edit="writing-title"]'].text, "Versione salvata nel vecchio editor");
    assert.equal(await readFile(path.join(dataDir, "guestbook.json"), "utf8"), "[]\n");
    assert.equal(await readFile(path.join(dataDir, "editor-backups", "backup.json"), "utf8"), "{}\n");

    const protectedRuntime = { ...legacyConfiguration, elements: {} };
    await writeFile(editorPages["scritture-home"].runtimePath, JSON.stringify(protectedRuntime));
    await storage.migrateLegacyData({ legacyDataDir: legacyData, legacyRootDir: legacyRoot });
    const afterSecondMigration = JSON.parse(await readFile(editorPages["scritture-home"].runtimePath, "utf8"));
    assert.deepEqual(afterSecondMigration.elements, {});
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
