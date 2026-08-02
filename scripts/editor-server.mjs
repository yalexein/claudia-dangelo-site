import { createReadStream } from "node:fs";
import { chmod, copyFile, mkdir, readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(rootDir, "dist");
const dataDir = path.join(rootDir, "data");
const uploadDir = path.join(rootDir, "public", "uploads", "uccelli");
const uploadPublicPath = "/uploads/uccelli";
const rotatingBackupDir = path.join(dataDir, "editor-backups");
const manualBackupDir = path.join(dataDir, "editor-manual-saves");
const statePath = path.join(dataDir, "editor-state.json");
const tempStatePath = path.join(dataDir, "editor-state.json.tmp");
const backupStatePath = path.join(dataDir, "editor-state.backup.json");
const tempBackupStatePath = path.join(dataDir, "editor-state.backup.json.tmp");
const historyPath = path.join(dataDir, "editor-history.json");
const tempHistoryPath = path.join(dataDir, "editor-history.json.tmp");
const host = process.env.EDITOR_HOST || "0.0.0.0";
const port = Number(process.env.EDITOR_PORT || 4321);
const maxBodySize = Number(process.env.EDITOR_MAX_BODY_MB || 100) * 1024 * 1024;
const minClientVersion = 11;
const latestBackupIntervalMs = Number(process.env.EDITOR_LATEST_BACKUP_INTERVAL_MS || 120000);
const rotatingBackupIntervalMs = Number(process.env.EDITOR_BACKUP_INTERVAL_MS || 300000);
const historyRetentionMs = Number(process.env.EDITOR_HISTORY_RETENTION_HOURS || 24) * 60 * 60 * 1000;
const execFileAsync = promisify(execFile);
let backupWriteQueue = Promise.resolve();
let historyWriteQueue = Promise.resolve();
let shuttingDown = false;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function emptyState() {
  return {
    version: 1,
    revision: 0,
    updatedAt: null,
    updatedBy: null,
    data: {},
  };
}

function isEditorKey(key) {
  return (
    typeof key === "string" &&
    (key.startsWith("claudia-editor-") || key.startsWith("claudia-content-")) &&
    !key.startsWith("claudia-editor-shared-") &&
    key.length <= 256
  );
}

function preserveMissingDynamicContentBlocks(key, incomingValue, currentValue) {
  const serializedIncoming = String(incomingValue ?? "");
  if (!key.startsWith("claudia-content-")) return serializedIncoming;

  try {
    const incoming = JSON.parse(serializedIncoming);
    const current = currentValue ? JSON.parse(String(currentValue)) : null;
    if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.blocks)) return serializedIncoming;
    if (!current || typeof current !== "object" || !Array.isArray(current.blocks)) return serializedIncoming;

    const incomingIds = new Set(
      incoming.blocks
        .filter((block) => block && typeof block.id === "string")
        .map((block) => block.id),
    );
    const missingDynamicBlocks = current.blocks.filter(
      (block) =>
        block &&
        block.dynamic === true &&
        typeof block.id === "string" &&
        !incomingIds.has(block.id),
    );

    if (!missingDynamicBlocks.length) return serializedIncoming;

    incoming.blocks = [...incoming.blocks, ...missingDynamicBlocks.map((block) => ({ ...block }))];
    return JSON.stringify(incoming);
  } catch {
    return serializedIncoming;
  }
}

function mergeIncomingBlockTransform(currentBlock, incomingBlock) {
  const merged = { ...currentBlock };
  for (const field of ["x", "y", "rotate", "w", "z", "hidden"]) {
    if (incomingBlock[field] !== undefined) merged[field] = incomingBlock[field];
  }
  if (incomingBlock.style && typeof incomingBlock.style === "object") {
    merged.style = { ...(currentBlock.style || {}), ...incomingBlock.style };
  }
  if (incomingBlock.dynamic === true) merged.dynamic = true;
  if (typeof incomingBlock.type === "string") merged.type = incomingBlock.type;
  if (typeof incomingBlock.label === "string") merged.label = incomingBlock.label;
  return merged;
}

