import assert from "node:assert/strict";
import test from "node:test";
import { cleanEditorConfiguration, createEditorPages } from "../scripts/lib/editor-registry.mjs";

const cleaned = cleanEditorConfiguration({
  global: {
    fontUrl: "https://fonts.googleapis.com/css2?family=Inter",
    variables: {
      "--contact-aqua": "#ffffff",
      "--not-allowed": "red",
    },
  },
  elements: {
    '[data-contact-edit="collage-image-1"]': {
      label: "Opera",
      src: "/uploads/editor/collage/opera.png",
      styles: {
        base: { width: "20rem", position: "absolute", behavior: "url(javascript:bad)" },
        print: { width: "100%" },
      },
    },
    '[data-contact-edit="inline-image"]': {
      src: "data:image/png;base64,AAAA",
      styles: {},
    },
    "body > script": {
      text: "unsafe",
      styles: { base: { color: "red" } },
    },
  },
});

test("sanitizza configurazioni e conserva solo contratti supportati", () => {
  assert.equal(cleaned.global.fontUrl, "https://fonts.googleapis.com/css2?family=Inter");
  assert.deepEqual(cleaned.global.variables, { "--contact-aqua": "#ffffff" });
  assert.equal(cleaned.elements['[data-contact-edit="collage-image-1"]'].src, "/uploads/editor/collage/opera.png");
  assert.deepEqual(cleaned.elements['[data-contact-edit="collage-image-1"]'].styles.base, {
    width: "20rem",
    position: "absolute",
  });
  assert.equal(cleaned.elements['[data-contact-edit="inline-image"]'], undefined);
  assert.equal(cleaned.elements["body > script"], undefined);
});

test("registra tutte le undici superfici dell’editor", () => {
  const pages = createEditorPages("/tmp/site", "/tmp/runtime");
  assert.equal(Object.keys(pages).length, 11);
  assert.equal(pages.collage.publicPathname, "/collage-customization.json");
  assert.match(pages["scritture-blog"].runtimePath, /editor-config\/scritture-blog-customization\.json$/);
});
