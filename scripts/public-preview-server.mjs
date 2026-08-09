import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEditorAuth } from "./lib/editor-auth.mjs";
import { createEditorPages } from "./lib/editor-registry.mjs";
import { createEditorStorage } from "./lib/editor-storage.mjs";
import { createSiteSettingsStorage } from "./lib/site-settings.mjs";
import { createWritingPostsStorage } from "./lib/writing-posts.mjs";
import {
  baseSecurityHeaders,
  cleanText,
  editorSecurityHeaders,
  mimeTypes,
  readJsonBody,
  readRequestBuffer,
  sendJson,
} from "./lib/http-utils.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const contactEditorDir = path.join(rootDir, "tools", "contact-editor");
const dataDir = process.env.PUBLIC_PREVIEW_DATA_DIR
  ? path.resolve(process.env.PUBLIC_PREVIEW_DATA_DIR)
  : path.join(rootDir, "data");
const guestbookPath = path.join(dataDir, "guestbook.json");
const guestbookTempPath = path.join(dataDir, "guestbook.json.tmp");
const host = process.env.PUBLIC_PREVIEW_HOST || "127.0.0.1";
const port = Number(process.env.PUBLIC_PREVIEW_PORT || 4322);
const maxJsonBodyBytes = 6 * 1024 * 1024;
const maxImageBodyBytes = 5 * 1024 * 1024;
const rateLimitMs = 20_000;
const maxEntries = 200;
const recentPosts = new Map();
let guestbookWriteQueue = Promise.resolve();

const editorPages = createEditorPages(rootDir, dataDir);
const editorStorage = createEditorStorage({ dataDir, editorPages });
const writingPostsStorage = createWritingPostsStorage({
  dataDir,
  defaultPath: path.join(rootDir, "public", "writing-posts.json"),
});
const siteSettingsStorage = createSiteSettingsStorage({
  dataDir,
  defaultPath: path.join(rootDir, "public", "site-settings.json"),
});
const editorAuth = createEditorAuth({
  publicEditorHost: process.env.PUBLIC_EDITOR_HOST,
  publicEditorToken: process.env.PUBLIC_EDITOR_TOKEN,
});

await editorStorage.migrateLegacyData({
  legacyDataDir: process.env.PUBLIC_PREVIEW_LEGACY_DATA_DIR,
  legacyRootDir: process.env.PUBLIC_PREVIEW_LEGACY_ROOT_DIR,
});

async function readEntries() {
  try {
    const parsed = JSON.parse(await readFile(guestbookPath, "utf8"));
    return Array.isArray(parsed) ? parsed.slice(0, maxEntries) : [];
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function saveEntries(entries) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(guestbookTempPath, `${JSON.stringify(entries.slice(0, maxEntries), null, 2)}\n`, "utf8");
  await rename(guestbookTempPath, guestbookPath);
}

function clientAddress(request) {
  const forwarded = String(request.headers["cf-connecting-ip"] || request.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0].trim() || request.socket.remoteAddress || "unknown";
}

async function handleGuestbook(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, { entries: await readEntries() });
    return;
  }
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Metodo non supportato" });
    return;
  }

  const address = clientAddress(request);
  const lastPost = recentPosts.get(address) || 0;
  if (Date.now() - lastPost < rateLimitMs) {
    sendJson(response, 429, { error: "Attendi qualche secondo prima di pubblicare ancora" });
    return;
  }

  try {
    const body = await readJsonBody(request, 16 * 1024);
    if (cleanText(body.website, 200)) {
      sendJson(response, 200, { entries: await readEntries() });
      return;
    }

    const name = cleanText(body.name, 60);
    const message = cleanText(body.message, 500);
    if (name.length < 2 || message.length < 2) {
      sendJson(response, 400, { error: "Nome e messaggio sono obbligatori" });
      return;
    }

    const entry = { id: randomUUID(), name, message, createdAt: new Date().toISOString() };
    let nextEntries = [];
    guestbookWriteQueue = guestbookWriteQueue.then(async () => {
      nextEntries = [entry, ...(await readEntries())].slice(0, maxEntries);
      await saveEntries(nextEntries);
    });
    await guestbookWriteQueue;
    recentPosts.set(address, Date.now());
    sendJson(response, 201, { entries: nextEntries });
  } catch (error) {
    sendJson(response, 400, { error: error?.message || "Messaggio non valido" });
  }
}

