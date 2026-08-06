import path from "node:path";

export const editorScopes = new Set(["base", "tablet", "mobile"]);

export const editorProperties = new Set([
  "align-items", "align-self", "aspect-ratio", "background-color", "border", "border-color",
  "border-radius", "border-style", "border-width", "box-shadow", "color", "display", "filter",
  "flex-direction", "font-family", "font-size", "font-style", "font-weight", "gap", "grid-auto-rows",
  "grid-column", "grid-row", "grid-template-columns", "grid-template-rows", "height", "justify-content",
  "justify-self", "letter-spacing", "line-height", "margin", "max-height", "max-width", "min-height",
  "min-width", "object-fit", "object-position", "opacity", "overflow", "padding", "position", "rotate",
  "scale", "text-align", "text-transform", "translate", "width", "z-index",
]);

export const editorVariables = new Set([
  "--contact-aqua", "--contact-aqua-light", "--contact-ink", "--contact-ink-deep",
  "--contact-paper", "--contact-coral", "--contact-line",
  "--writing-paper", "--writing-ink", "--writing-accent", "--writing-line",
]);

export const editorIcons = new Set([
  "instagram", "mastodon", "substack", "bluesky", "facebook", "threads", "x", "youtube",
  "tiktok", "pinterest", "github",
]);

const pageNames = [
  "contact",
  "bio",
  "uccelli",
  "miscellanea",
  "cv",
  "collage",
  "scritture-home",
  "scritture-libri",
  "scritture-racconti",
  "scritture-articoli",
  "scritture-blog",
];

export function createEditorPages(rootDir, dataDir) {
  const definitions = {};
  for (const name of pageNames) {
    const key = name === "contact" ? "contatti" : name;
    const filename = `${name}-customization.json`;
    definitions[key] = {
      name: key,
      defaultPath: path.join(rootDir, "public", filename),
      runtimePath: path.join(dataDir, "editor-config", filename),
      publicPathname: `/${filename}`,
      backupPrefix: filename.replace(/\.json$/, ""),
    };
  }
  return definitions;
}

export function cleanCssValue(value, maxLength = 180) {
  const cleaned = String(value ?? "").trim().slice(0, maxLength);
  return /[;{}]|<\/style/i.test(cleaned) ? "" : cleaned;
}

function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function selectorIsAllowed(selector) {
  return selector.startsWith("[data-contact-edit=")
    || selector.startsWith("main.contact-public")
    || selector.startsWith("#contact-")
    || selector === ".site-language-switcher";
}

function imageSourceIsAllowed(source) {
  return source.startsWith("/") || source.startsWith("https://");
}

export function cleanEditorConfiguration(input) {
  const output = {
    version: 1,
    updatedAt: new Date().toISOString(),
    global: { fontUrl: "", variables: {} },
    elements: {},
  };

  const fontUrl = String(input?.global?.fontUrl || "").trim().slice(0, 500);
  if (!fontUrl || fontUrl.startsWith("https://fonts.googleapis.com/")) output.global.fontUrl = fontUrl;

  for (const [name, value] of Object.entries(input?.global?.variables || {})) {
    if (!editorVariables.has(name)) continue;
    const cleaned = cleanCssValue(value, 100);
    if (cleaned) output.global.variables[name] = cleaned;
  }

  for (const [rawSelector, rawDefinition] of Object.entries(input?.elements || {})) {
    const selector = String(rawSelector).trim().slice(0, 500);
    if (!selectorIsAllowed(selector) || /[{}]/.test(selector) || !rawDefinition || typeof rawDefinition !== "object") continue;

    const definition = { label: cleanText(rawDefinition.label, 100), styles: {} };
    if (typeof rawDefinition.text === "string") definition.text = cleanText(rawDefinition.text, 5000);
    if (typeof rawDefinition.src === "string") {
      const source = rawDefinition.src.trim().slice(0, 1000);
      if (imageSourceIsAllowed(source)) definition.src = source;
    }
    if (typeof rawDefinition.alt === "string") definition.alt = cleanText(rawDefinition.alt, 500);
    if (editorIcons.has(rawDefinition.icon)) definition.icon = rawDefinition.icon;

    const iconSize = {};
    for (const [scope, value] of Object.entries(rawDefinition.iconSize || {})) {
      if (!editorScopes.has(scope)) continue;
      const cleaned = cleanCssValue(value, 40);
      if (cleaned) iconSize[scope] = cleaned;
    }
    if (Object.keys(iconSize).length) definition.iconSize = iconSize;

    const hover = {};
    for (const [scope, declarations] of Object.entries(rawDefinition.hover || {})) {
      if (!editorScopes.has(scope) || !declarations || typeof declarations !== "object") continue;
      const cleanDeclarations = {};
      for (const [property, value] of Object.entries(declarations)) {
        if (!editorProperties.has(property)) continue;
        const cleaned = cleanCssValue(value);
        if (cleaned) cleanDeclarations[property] = cleaned;
      }
      if (Object.keys(cleanDeclarations).length) hover[scope] = cleanDeclarations;
    }
    if (Object.keys(hover).length) definition.hover = hover;

    for (const [scope, declarations] of Object.entries(rawDefinition.styles || {})) {
      if (!editorScopes.has(scope) || !declarations || typeof declarations !== "object") continue;
      const cleanDeclarations = {};
      for (const [property, value] of Object.entries(declarations)) {
        if (!editorProperties.has(property)) continue;
        const cleaned = cleanCssValue(value);
        if (cleaned) cleanDeclarations[property] = cleaned;
      }
      if (Object.keys(cleanDeclarations).length) definition.styles[scope] = cleanDeclarations;
    }

    if (
      definition.text !== undefined
      || definition.src !== undefined
      || definition.alt !== undefined
      || definition.icon
      || definition.iconSize
      || definition.hover
      || Object.keys(definition.styles).length
    ) {
      output.elements[selector] = definition;
    }
  }

  return output;
}
