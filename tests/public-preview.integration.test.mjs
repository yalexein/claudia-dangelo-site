import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=",
  "base64",
);

async function waitForServer(url, child) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Server terminato con codice ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Server di integrazione non disponibile");
}

test("serve sito, editor, configurazioni runtime e asset", { timeout: 20_000 }, async () => {
  const runtimeDir = await mkdtemp(path.join(os.tmpdir(), "claudia-preview-test-"));
  const port = 4400 + (process.pid % 300);
  const origin = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["scripts/public-preview-server.mjs"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PUBLIC_PREVIEW_HOST: "127.0.0.1",
      PUBLIC_PREVIEW_PORT: String(port),
      PUBLIC_PREVIEW_DATA_DIR: runtimeDir,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForServer(`${origin}/api/health`, child);

    assert.equal((await fetch(`${origin}/`)).status, 200);
    assert.equal((await fetch(`${origin}/collage/`)).status, 200);
    assert.equal((await fetch(`${origin}/__editor/?page=collage`)).status, 200);

    const configuration = {
      version: 1,
      global: { fontUrl: "", variables: {} },
      elements: {
        '[data-contact-edit="collage-image-1"]': {
          label: "Opera 1",
          src: "/images/collage/example.png",
          styles: { base: { width: "22rem" } },
        },
      },
    };
    const saveResponse = await fetch(`${origin}/api/site-editor?page=collage`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(configuration),
    });
    assert.equal(saveResponse.status, 200);

    const runtimeResponse = await fetch(`${origin}/collage-customization.json`);
    const runtimeConfiguration = await runtimeResponse.json();
    assert.equal(runtimeConfiguration.elements['[data-contact-edit="collage-image-1"]'].styles.base.width, "22rem");

    const uploadResponse = await fetch(`${origin}/api/editor-assets?page=collage`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: onePixelPng,
    });
    assert.equal(uploadResponse.status, 201);
    const { url } = await uploadResponse.json();
    assert.match(url, /^\/uploads\/editor\/collage\/.+\.png$/);
    assert.equal((await fetch(`${origin}${url}`)).status, 200);

    const spoofedUpload = await fetch(`${origin}/api/editor-assets?page=collage`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: Buffer.from("non è davvero un PNG"),
    });
    assert.equal(spoofedUpload.status, 400);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    await rm(runtimeDir, { recursive: true, force: true });
  }
});