async function handleEditorGuestbook(request, response, requestUrl) {
  if (request.method === "GET") {
    sendJson(response, 200, { entries: await readEntries() }, editorSecurityHeaders);
    return;
  }
  if (request.method !== "DELETE") {
    sendJson(response, 405, { error: "Metodo non supportato" }, editorSecurityHeaders);
    return;
  }

  const id = cleanText(requestUrl.searchParams.get("id"), 100);
  if (!id) {
    sendJson(response, 400, { error: "Messaggio non specificato" }, editorSecurityHeaders);
    return;
  }

  let removed = false;
  let nextEntries = [];
  guestbookWriteQueue = guestbookWriteQueue.then(async () => {
    const entries = await readEntries();
    nextEntries = entries.filter((entry) => {
      const matches = entry?.id === id;
      if (matches) removed = true;
      return !matches;
    });
    if (removed) await saveEntries(nextEntries);
  });
  await guestbookWriteQueue;

  if (!removed) {
    sendJson(response, 404, { error: "Messaggio non trovato" }, editorSecurityHeaders);
    return;
  }
  sendJson(response, 200, { entries: nextEntries }, editorSecurityHeaders);
}

async function handlePublicWritingPosts(request, response) {
  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Metodo non supportato" });
    return;
  }
  sendJson(response, 200, { posts: await writingPostsStorage.list({ publishedOnly: true }) });
}

async function handleSiteSettings(request, response) {
  if (request.method === "GET") {
    sendJson(response, 200, await siteSettingsStorage.read(), editorSecurityHeaders);
    return;
  }
  if (request.method !== "PUT") {
    sendJson(response, 405, { error: "Metodo non supportato" }, editorSecurityHeaders);
    return;
  }
  try {
    sendJson(response, 200, await siteSettingsStorage.save(await readJsonBody(request, 8 * 1024)), editorSecurityHeaders);
  } catch (error) {
    sendJson(response, 400, { error: error?.message || "Impostazioni non valide" }, editorSecurityHeaders);
  }
}