function mergeStaleContentBlocks(key, incomingValue, currentValue) {
  const serializedIncoming = String(incomingValue ?? "");
  if (!key.startsWith("claudia-content-")) return serializedIncoming;

  try {
    const incoming = JSON.parse(serializedIncoming);
    const current = currentValue ? JSON.parse(String(currentValue)) : null;
    if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.blocks)) return serializedIncoming;
    if (!current || typeof current !== "object" || !Array.isArray(current.blocks)) return serializedIncoming;

    const incomingById = new Map();
    for (const block of incoming.blocks) {
      if (block && typeof block.id === "string") incomingById.set(block.id, block);
    }

    const mergedBlocks = current.blocks.map((block) => {
      if (!block || typeof block.id !== "string") return { ...block };
      const incomingBlock = incomingById.get(block.id);
      return incomingBlock ? mergeIncomingBlockTransform(block, incomingBlock) : { ...block };
    });
    const mergedIds = new Set(mergedBlocks.filter((block) => block && typeof block.id === "string").map((block) => block.id));

    for (const block of incoming.blocks) {
      if (!block || typeof block.id !== "string") continue;
      if (mergedIds.has(block.id)) continue;
      mergedBlocks.push({ ...block });
      mergedIds.add(block.id);
    }

    return JSON.stringify({
      ...incoming,
      blocks: mergedBlocks,
      updatedAt: current.updatedAt || incoming.updatedAt,
    });
  } catch {
    return serializedIncoming;
  }
}

function repairDamagedScrittureContent(key, incomingValue, currentValue) {
  const serializedIncoming = String(incomingValue ?? "");
  if (key !== "claudia-content-scritture-v1" || !currentValue) return serializedIncoming;

  try {
    const incoming = JSON.parse(serializedIncoming);
    const current = JSON.parse(String(currentValue ?? ""));
    const incomingFirstText = `${incoming?.blocks?.[0]?.text ?? ""}`;
    const currentFirstText = `${current?.blocks?.[0]?.text ?? ""}`;

    const shouldRepair =
      incomingFirstText.startsWith('<p><span style="font-size: 52px;') &&
      currentFirstText.startsWith('<span style="font-size: 24px;');
    if (!shouldRepair || !Array.isArray(incoming.blocks) || !Array.isArray(current.blocks)) return serializedIncoming;

    const currentById = new Map(current.blocks.filter((block) => block && typeof block.id === "string").map((block) => [block.id, block]));
    incoming.blocks = incoming.blocks.map((block) => {
      if (!block || block.id !== "scritture-body") return block;
      const currentBody = currentById.get("scritture-body");
      return currentBody ? { ...block, text: currentBody.text, style: currentBody.style || block.style } : block;
    });
    return JSON.stringify(incoming);
  } catch {
    return serializedIncoming;
  }
}

function preserveMissingImageBoxes(key, incomingValue, currentValue, preferCurrent = false) {
  const serializedIncoming = String(incomingValue ?? "");
  if (!/^claudia-editor-[a-z0-9-]+-image-boxes-v1$/.test(key)) return serializedIncoming;

  try {
    const incoming = JSON.parse(serializedIncoming);
    const current = currentValue ? JSON.parse(String(currentValue)) : null;
    if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.images)) return serializedIncoming;
    if (!current || typeof current !== "object" || !Array.isArray(current.images)) return serializedIncoming;
    const removedIds = new Set(Array.isArray(incoming.removedIds) ? incoming.removedIds.filter((item) => typeof item === "string" && item) : []);

    const incomingById = new Map();
    for (const image of incoming.images) {
      if (image && typeof image.id === "string") incomingById.set(image.id, image);
    }

    const mergedImages = (preferCurrent ? current.images : incoming.images)
      .filter((image) => !removedIds.has(image?.id))
      .map((image) => ({ ...image }));
    const mergedIds = new Set(mergedImages.filter((image) => image && typeof image.id === "string").map((image) => image.id));

    for (const image of preferCurrent ? incoming.images : current.images) {
      if (!image || typeof image.id !== "string") continue;
      if (removedIds.has(image.id)) continue;
      if (mergedIds.has(image.id)) continue;
      mergedImages.push({ ...image });
      mergedIds.add(image.id);
    }

    return JSON.stringify({
      ...incoming,
      removedIds: Array.from(removedIds).slice(-60),
      images: mergedImages,
      updatedAt: preferCurrent ? current.updatedAt || incoming.updatedAt : incoming.updatedAt,
    });
  } catch {
    return serializedIncoming;
  }
}

