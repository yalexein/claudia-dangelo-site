(() => {
  "use strict";

  const requestedPage = window.ClaudiaCustomizationPage;
  const knownPages = new Set([
    "contact", "bio", "uccelli", "miscellanea", "cv", "collage",
    "scritture-home", "scritture-libri", "scritture-racconti", "scritture-articoli", "scritture-blog",
  ]);
  const PAGE = knownPages.has(requestedPage) ? requestedPage : "contact";
  const configurationFiles = {
    contact: "contact-customization.json",
    bio: "bio-customization.json",
    uccelli: "uccelli-customization.json",
    miscellanea: "miscellanea-customization.json",
    cv: "cv-customization.json",
    collage: "collage-customization.json",
    "scritture-home": "scritture-home-customization.json",
    "scritture-libri": "scritture-libri-customization.json",
    "scritture-racconti": "scritture-racconti-customization.json",
    "scritture-articoli": "scritture-articoli-customization.json",
    "scritture-blog": "scritture-blog-customization.json",
  };
  const STYLE_ID = `claudia-${PAGE}-customization`;
  const FONT_ID = `claudia-${PAGE}-custom-font`;
  const GLOBAL_FONT_STYLE_ID = `claudia-${PAGE}-global-font`;
  const scopes = {
    base: (rules) => rules,
    tablet: (rules) => `@media (min-width: 761px) and (max-width: 1020px) {${rules}}`,
    mobile: (rules) => `@media (max-width: 760px) {${rules}}`,
  };
  const allowedProperties = new Set([
    "align-items", "align-self", "background-color", "border", "border-color", "border-radius",
    "border-style", "border-width", "box-shadow", "color", "display", "filter", "flex-direction",
    "font-family", "font-size", "font-style", "font-weight", "gap", "grid-auto-rows", "grid-column",
    "grid-row", "grid-template-columns", "grid-template-rows", "height", "aspect-ratio",
    "justify-content", "justify-self", "letter-spacing", "line-height", "margin", "max-height", "max-width", "min-height", "min-width",
    "object-fit", "object-position", "opacity", "overflow", "padding", "position", "rotate", "scale",
    "text-align", "text-transform", "translate", "width", "z-index",
  ]);
  const originalText = new Map();
  const originalIcons = new Map();
  const originalImages = new Map();
  let appliedVariables = [];

  const iconLibrary = (() => {
    try {
      return JSON.parse(document.getElementById("contact-icon-library")?.textContent || "{}");
    } catch {
      return {};
    }
  })();

  const safeSelector = (selector) => {
    if (typeof selector !== "string" || selector.length > 500 || /[{}]/.test(selector)) return false;
    return selector.startsWith("[data-contact-edit=")
      || selector.startsWith("main.contact-public")
      || selector.startsWith("#contact-")
      || selector === ".site-language-switcher";
  };

  const safeValue = (value) => typeof value === "string"
    && value.length <= 180
    && !/[;{}]/.test(value)
    && !/<\/style/i.test(value);

  const cssRule = (selector, declarations) => {
    if (!safeSelector(selector) || !declarations || typeof declarations !== "object") return "";
    const body = Object.entries(declarations)
      .filter(([property, value]) => allowedProperties.has(property) && safeValue(value) && value.trim())
      .map(([property, value]) => `${property}:${value}`)
      .join(";");
    return body ? `${selector}{${body}}` : "";
  };

  const ensureOriginalText = (selector, element) => {
    if (!originalText.has(selector)) originalText.set(selector, element.textContent || "");
  };

  const resetText = () => {
    for (const [selector, value] of originalText) {
      const element = document.querySelector(selector);
      if (element) element.textContent = value;
    }
  };

  const resetImages = () => {
    for (const [selector, original] of originalImages) {
      const image = document.querySelector(selector);
      if (!(image instanceof HTMLImageElement)) continue;
      if (original.src === null) image.removeAttribute("src");
      else image.setAttribute("src", original.src);
      if (original.alt === null) image.removeAttribute("alt");
      else image.setAttribute("alt", original.alt);
    }
  };

  const resetIcons = () => {
    for (const [selector, original] of originalIcons) {
      const svg = document.querySelector(selector)?.querySelector("svg");
      const path = svg?.querySelector("path");
      if (path) path.setAttribute("d", original.path);
    }
  };

  const applyFont = (fontUrl) => {
    document.getElementById(FONT_ID)?.remove();
    if (typeof fontUrl !== "string" || !fontUrl.startsWith("https://fonts.googleapis.com/")) return;
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  };

  const applyGlobalFontFamily = (fontFamily) => {
    document.getElementById(GLOBAL_FONT_STYLE_ID)?.remove();
    if (!safeValue(fontFamily) || !fontFamily.trim()) return;
    const style = document.createElement("style");
    style.id = GLOBAL_FONT_STYLE_ID;
    style.textContent = `body,body *{font-family:${fontFamily}!important}`;
    document.head.appendChild(style);
  };

  const applyVariables = (variables) => {
    for (const name of appliedVariables) document.documentElement.style.removeProperty(name);
    appliedVariables = [];
    if (!variables || typeof variables !== "object") return;
    for (const [name, value] of Object.entries(variables)) {
      if (!/^--(?:contact|birds|writing)-[a-z-]+$/.test(name) || !safeValue(value)) continue;
      document.documentElement.style.setProperty(name, value);
      appliedVariables.push(name);
    }
  };

  const apply = (configuration) => {
    const config = configuration && typeof configuration === "object" ? configuration : {};
    const elements = config.elements && typeof config.elements === "object" ? config.elements : {};
    const scopedRules = { base: "", tablet: "", mobile: "" };

    resetText();
    resetImages();
    resetIcons();
    for (const [selector, definition] of Object.entries(elements)) {
      if (!safeSelector(selector) || !definition || typeof definition !== "object") continue;
      const element = document.querySelector(selector);
      if (element) {
        if (typeof definition.text === "string") {
          ensureOriginalText(selector, element);
          element.textContent = definition.text.slice(0, 5000);
        }
        if (element instanceof HTMLImageElement) {
          if (!originalImages.has(selector)) {
            originalImages.set(selector, {
              src: element.getAttribute("src"),
              alt: element.getAttribute("alt"),
            });
          }
          if (typeof definition.src === "string" && definition.src) element.setAttribute("src", definition.src);
          if (typeof definition.alt === "string") element.setAttribute("alt", definition.alt);
        }
        const iconPath = element.querySelector("svg path");
        if (iconPath) {
          if (!originalIcons.has(selector)) originalIcons.set(selector, { path: iconPath.getAttribute("d") || "" });
          if (typeof definition.icon === "string" && iconLibrary[definition.icon]) {
            iconPath.setAttribute("d", iconLibrary[definition.icon]);
          }
        }
      }
      for (const scope of Object.keys(scopes)) {
        scopedRules[scope] += cssRule(selector, definition.styles?.[scope]);
        const iconSize = definition.iconSize?.[scope] || "";
        if (safeValue(iconSize) && iconSize.trim()) {
          scopedRules[scope] += cssRule(`${selector} svg`, { width: iconSize, height: iconSize });
        }
        const hoverSelector = `${selector}:hover,${selector}:focus-visible`;
        scopedRules[scope] += cssRule(hoverSelector, definition.hover?.[scope]);
      }
    }

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = Object.entries(scopedRules)
      .map(([scope, rules]) => rules ? scopes[scope](rules) : "")
      .join("\n");

    applyVariables(config.global?.variables);
    applyFont(config.global?.fontUrl || "");
    applyGlobalFontFamily(config.global?.fontFamily || "");
    document.dispatchEvent(new CustomEvent("claudia:contact-customized", { detail: config }));
  };

  const loadConfigurationFile = async (filename) => {
    const response = await fetch(`/${filename}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    return response.ok ? response.json() : null;
  };

  const mergeConfigurations = (...configurations) => configurations.filter(Boolean).reduce((merged, configuration) => ({
    version: 1,
    updatedAt: configuration.updatedAt || merged.updatedAt || null,
    global: {
      fontUrl: configuration.global?.fontUrl || merged.global.fontUrl || "",
      fontFamily: configuration.global?.fontFamily || merged.global.fontFamily || "",
      variables: { ...merged.global.variables, ...(configuration.global?.variables || {}) },
    },
    elements: { ...merged.elements, ...(configuration.elements || {}) },
  }), { version: 1, updatedAt: null, global: { fontUrl: "", fontFamily: "", variables: {} }, elements: {} });

  const load = async () => {
    try {
      if (PAGE === "bio") {
        const [sharedConfiguration, bioConfiguration] = await Promise.all([
          loadConfigurationFile("contact-customization.json"),
          loadConfigurationFile("bio-customization.json"),
        ]);
        apply(mergeConfigurations(sharedConfiguration, bioConfiguration));
        return;
      }
      const configuration = await loadConfigurationFile(configurationFiles[PAGE] || configurationFiles.contact);
      if (configuration) apply(configuration);
    } catch {
      // The original stylesheet remains the safe fallback.
    }
  };

  window.ClaudiaContactCustomizer = { apply, load };

  if (!(new URLSearchParams(location.search)).has("editor-preview")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load, { once: true });
    else void load();
  }

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("claudia-contact-editor");
    channel.addEventListener("message", (event) => {
      if (event.data?.type === "preview" && event.data.configuration) apply(event.data.configuration);
      if (event.data?.type === "saved") void load();
    });
  }
})();