async function handleSiteSettingsCss(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, baseSecurityHeaders).end("Method not allowed");
    return;
  }
  const body = await siteSettingsStorage.css();
  response.writeHead(200, {
    ...baseSecurityHeaders,
    "Cache-Control": "no-cache",
    "Content-Type": "text/css; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(request.method === "HEAD" ? undefined : body);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function serveEditorLogin(response, requestUrl) {
  const allowedParams = ["dashboard", "page", "lang"];
  const hiddenFields = allowedParams.map((name) => {
    const value = requestUrl.searchParams.get(name);
    return value ? `<input type="hidden" name="${name}" value="${escapeHtml(value)}">` : "";
  }).join("");
  const body = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Accesso editor · Claudia</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{display:grid;min-height:100vh;margin:0;place-items:center;background:#0f1110;color:#f4f0e7;font:16px Optima,Avenir,sans-serif}.card{width:min(440px,calc(100% - 32px));padding:34px;border:1px solid #38403b;border-radius:16px;background:#171a19;box-shadow:0 24px 80px #0008}.mark{display:grid;width:52px;height:52px;margin-bottom:24px;place-items:center;border-radius:50%;background:#70cabc;color:#082a26;font:700 28px Georgia,serif}h1{margin:0 0 8px;font-size:31px}p{margin:0 0 24px;color:#a6aaa4;line-height:1.5}label{display:grid;gap:8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}input{width:100%;height:48px;padding:0 13px;border:1px solid #4b544f;border-radius:8px;background:#0f1110;color:#fff;font:16px ui-monospace,monospace}button{width:100%;height:48px;margin-top:14px;border:0;border-radius:8px;background:#70cabc;color:#082a26;font-weight:800;cursor:pointer}</style></head><body><main class="card"><div class="mark">C</div><h1>Editor sito</h1><p>Inserisci la chiave di accesso dell’editor. La sessione resta protetta e la chiave viene rimossa subito dall’indirizzo.</p><form method="get" action="${escapeHtml(requestUrl.pathname)}">${hiddenFields}<label>Chiave di accesso<input type="password" name="access" required autocomplete="current-password" autofocus></label><button type="submit">Entra nell’editor</button></form></main></body></html>`;
  response.writeHead(401, {
    ...editorSecurityHeaders,
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  }).end(body);
}

async function handleEditorWritingPosts(request, response, requestUrl) {
  try {
    if (request.method === "GET") {
      sendJson(response, 200, { posts: await writingPostsStorage.list() }, editorSecurityHeaders);
      return;
    }

    const id = cleanText(requestUrl.searchParams.get("id"), 100);
    if (request.method === "POST") {
      const post = await writingPostsStorage.create(await readJsonBody(request, 256 * 1024));
      sendJson(response, 201, { post }, editorSecurityHeaders);
      return;
    }
    if (request.method === "PUT") {
      if (!id) throw Object.assign(new Error("Pubblicazione non specificata"), { statusCode: 400 });
      const post = await writingPostsStorage.update(id, await readJsonBody(request, 256 * 1024));
      sendJson(response, 200, { post }, editorSecurityHeaders);
      return;
    }
    if (request.method === "DELETE") {
      if (!id) throw Object.assign(new Error("Pubblicazione non specificata"), { statusCode: 400 });
      await writingPostsStorage.remove(id);
      sendJson(response, 200, { id }, editorSecurityHeaders);
      return;
    }
    sendJson(response, 405, { error: "Metodo non supportato" }, editorSecurityHeaders);
  } catch (error) {
    sendJson(response, error?.statusCode || 400, { error: error?.message || "Pubblicazione non valida" }, editorSecurityHeaders);
  }
}

async function handleEditorPageApi(request, response, pageDefinition) {
  if (request.method === "GET") {
    sendJson(response, 200, await editorStorage.readConfiguration(pageDefinition), editorSecurityHeaders);
    return;
  }
  if (request.method !== "PUT") {
    sendJson(response, 405, { error: "Metodo non supportato" }, editorSecurityHeaders);
    return;
  }
  try {
    const configuration = await readJsonBody(request, maxJsonBodyBytes);
    sendJson(response, 200, await editorStorage.saveConfiguration(configuration, pageDefinition), editorSecurityHeaders);
  } catch (error) {
    sendJson(response, 400, { error: error?.message || "Configurazione non valida" }, editorSecurityHeaders);
  }
}

async function handleSiteEditorApi(request, response, requestUrl) {
  const pageName = requestUrl.searchParams.get("page") || "contatti";
  const pageDefinition = editorPages[pageName];
  if (!pageDefinition) {
    sendJson(response, 404, { error: "Pagina non configurata nell’editor" }, editorSecurityHeaders);
    return;
  }
  await handleEditorPageApi(request, response, pageDefinition);
}

async function handleEditorAssetUpload(request, response, requestUrl) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Metodo non supportato" }, editorSecurityHeaders);
    return;
  }
  try {
    const buffer = await readRequestBuffer(request, maxImageBodyBytes);
    const url = await editorStorage.saveAsset({
      pageName: requestUrl.searchParams.get("page") || "contatti",
      mimeType: request.headers["content-type"],
      buffer,
    });
    sendJson(response, 201, { url }, editorSecurityHeaders);
  } catch (error) {
    sendJson(response, 400, { error: error?.message || "Immagine non valida" }, editorSecurityHeaders);
  }
}

async function serveContactEditor(request, response, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, editorSecurityHeaders).end("Method not allowed");
    return;
  }
  const relative = requestUrl.pathname.replace(/^\/__editor\/?/, "") || "index.html";
  const filePath = path.resolve(contactEditorDir, relative);
  if (filePath !== contactEditorDir && !filePath.startsWith(`${contactEditorDir}${path.sep}`)) {
    response.writeHead(403, editorSecurityHeaders).end("Forbidden");
    return;
  }
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not found");
    response.writeHead(200, {
      ...editorSecurityHeaders,
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": fileStat.size,
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, editorSecurityHeaders).end("Not found");
  }
}

function resolveStaticPath(requestUrl) {
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const resolved = path.resolve(distDir, `.${pathname}`);
  if (resolved !== distDir && !resolved.startsWith(`${distDir}${path.sep}`)) return null;
  return resolved;
}