function preserveMissingUccelliGalleries(key, incomingValue, currentValue, preferCurrent = false) {
  const serializedIncoming = String(incomingValue ?? "");
  if (!/^claudia-editor-[a-z0-9-]+-galleries-v1$/.test(key)) return serializedIncoming;

  try {
    const incoming = JSON.parse(serializedIncoming);
    const current = currentValue ? JSON.parse(String(currentValue)) : null;
    if (!incoming || typeof incoming !== "object" || !Array.isArray(incoming.galleries)) return serializedIncoming;
    if (!current || typeof current !== "object" || !Array.isArray(current.galleries)) return serializedIncoming;
    const removedIds = new Set(Array.isArray(incoming.removedIds) ? incoming.removedIds.filter((item) => typeof item === "string" && item) : []);

    if (preferCurrent) {
      const currentById = new Map();
      for (const gallery of current.galleries) {
        if (gallery && typeof gallery.id === "string") currentById.set(gallery.id, gallery);
      }

      const mergedGalleries = current.galleries
        .filter((gallery) => !removedIds.has(gallery?.id))
        .map((gallery) => ({ ...gallery }));
      const mergedIds = new Set(mergedGalleries.filter((gallery) => gallery && typeof gallery.id === "string").map((gallery) => gallery.id));
      for (const gallery of incoming.galleries) {
        if (!gallery || typeof gallery.id !== "string") continue;
        if (removedIds.has(gallery.id)) continue;
        if (mergedIds.has(gallery.id)) continue;
        mergedGalleries.push({ ...gallery });
        mergedIds.add(gallery.id);
      }

      return JSON.stringify({
        ...incoming,
        removedIds: Array.from(removedIds).slice(-60),
        galleries: mergedGalleries,
        updatedAt: current.updatedAt || incoming.updatedAt,
      });
    }

    const incomingById = new Map();
    for (const gallery of incoming.galleries) {
      if (gallery && typeof gallery.id === "string") incomingById.set(gallery.id, gallery);
    }

    for (const currentGallery of current.galleries) {
      if (!currentGallery || typeof currentGallery.id !== "string") continue;
      if (removedIds.has(currentGallery.id)) continue;
      const incomingGallery = incomingById.get(currentGallery.id);
      if (!incomingGallery) {
        incoming.galleries.push({ ...currentGallery });
        continue;
      }

      const incomingImages = Array.isArray(incomingGallery.images) ? incomingGallery.images : [];
      const currentImages = Array.isArray(currentGallery.images) ? currentGallery.images : [];
      const imageSet = new Set(incomingImages.filter((image) => typeof image === "string" && image));
      for (const image of currentImages) {
        if (typeof image === "string" && image && !imageSet.has(image)) {
          incomingImages.push(image);
          imageSet.add(image);
        }
      }
      incomingGallery.images = incomingImages;
    }

    return JSON.stringify({
      ...incoming,
      removedIds: Array.from(removedIds).slice(-60),
    });
  } catch {
    return serializedIncoming;
  }
}

function isProtectedEditorStateKey(key) {
  return (
    key.startsWith("claudia-content-") ||
    /^claudia-editor-[a-z0-9-]+-galleries-v1$/.test(key) ||
    /^claudia-editor-[a-z0-9-]+-image-boxes-v1$/.test(key)
  );
}

function safeUploadBaseName(name) {
  const parsed = path.parse(`${name || "image"}`);
  return (parsed.name || "image")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "image";
}

function uploadExtensionFor(file) {
  const nameExtension = path.extname(`${file?.name || ""}`).toLowerCase().replace(/^\./, "");
  const type = `${file?.type || ""}`.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(nameExtension)) {
    return nameExtension === "jpeg" ? "jpg" : nameExtension;
  }
  if (type.includes("jpeg") || type.includes("jpg")) return "jpg";
  if (type.includes("png")) return "png";
  if (type.includes("gif")) return "gif";
  if (type.includes("webp")) return "webp";
  if (type.includes("heic")) return "heic";
  if (type.includes("heif")) return "heif";
  return "";
}

function decodeDataUrl(dataUrl) {
  const match = `${dataUrl || ""}`.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);
  if (!match || match[2] !== ";base64") return null;
  return Buffer.from(match[3], "base64");
}

async function readState() {
  const readFromPath = async (targetPath) => {
    const raw = await readFile(targetPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      ...emptyState(),
      ...parsed,
      data: parsed && typeof parsed.data === "object" && !Array.isArray(parsed.data) ? parsed.data : {},
    };
  };

  try {
    return await readFromPath(statePath);
  } catch (error) {
    const primaryError = error;

    try {
      const backupState = await readFromPath(backupStatePath);
      console.warn(`Stato principale non leggibile, uso backup: ${primaryError.message}`);
      await writeState(backupState);
      return backupState;
    } catch (backupError) {
      if (primaryError && primaryError.code === "ENOENT" && backupError && backupError.code === "ENOENT") {
        return emptyState();
      }
      console.warn(
        `Stato editor e backup non leggibili, riparto da vuoto: ${primaryError.message}; backup: ${backupError.message}`,
      );
      return emptyState();
    }
  }
}

