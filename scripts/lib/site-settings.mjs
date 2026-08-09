import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const defaultFontFamily = "Optima, Candara, 'Noto Sans', sans-serif";

function cleanCssValue(value, maxLength = 220) {
  const cleaned = String(value ?? "").trim().slice(0, maxLength);
  return /[;{}]|<\/?style/i.test(cleaned) ? "" : cleaned;
}

export function cleanSiteSettings(input = {}) {
  const fontFamily = cleanCssValue(input.fontFamily) || defaultFontFamily;
  const fontUrl = String(input.fontUrl || "").trim().slice(0, 500);
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    fontFamily,
    fontUrl: !fontUrl || fontUrl.startsWith("https://fonts.googleapis.com/") ? fontUrl : "",
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export function createSiteSettingsStorage({ dataDir, defaultPath }) {
  const runtimePath = path.join(dataDir, "site-settings.json");
  const tempPath = `${runtimePath}.tmp`;

  const read = async () => {
    try {
      return cleanSiteSettings(await readJson(runtimePath));
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      return cleanSiteSettings(await readJson(defaultPath));
    }
  };

  const save = async (input) => {
    const settings = cleanSiteSettings(input);
    await mkdir(dataDir, { recursive: true });
    await writeFile(tempPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
    await rename(tempPath, runtimePath);
    return settings;
  };

  const css = async () => {
    const settings = await read();
    const importRule = settings.fontUrl ? `@import url("${settings.fontUrl.replaceAll('"', "%22")}");\n` : "";
    return `${importRule}:root{--site-font-family:${settings.fontFamily}}\nhtml body{font-family:var(--site-font-family)!important}\nbutton,input,select,textarea{font-family:inherit}\n`;
  };

  return { read, save, css };
}
