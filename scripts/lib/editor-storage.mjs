import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { cleanEditorConfiguration } from "./editor-registry.mjs";
import { baseSecurityHeaders, mimeTypes } from "./http-utils.mjs";

const uploadTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

function detectedImageType(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) {
    return "image/gif";
  }
  if (
    buffer.length >= 12
    && buffer.subarray(0, 4).toString("ascii") === "RIFF"
    && buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return "";
}

async function readJson(pathname) {
  return JSON.parse(await readFile(pathname, "utf8"));
}

async function pathExists(pathname) {
  try {
    await stat(pathname);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function writeAtomic(pathname, content) {
  await mkdir(path.dirname(pathname), { recursive: true });
  const temporaryPath = `${pathname}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, pathname);
}

async function pruneBackups(directory, prefix, keep = 50) {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.startsWith(`${prefix}-`) && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  await Promise.all(files.slice(keep).map((filename) => rm(path.join(directory, filename), { force: true })));
}

export function createEditorStorage({ dataDir, editorPages }) {
  const backupDir = path.join(dataDir, "editor-backups");
  const uploadDir = path.join(dataDir, "editor-assets");
  const pathnameToPage = new Map(Object.values(editorPages).map((page) => [page.publicPathname, page]));

  async function readConfiguration(pageDefinition) {
    const sourcePath = await pathExists(pageDefinition.runtimePath) ? pageDefinition.runtimePath : pageDefinition.defaultPath;
    try {
      return cleanEditorConfiguration(await readJson(sourcePath));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      return cleanEditorConfiguration({});
    }
  }

  async function saveConfiguration(configuration, pageDefinition) {
    const cleanConfiguration = cleanEditorConfiguration(configuration);
    const serialized = `${JSON.stringify(cleanConfiguration, null, 2)}\n`;
    await mkdir(backupDir, { recursive: true });

    const previousPath = await pathExists(pageDefinition.runtimePath) ? pageDefinition.runtimePath : pageDefinition.defaultPath;
    if (await pathExists(previousPath)) {
      const previous = await readFile(previousPath);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await writeAtomic(path.join(backupDir, `${pageDefinition.backupPrefix}-${stamp}.json`), previous);
      await pruneBackups(backupDir, pageDefinition.backupPrefix);
    }

    await writeAtomic(pageDefinition.runtimePath, serialized);
    return cleanConfiguration;
  }

  async function saveAsset({ pageName, mimeType, buffer }) {
    const pageDefinition = editorPages[pageName];
    const declaredType = String(mimeType || "").split(";")[0].trim().toLowerCase();
    const detectedType = detectedImageType(buffer);
    const extension = uploadTypes.get(detectedType);
    if (!pageDefinition) throw new Error("Pagina non configurata nell’editor");
    if (!buffer.length) throw new Error("Immagine vuota");
    if (!extension || declaredType !== detectedType) throw new Error("Formato immagine non valido");

    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}${extension}`;
    const pageUploadDir = path.join(uploadDir, pageName);
    await writeAtomic(path.join(pageUploadDir, filename), buffer);
    return `/uploads/editor/${encodeURIComponent(pageName)}/${filename}`;
  }

  async function serveRuntimeConfiguration(request, response, pathname) {
    const pageDefinition = pathnameToPage.get(pathname);
    if (!pageDefinition) return false;
    const payload = `${JSON.stringify(await readConfiguration(pageDefinition), null, 2)}\n`;
    response.writeHead(200, {
      ...baseSecurityHeaders,
      "Cache-Control": "no-cache",
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
    });
    if (request.method === "HEAD") response.end();
    else response.end(payload);
    return true;
  }

  async function serveAsset(request, response, pathname) {
    if (!pathname.startsWith("/uploads/editor/")) return false;
    const relativePath = decodeURIComponent(pathname.slice("/uploads/editor/".length));
    const filePath = path.resolve(uploadDir, relativePath);
    if (filePath !== uploadDir && !filePath.startsWith(`${uploadDir}${path.sep}`)) {
      response.writeHead(403, baseSecurityHeaders).end("Forbidden");
      return true;
    }
    try {
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error("Not found");
      response.writeHead(200, {
        ...baseSecurityHeaders,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
        "Content-Length": fileStat.size,
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404, baseSecurityHeaders).end("Not found");
    }
    return true;
  }

  async function migrateLegacyData({ legacyDataDir, legacyRootDir } = {}) {
    await mkdir(dataDir, { recursive: true });

    if (legacyDataDir && path.resolve(legacyDataDir) !== path.resolve(dataDir) && await pathExists(legacyDataDir)) {
      const legacyMappings = [
        ["guestbook.json", "guestbook.json"],
        ["contact-editor-backups", "editor-backups"],
      ];
      for (const [sourceName, destinationName] of legacyMappings) {
        const source = path.join(legacyDataDir, sourceName);
        const destination = path.join(dataDir, destinationName);
        if (!(await pathExists(source)) || await pathExists(destination)) continue;
        await cp(source, destination, { recursive: true, errorOnExist: false });
      }
    }

    if (!legacyRootDir || !(await pathExists(legacyRootDir))) return;
    for (const pageDefinition of Object.values(editorPages)) {
      const source = path.join(legacyRootDir, "public", path.basename(pageDefinition.defaultPath));
      if (!(await pathExists(source)) || await pathExists(pageDefinition.runtimePath)) continue;
      await mkdir(path.dirname(pageDefinition.runtimePath), { recursive: true });
      await cp(source, pageDefinition.runtimePath, { errorOnExist: true });
    }
  }

  return {
    migrateLegacyData,
    readConfiguration,
    saveAsset,
    saveConfiguration,
    serveAsset,
    serveRuntimeConfiguration,
  };
}