async function writeState(state) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(tempStatePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(tempStatePath, statePath);
}

function backupFilenameForState(state, options = {}) {
  const suffix =
    typeof options.suffix === "string" && options.suffix.trim()
      ? `-${options.suffix.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")}`
      : "";
  const safeTimestamp = `${options.timestamp || state.updatedAt || new Date().toISOString()}`
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z")
    .replace(/[^\dTZ]/g, "");
  return `editor-state-${safeTimestamp}-rev-${Number(state.revision || 0)}${suffix}.json`;
}

function isBackupFilename(filename) {
  return /^editor-state-.+-rev-\d+(?:-[a-z0-9-]+)?\.json$/i.test(filename);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function backupMetaFromFile(filename, fileStat = null) {
  const match = filename.match(/^editor-state-(.+)-rev-(\d+)(?:-([a-z0-9-]+))?\.json$/i);
  const rawTimestamp = match?.[1] || "";
  const isoTimestamp = rawTimestamp
    ? `${rawTimestamp.slice(0, 4)}-${rawTimestamp.slice(4, 6)}-${rawTimestamp.slice(6, 8)}T${rawTimestamp.slice(9, 11)}:${rawTimestamp.slice(11, 13)}:${rawTimestamp.slice(13, 15)}Z`
    : null;
  return {
    id: filename,
    revision: match ? Number(match[2]) : 0,
    updatedAt: isoTimestamp,
    kind: match?.[3] || "auto",
    size: fileStat?.size ?? 0,
  };
}

async function writeLatestBackup(sourceState = null) {
  const snapshot = sourceState ? JSON.parse(JSON.stringify(sourceState)) : null;
  backupWriteQueue = backupWriteQueue
    .catch(() => {})
    .then(async () => {
      try {
        const state = snapshot || (await readState());
        if (!Object.keys(state.data || {}).length && !state.revision) return;

        await mkdir(dataDir, { recursive: true });
        await writeFile(tempBackupStatePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
        await rename(tempBackupStatePath, backupStatePath);
        console.log(`Backup CLAUDIA latest aggiornato: rev ${state.revision} -> ${backupStatePath}`);
      } catch (error) {
        console.warn(`Backup CLAUDIA latest non riuscito: ${error.message}`);
        try {
          await copyFile(statePath, backupStatePath);
          console.log(`Backup CLAUDIA latest copiato in fallback: ${backupStatePath}`);
        } catch (copyError) {
          console.warn(`Backup CLAUDIA latest fallback non riuscito: ${copyError.message}`);
        }
      }
    });

  return backupWriteQueue;
}

async function listBackupsInDir(directory) {
  try {
    const filenames = await readdir(directory);
    const backups = await Promise.all(
      filenames
        .filter(isBackupFilename)
        .map(async (filename) => {
          const filePath = path.join(directory, filename);
          const fileStat = await stat(filePath);
          const meta = backupMetaFromFile(filename, fileStat);
          return { ...meta, path: filePath, mtimeMs: fileStat.mtimeMs };
        }),
    );

    return backups.sort((left, right) => (right.updatedAt || "").localeCompare(left.updatedAt || ""));
  } catch {
    return [];
  }
}

async function listRotatingBackups() {
  return listBackupsInDir(rotatingBackupDir);
}

async function listAllBackups() {
  const [rotatingBackups, manualBackups] = await Promise.all([
    listBackupsInDir(rotatingBackupDir),
    listBackupsInDir(manualBackupDir),
  ]);
  return [...rotatingBackups, ...manualBackups].sort((left, right) =>
    (right.updatedAt || "").localeCompare(left.updatedAt || ""),
  );
}

async function pruneRotatingBackups(now = Date.now()) {
  const backups = await listRotatingBackups();
  await Promise.all(
    backups
      .filter((backup) => {
        const timestamp = backup.updatedAt ? Date.parse(backup.updatedAt) : backup.mtimeMs;
        return Number.isFinite(timestamp) && now - timestamp > historyRetentionMs;
      })
      .map((backup) => unlink(backup.path).catch(() => {})),
  );
}

async function writeRotatingBackupIfChanged(sourceState = null, force = false) {
  const state = sourceState ? JSON.parse(JSON.stringify(sourceState)) : await readState();
  if (!Object.keys(state.data || {}).length && !state.revision) return null;

  await mkdir(rotatingBackupDir, { recursive: true });
  await pruneRotatingBackups();

  const backups = await listRotatingBackups();
  const latestRevision = backups.reduce((max, backup) => Math.max(max, Number(backup.revision || 0)), 0);
  if (!force && Number(state.revision || 0) <= latestRevision) return null;

  const filename = backupFilenameForState(state);
  const targetPath = path.join(rotatingBackupDir, filename);
  const tempPath = `${targetPath}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(tempPath, targetPath);
  console.log(`Backup CLAUDIA 24h: rev ${state.revision} -> ${targetPath}`);
  return filename;
}

async function writeManualBackupSnapshot(sourceState, updatedBy = null) {
  const state = sourceState ? JSON.parse(JSON.stringify(sourceState)) : await readState();
  if (!Object.keys(state.data || {}).length && !state.revision) return null;

  await mkdir(manualBackupDir, { recursive: true });

  const stateHash = sha256(JSON.stringify(state));
  const snapshot = {
    ...state,
    manualSnapshot: true,
    manualSnapshotBy: updatedBy,
    manualSnapshotAt: new Date().toISOString(),
    manualSnapshotSha256: stateHash,
  };
  const serializedSnapshot = `${JSON.stringify(snapshot, null, 2)}\n`;

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const filename = backupFilenameForState(state, {
      timestamp: new Date().toISOString(),
      suffix: `manual-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}${attempt ? `-${attempt}` : ""}`,
    });
    const targetPath = path.join(manualBackupDir, filename);

    try {
      await writeFile(targetPath, serializedSnapshot, { encoding: "utf8", flag: "wx", mode: 0o444 });
      await chmod(targetPath, 0o444).catch(() => {});
      console.log(`Backup CLAUDIA manuale non sovrascrivibile: rev ${state.revision} -> ${targetPath}`);
      return filename;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
  }

  throw new Error("Impossibile creare un nome unico per il salvataggio rapido");
}

async function readHistory() {
  try {
    const parsed = JSON.parse(await readFile(historyPath, "utf8"));
    return {
      version: 1,
      changes: Array.isArray(parsed?.changes) ? parsed.changes : [],
    };
  } catch {
    return { version: 1, changes: [] };
  }
}

async function appendHistoryEvent(event) {
  historyWriteQueue = historyWriteQueue.catch(() => {}).then(async () => {
    const now = Date.now();
    const history = await readHistory();
    const changes = [
      ...history.changes.filter((entry) => {
        const timestamp = Date.parse(entry?.updatedAt || "");
        return Number.isFinite(timestamp) && now - timestamp <= historyRetentionMs;
      }),
      {
        updatedAt: new Date().toISOString(),
        ...event,
      },
    ].slice(-1000);

    await mkdir(dataDir, { recursive: true });
    await writeFile(tempHistoryPath, `${JSON.stringify({ version: 1, changes }, null, 2)}\n`, "utf8");
    await rename(tempHistoryPath, historyPath);
  });

  return historyWriteQueue;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(message);
}

async function readRequestBody(request) {
  const chunks = [];
  let totalSize = 0;

  for await (const chunk of request) {
    totalSize += chunk.length;
    if (totalSize > maxBodySize) {
      const error = new Error(`Payload troppo grande: limite ${Math.round(maxBodySize / 1024 / 1024)} MB`);
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function handleApi(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
    });
    response.end();
    return;
  }

  if (request.method === "GET") {
    sendJson(response, 200, await readState());
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Metodo non supportato" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const payload = body ? JSON.parse(body) : {};
    if (Number(payload.clientVersion || 0) < minClientVersion) {
      sendJson(response, 409, { error: "Editor client vecchio: aggiorna la pagina" });
      return;
    }

    const incomingItems =
      payload && typeof payload.items === "object" && !Array.isArray(payload.items) ? payload.items : {};
    const removeKeys = Array.isArray(payload.remove) ? payload.remove : [];
    const state = await readState();
    const previousData = { ...state.data };
    const baseRevision = Number(payload.baseRevision ?? payload.revision ?? 0);
    const isStaleWrite = Number.isFinite(baseRevision) && baseRevision < Number(state.revision || 0);

    if (payload.replace === true) {
      for (const key of Object.keys(state.data)) {
        if (isEditorKey(key) && !isProtectedEditorStateKey(key)) delete state.data[key];
      }
    }

    for (const [key, value] of Object.entries(incomingItems)) {
      if (isEditorKey(key)) {
        const repairedValue = repairDamagedScrittureContent(key, value, previousData[key]);
        let nextValue = isStaleWrite
          ? mergeStaleContentBlocks(key, repairedValue, previousData[key])
          : preserveMissingDynamicContentBlocks(key, repairedValue, previousData[key]);
        if (isStaleWrite) {
          nextValue = preserveMissingImageBoxes(key, nextValue, previousData[key], true);
          nextValue = preserveMissingUccelliGalleries(key, nextValue, previousData[key], true);
        }
        state.data[key] = nextValue;
      }
    }

    for (const key of removeKeys) {
      if (isEditorKey(key) && !isProtectedEditorStateKey(key)) delete state.data[key];
    }

    state.version = 1;
    state.revision = Number(state.revision || 0) + 1;
    state.updatedAt = new Date().toISOString();
    state.updatedBy = typeof payload.clientId === "string" ? payload.clientId.slice(0, 80) : null;

    await writeState(state);
    await writeLatestBackup(state);
    await appendHistoryEvent({
      type: payload.replace === true ? "replace" : "save",
      revision: state.revision,
      updatedBy: state.updatedBy,
      changedKeys: Object.keys(incomingItems).filter(isEditorKey),
      removedKeys: removeKeys.filter(isEditorKey),
      replace: payload.replace === true,
    });
    sendJson(response, 200, state);
  } catch (error) {
    const statusCode = error && error.code === "PAYLOAD_TOO_LARGE" ? 413 : 400;
    sendJson(response, statusCode, { error: error.message || "Richiesta non valida" });
  }
}

async function writeUploadedImage(file) {
  const extension = uploadExtensionFor(file);
  const buffer = decodeDataUrl(file?.data);
  if (!extension || !buffer?.length) {
    throw new Error("Formato immagine non riconosciuto");
  }

  if (buffer.length > 40 * 1024 * 1024) {
    throw new Error("File troppo grande: massimo 40 MB per immagine");
  }

  await mkdir(uploadDir, { recursive: true });

  const baseName = `${new Date().toISOString().replace(/[-:.]/g, "").replace("T", "-").replace("Z", "")}-${randomUUID().slice(0, 8)}-${safeUploadBaseName(file?.name)}`;
  const originalPath = path.join(uploadDir, `${baseName}.${extension}`);
  await writeFile(originalPath, buffer, { flag: "wx" });

  if (extension === "heic" || extension === "heif") {
    const jpegPath = path.join(uploadDir, `${baseName}.jpg`);
    try {
      await execFileAsync("sips", ["-s", "format", "jpeg", originalPath, "--out", jpegPath], { timeout: 120000 });
      await unlink(originalPath).catch(() => {});
      return {
        name: `${file?.name || baseName}`,
        url: `${uploadPublicPath}/${path.basename(jpegPath)}`,
        type: "image/jpeg",
        size: buffer.length,
        convertedFrom: extension,
      };
    } catch (error) {
      await unlink(originalPath).catch(() => {});
      throw new Error(`HEIC non convertito: ${error?.message || "sips non disponibile"}`);
    }
  }

  return {
    name: `${file?.name || baseName}`,
    url: `${uploadPublicPath}/${path.basename(originalPath)}`,
    type: `image/${extension === "jpg" ? "jpeg" : extension}`,
    size: buffer.length,
  };
}

async function handleUploadApi(request, response) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
    });
    response.end();
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Metodo non supportato" });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const payload = body ? JSON.parse(body) : {};
    const files = Array.isArray(payload.files) ? payload.files.slice(0, 80) : [];
    const uploaded = [];
    const errors = [];

    for (const file of files) {
      try {
        uploaded.push(await writeUploadedImage(file));
      } catch (error) {
        errors.push({
          name: `${file?.name || "file"}`,
          error: error?.message || "Upload non riuscito",
        });
      }
    }

    sendJson(response, uploaded.length ? 200 : 400, { ok: uploaded.length > 0, files: uploaded, errors });
  } catch (error) {
    const statusCode = error && error.code === "PAYLOAD_TOO_LARGE" ? 413 : 400;
    sendJson(response, statusCode, { error: error.message || "Upload non riuscito" });
  }
}

async function readBackupSnapshot(backupId) {
  const safeId = path.basename(`${backupId || ""}`);
  if (!isBackupFilename(safeId)) return null;
  for (const directory of [rotatingBackupDir, manualBackupDir]) {
    const filePath = path.join(directory, safeId);
    const relativePath = path.relative(directory, filePath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) continue;
    try {
      return JSON.parse(await readFile(filePath, "utf8"));
    } catch {}
  }
  return null;
}

async function handleHistoryApi(request, response, action = "list") {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "600",
    });
    response.end();
    return;
  }

  if (action === "restore") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Metodo non supportato" });
      return;
    }

    try {
      const body = await readRequestBody(request);
      const payload = body ? JSON.parse(body) : {};
      if (Number(payload.clientVersion || 0) < minClientVersion) {
        sendJson(response, 409, { error: "Editor client vecchio: aggiorna la pagina" });
        return;
      }

      const snapshot = await readBackupSnapshot(payload.id);
      if (!snapshot) {
        sendJson(response, 404, { error: "Backup non trovato" });
        return;
      }

      const current = await readState();
      const restoredState = {
        ...emptyState(),
        ...snapshot,
        data: snapshot && typeof snapshot.data === "object" && !Array.isArray(snapshot.data) ? snapshot.data : {},
      };
      restoredState.version = 1;
      restoredState.revision = Number(current.revision || 0) + 1;
      restoredState.updatedAt = new Date().toISOString();
      restoredState.updatedBy = typeof payload.clientId === "string" ? payload.clientId.slice(0, 80) : "history-restore";
      restoredState.restoredFrom = {
        backupId: path.basename(`${payload.id || ""}`),
        sourceRevision: Number(snapshot.revision || 0),
        sourceUpdatedAt: snapshot.updatedAt || null,
      };

      await writeState(restoredState);
      await writeLatestBackup(restoredState);
      await appendHistoryEvent({
        type: "restore",
        revision: restoredState.revision,
        updatedBy: restoredState.updatedBy,
        backupId: restoredState.restoredFrom.backupId,
        sourceRevision: restoredState.restoredFrom.sourceRevision,
      });
      sendJson(response, 200, restoredState);
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Ripristino non riuscito" });
    }
    return;
  }

  if (action === "snapshot") {
    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Metodo non supportato" });
      return;
    }

    try {
      const body = await readRequestBody(request);
      const payload = body ? JSON.parse(body) : {};
      if (Number(payload.clientVersion || 0) < minClientVersion) {
        sendJson(response, 409, { error: "Editor client vecchio: aggiorna la pagina" });
        return;
      }

      const state = await readState();
      const updatedBy = typeof payload.clientId === "string" ? payload.clientId.slice(0, 80) : "quick-save";
      const backupId = await writeManualBackupSnapshot(state, updatedBy);
      await appendHistoryEvent({
        type: "snapshot",
        revision: Number(state.revision || 0),
        updatedBy,
        backupId,
      });
      const backups = await listAllBackups();
      const backup = backups.find((item) => item.id === backupId) || null;
      sendJson(response, 200, { ok: true, backup, state });
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Salvataggio rapido non riuscito" });
    }
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { error: "Metodo non supportato" });
    return;
  }

  await pruneRotatingBackups();
  const state = await readState();
  const history = await readHistory();
  const backups = await listAllBackups();

  sendJson(response, 200, {
    version: 1,
    currentRevision: Number(state.revision || 0),
    updatedAt: state.updatedAt,
    updatedBy: state.updatedBy,
    retentionHours: Math.round(historyRetentionMs / 60 / 60 / 1000),
    backupIntervalMinutes: Math.round(rotatingBackupIntervalMs / 60000),
    backups: backups.map(({ id, revision, updatedAt, kind, size }) => ({ id, revision, updatedAt, kind, size })),
    changes: history.changes.slice().reverse(),
  });
}

function safeStaticPath(urlPathname) {
  let decodedPath = "/";

  try {
    decodedPath = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const normalizedPath = path.normalize(decodedPath).replace(/^[/\\]+/, "");
  const filePath = path.join(distDir, normalizedPath);
  const relativePath = path.relative(distDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return filePath;
}

function safeUploadPath(urlPathname) {
  let decodedPath = "/";

  try {
    decodedPath = decodeURIComponent(urlPathname);
  } catch {
    return null;
  }

  const prefix = `${uploadPublicPath}/`;
  if (!decodedPath.startsWith(prefix)) return null;

  const relativeUploadPath = path.normalize(decodedPath.slice(prefix.length)).replace(/^[/\\]+/, "");
  const filePath = path.join(uploadDir, relativeUploadPath);
  const relativePath = path.relative(uploadDir, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return null;
  return filePath;
}

async function staticCandidate(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) return path.join(filePath, "index.html");
    return filePath;
  } catch {
    if (!path.extname(filePath)) return path.join(filePath, "index.html");
    return filePath;
  }
}

async function serveStatic(request, response) {
  try {
    await stat(distDir);
  } catch {
    sendText(response, 503, "Sito non compilato. Esegui prima: npm run build");
    return;
  }

  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const uploadPath = safeUploadPath(requestUrl.pathname);
  if (uploadPath) {
    try {
      const fileStat = await stat(uploadPath);
      if (!fileStat.isFile()) throw new Error("Upload non trovato");
      const extension = path.extname(uploadPath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": mimeTypes[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      });
      createReadStream(uploadPath).pipe(response);
      return;
    } catch {
      sendText(response, 404, "Upload non trovato");
      return;
    }
  }

  const initialPath = safeStaticPath(requestUrl.pathname);

  if (!initialPath) {
    sendText(response, 403, "Percorso non valido");
    return;
  }

  const candidates = [await staticCandidate(initialPath), path.join(distDir, "index.html")];

  for (const candidate of candidates) {
    try {
      const fileStat = await stat(candidate);
      if (!fileStat.isFile()) continue;

      const extension = path.extname(candidate).toLowerCase();
      response.writeHead(200, {
        "Content-Type": mimeTypes[extension] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      createReadStream(candidate).pipe(response);
      return;
    } catch {
      // Try the next fallback candidate.
    }
  }

  sendText(response, 404, "File non trovato");
}

function localNetworkUrls() {
  const urls = [];
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) urls.push(`http://${address.address}:${port}/`);
    }
  }

  return urls;
}

