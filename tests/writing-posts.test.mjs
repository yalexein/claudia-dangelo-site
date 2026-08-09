import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { cleanWritingPost, createWritingPostsStorage } from "../scripts/lib/writing-posts.mjs";

test("sanitizza una scheda bilingue e rifiuta protocolli non sicuri", () => {
  const post = cleanWritingPost({
    category: "articoli",
    status: "published",
    titleIt: "Titolo",
    titleEn: "Title",
    url: "javascript:alert(1)",
    imageUrl: "/uploads/editor/scritture-home/example.png",
  });
  assert.equal(post.category, "articoli");
  assert.equal(post.url, "");
  assert.equal(post.imageUrl, "/uploads/editor/scritture-home/example.png");
  assert.ok(post.publishedAt);
});

test("salva bozze incomplete e sanifica il testo ricco", () => {
  const draft = cleanWritingPost({
    category: "blog",
    status: "draft",
    titleIt: "Appunto",
    contentIt: '<h2 style="font-family:Optima">Titolo</h2><script>alert(1)</script><p onclick="alert(2)"><strong>Testo</strong></p>',
  });
  assert.equal(draft.titleEn, "");
  assert.match(draft.contentIt, /font-family:Optima/);
  assert.doesNotMatch(draft.contentIt, /script|onclick|alert/);
});

test("crea, pubblica e rimuove schede persistenti", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "claudia-writing-posts-"));
  const defaultPath = path.join(root, "defaults.json");
  await writeFile(defaultPath, '{"version":1,"posts":[]}\n');
  const storage = createWritingPostsStorage({ dataDir: path.join(root, "data"), defaultPath });
  try {
    const draft = await storage.create({ category: "blog", status: "draft", titleIt: "Bozza", titleEn: "Draft" });
    assert.equal((await storage.list({ publishedOnly: true })).length, 0);
    const published = await storage.update(draft.id, { ...draft, status: "published", titleIt: "Pubblicato", titleEn: "Published" });
    assert.equal((await storage.list({ publishedOnly: true }))[0].id, published.id);
    await storage.remove(published.id);
    assert.equal((await storage.list()).length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
