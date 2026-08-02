import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = process.env.HOME_COLLAGE_EXPORT
  ? path.resolve(process.env.HOME_COLLAGE_EXPORT)
  : "/Users/yalexein/Downloads/canvas-immagini-pubblica.html";
const assetsDir = path.join(rootDir, "public", "images", "home-collage");
const dataPath = path.join(rootDir, "src", "data", "home-collage.json");

const html = await readFile(sourcePath, "utf8");
const dataMatch = html.match(/<script type="application\/json" id="canvas-data">([\s\S]*?)<\/script>/i);

if (!dataMatch) {
  throw new Error(`Export collage non riconosciuto: ${sourcePath}`);
}

const items = JSON.parse(dataMatch[1]);
const mimeExtensions = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

await mkdir(assetsDir, { recursive: true });
await mkdir(path.dirname(dataPath), { recursive: true });

let assetIndex = 0;
const exportedAssets = new Map();

const exportDataImage = async (value, label) => {
  const source = String(value || "");
  if (!source.startsWith("data:image/")) return source;
  if (exportedAssets.has(source)) return exportedAssets.get(source);

  const match = source.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error(`Immagine data URL non valida: ${label}`);
  const extension = mimeExtensions.get(match[1]);
  if (!extension) throw new Error(`Formato immagine non supportato: ${match[1]}`);

  assetIndex += 1;
  const filename = `layer-${String(assetIndex).padStart(2, "0")}.${extension}`;
  await writeFile(path.join(assetsDir, filename), Buffer.from(match[2], "base64"));
  const publicPath = `images/home-collage/${filename}`;
  exportedAssets.set(source, publicPath);
  return publicPath;
};

for (const [index, item] of items.entries()) {
  item.src = await exportDataImage(item.src, `layer ${index + 1}`);
  if (Array.isArray(item.sprite?.frames)) {
    for (const [frameIndex, frame] of item.sprite.frames.entries()) {
      frame.src = await exportDataImage(frame.src, `layer ${index + 1}, frame ${frameIndex + 1}`);
    }
  }
}

await writeFile(dataPath, `${JSON.stringify(items, null, 2)}\n`, "utf8");

console.log(`Collage importato: ${items.length} layer, ${assetIndex} asset.`);
console.log(`Dati: ${dataPath}`);