const server = createServer((request, response) => {
  if ((request.url || "").startsWith("/api/editor-upload")) {
    void handleUploadApi(request, response);
    return;
  }

  if ((request.url || "").startsWith("/api/editor-history/snapshot")) {
    void handleHistoryApi(request, response, "snapshot");
    return;
  }

  if ((request.url || "").startsWith("/api/editor-history/restore")) {
    void handleHistoryApi(request, response, "restore");
    return;
  }

  if ((request.url || "").startsWith("/api/editor-history")) {
    void handleHistoryApi(request, response, "list");
    return;
  }

  if ((request.url || "").startsWith("/api/editor-state")) {
    void handleApi(request, response);
    return;
  }

  void serveStatic(request, response);
});

server.listen(port, host, () => {
  console.log("CLAUDIA server editor acceso.");
  console.log(`- Questo Mac: http://localhost:${port}/`);
  for (const url of localNetworkUrls()) console.log(`- Altro PC sulla stessa rete: ${url}`);
  console.log(`- Stato condiviso: ${statePath}`);
  console.log(`- Backup latest a ogni salvataggio: ${backupStatePath}`);
  console.log(
    `- Backup 24h ogni ${Math.round(rotatingBackupIntervalMs / 60000)}min se ci sono cambiamenti: ${rotatingBackupDir}`,
  );
  console.log(`- Salva rapido manuale: ${manualBackupDir}`);
  console.log("Apri /uccelli/ dall'altro PC per editare la pagina Uccelli.");
});

void writeLatestBackup();
void writeRotatingBackupIfChanged(null, true).catch((error) => {
  console.warn(`Backup CLAUDIA 24h iniziale non riuscito: ${error.message}`);
});

const latestBackupTimer = setInterval(() => {
  void writeLatestBackup();
}, latestBackupIntervalMs);

const rotatingBackupTimer = setInterval(() => {
  void writeRotatingBackupIfChanged().catch((error) => {
    console.warn(`Backup CLAUDIA 24h non riuscito: ${error.message}`);
  });
}, rotatingBackupIntervalMs);

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Ricevuto ${signal}, salvo backup prima dello spegnimento...`);
  clearInterval(latestBackupTimer);
  clearInterval(rotatingBackupTimer);
  await writeLatestBackup();
  await writeRotatingBackupIfChanged(null, true).catch((error) => {
    console.warn(`Backup CLAUDIA 24h spegnimento non riuscito: ${error.message}`);
  });
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 1500).unref();
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
