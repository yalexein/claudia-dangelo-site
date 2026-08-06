import assert from "node:assert/strict";
import test from "node:test";
import { createEditorAuth } from "../scripts/lib/editor-auth.mjs";

function request({ host = "claudia-editor.example.test", origin, cookie, fetchSite } = {}) {
  return {
    headers: {
      host,
      ...(origin ? { origin } : {}),
      ...(cookie ? { cookie } : {}),
      ...(fetchSite ? { "sec-fetch-site": fetchSite } : {}),
    },
  };
}

test("usa una sessione firmata invece di memorizzare il token nel cookie", () => {
  const auth = createEditorAuth({
    publicEditorHost: "claudia-editor.example.test",
    publicEditorToken: "segreto-lungo",
    sessionTtlMs: 60_000,
  });
  const session = auth.createSessionValue(1_000);
  assert.equal(session.includes("segreto-lungo"), false);
  assert.equal(auth.sessionIsValid(session, 1_500), true);
  assert.equal(auth.sessionIsValid(session, 62_000), false);
});

test("autorizza le mutazioni soltanto dalla stessa origine", () => {
  const auth = createEditorAuth({
    publicEditorHost: "claudia-editor.example.test",
    publicEditorToken: "segreto-lungo",
  });
  assert.equal(auth.mutationOriginIsAllowed(request({ origin: "https://claudia-editor.example.test", fetchSite: "same-origin" })), true);
  assert.equal(auth.mutationOriginIsAllowed(request({ origin: "https://attacker.example", fetchSite: "cross-site" })), false);
  assert.equal(auth.mutationOriginIsAllowed(request()), false);
  assert.equal(auth.mutationOriginIsAllowed(request({ host: "127.0.0.1:4324" })), true);
});

test("migra il vecchio cookie contenente il token verso una sessione firmata", () => {
  const auth = createEditorAuth({
    publicEditorHost: "claudia-editor.example.test",
    publicEditorToken: "segreto-lungo",
  });
  let responseHeaders;
  const response = {
    writeHead(_status, headers) {
      responseHeaders = headers;
      return this;
    },
    end() {},
  };
  const url = new URL("https://claudia-editor.example.test/__editor/?page=collage");
  assert.equal(auth.establishLegacySession(request({ cookie: "claudia_editor_access=segreto-lungo" }), response, url), true);
  assert.equal(Array.isArray(responseHeaders["Set-Cookie"]), true);
  assert.match(responseHeaders["Set-Cookie"][0], /claudia_editor_session=/);
  assert.match(responseHeaders["Set-Cookie"][1], /claudia_editor_access=; Path=\/; Max-Age=0/);
  assert.equal(responseHeaders["Set-Cookie"][0].includes("segreto-lungo"), false);
});

test("stabilisce una sessione e rimuove il token dalla destinazione", () => {
  const auth = createEditorAuth({
    publicEditorHost: "claudia-editor.example.test",
    publicEditorToken: "segreto-lungo",
  });
  let responseStatus;
  let responseHeaders;
  const response = {
    writeHead(status, headers) {
      responseStatus = status;
      responseHeaders = headers;
      return this;
    },
    end() {},
  };
  const url = new URL("https://claudia-editor.example.test/__editor/?page=collage&access=segreto-lungo");
  assert.equal(auth.establishSession(request(), response, url), true);
  assert.equal(responseStatus, 302);
  assert.equal(responseHeaders.Location, "/__editor/?page=collage");
  assert.match(responseHeaders["Set-Cookie"], /HttpOnly; Secure; SameSite=Strict/);
  assert.equal(responseHeaders["Set-Cookie"].includes("segreto-lungo"), false);
});