async function serveStatic(request, response, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, baseSecurityHeaders).end("Method not allowed");
    return;
  }

  if (await editorStorage.serveRuntimeConfiguration(request, response, requestUrl.pathname)) return;
  if (await editorStorage.serveAsset(request, response, requestUrl.pathname)) return;

  let filePath = resolveStaticPath(requestUrl);
  if (!filePath) {
    response.writeHead(403, baseSecurityHeaders).end("Forbidden");
    return;
  }

  try {
    let fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      fileStat = await stat(filePath);
    }
    if (!fileStat.isFile()) throw new Error("Not found");

    response.writeHead(200, {
      ...baseSecurityHeaders,
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": fileStat.size,
      "Cache-Control": path.extname(filePath) === ".html" ? "no-cache" : "public, max-age=300",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    const fallback = path.join(distDir, "404.html");
    try {
      const fallbackStat = await stat(fallback);
      response.writeHead(404, {
        ...baseSecurityHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": fallbackStat.size,
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(fallback).pipe(response);
    } catch {
      response.writeHead(404, baseSecurityHeaders).end("Not found");
    }
  }
}

const server = createServer((request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const editorProtectedRoute = requestUrl.pathname === "/api/contact-editor"
    || requestUrl.pathname === "/api/site-editor"
    || requestUrl.pathname === "/api/editor-assets"
    || requestUrl.pathname === "/api/editor-guestbook"
    || requestUrl.pathname === "/api/editor-writing-posts"
    || requestUrl.pathname === "/api/site-settings"
    || requestUrl.pathname === "/__editor"
    || requestUrl.pathname.startsWith("/__editor/");

  if (requestUrl.pathname === "/api/health") {
    sendJson(response, 200, {
      ok: true,
      editorConfigured: editorAuth.configured,
      pid: process.pid,
      uptimeSeconds: Math.round(process.uptime()),
    });
    return;
  }

  if (requestUrl.pathname === "/" && editorAuth.configured && editorAuth.isPublicEditorRequest(request)) {
    response.writeHead(302, { ...editorSecurityHeaders, Location: "/__editor/" }).end();
    return;
  }

  if (
    editorProtectedRoute
    && request.method === "GET"
    && (
      editorAuth.establishSession(request, response, requestUrl)
      || editorAuth.establishLegacySession(request, response, requestUrl)
    )
  ) return;
  if (editorProtectedRoute && !editorAuth.isAuthorized(request)) {
    if (request.method === "GET" && (requestUrl.pathname === "/__editor" || requestUrl.pathname.startsWith("/__editor/"))) {
      serveEditorLogin(response, requestUrl);
      return;
    }
    response.writeHead(404, editorSecurityHeaders).end("Not found");
    return;
  }
  if (editorProtectedRoute && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method || "") && !editorAuth.mutationOriginIsAllowed(request)) {
    sendJson(response, 403, { error: "Origine non autorizzata" }, editorSecurityHeaders);
    return;
  }

  if (requestUrl.pathname === "/api/guestbook") {
    void handleGuestbook(request, response);
    return;
  }
  if (requestUrl.pathname === "/api/writing-posts") {
    void handlePublicWritingPosts(request, response);
    return;
  }
  if (requestUrl.pathname === "/site-settings.css") {
    void handleSiteSettingsCss(request, response);
    return;
  }
  if (requestUrl.pathname === "/api/contact-editor") {
    void handleEditorPageApi(request, response, editorPages.contatti);
    return;
  }
  if (requestUrl.pathname === "/api/site-editor") {
    void handleSiteEditorApi(request, response, requestUrl);
    return;
  }
  if (requestUrl.pathname === "/api/editor-assets") {
    void handleEditorAssetUpload(request, response, requestUrl);
    return;
  }
  if (requestUrl.pathname === "/api/editor-guestbook") {
    void handleEditorGuestbook(request, response, requestUrl);
    return;
  }
  if (requestUrl.pathname === "/api/editor-writing-posts") {
    void handleEditorWritingPosts(request, response, requestUrl);
    return;
  }
  if (requestUrl.pathname === "/api/site-settings") {
    void handleSiteSettings(request, response);
    return;
  }
  if (requestUrl.pathname === "/__editor" || requestUrl.pathname === "/__editor/contatti" || requestUrl.pathname === "/__editor/contatti/") {
    response.writeHead(302, { ...editorSecurityHeaders, Location: "/__editor/?page=contatti" }).end();
    return;
  }
  if (requestUrl.pathname.startsWith("/__editor/")) {
    void serveContactEditor(request, response, requestUrl);
    return;
  }
  void serveStatic(request, response, requestUrl);
});

server.listen(port, host, () => {
  console.log(`Claudia preview listening on http://${host}:${port}`);
});

function shutdown(signal) {
  console.log(`Received ${signal}; closing Claudia preview`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
