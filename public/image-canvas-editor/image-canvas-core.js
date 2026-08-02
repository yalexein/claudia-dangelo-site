(function (global) {
  const hoverEffects = Object.freeze(["none", "lift", "zoom", "tilt", "glow", "gray-color", "opacity", "paper"]);
  const clickEffects = Object.freeze(["none", "pulse", "pop", "flash", "spin", "open-link", "lock-toggle", "bring-front"]);
  const blendModes = Object.freeze(["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-burn", "color-dodge", "difference", "luminosity"]);
  const motionPresets = Object.freeze(["none", "float", "drift-x", "drift-y", "orbit", "sway", "scroll-left"]);
  const spriteModes = Object.freeze(["forward", "pingpong"]);
  const gradientTypes = Object.freeze(["linear", "radial"]);
  const layerTriggerActions = Object.freeze(["show", "play"]);
  const layerTriggerModes = Object.freeze(["immediate", "delay", "click", "key", "after-layer"]);

  const defaultCanvasBackground = Object.freeze({
    baseColor: "#fbfaf7",
    editorGrid: true,
    gradient: Object.freeze({
      enabled: false,
      type: "linear",
      angle: 135,
      stops: Object.freeze([
        Object.freeze({ color: "#fbfaf7", position: 0 }),
        Object.freeze({ color: "#f2b6bf", position: 52 }),
        Object.freeze({ color: "#b9c7ef", position: 100 }),
      ]),
    }),
    paper: Object.freeze({
      enabled: false,
      strength: 32,
      scale: 1,
    }),
  });

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const hasValue = (values, value) => values.includes(String(value || ""));
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeEnum = (value, values, fallback) => {
    const normalized = String(value || "");
    return values.includes(normalized) ? normalized : fallback;
  };

  const normalizeColor = (value, fallback = "#fbfaf7") => {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return fallback;
  };

  const normalizeBackgroundStop = (stop, fallback) => ({
    color: normalizeColor(stop?.color, fallback.color),
    position: clamp(number(stop?.position, fallback.position), 0, 100),
  });

  const normalizeCanvasBackground = (value = {}) => {
    const sourceStops = Array.isArray(value?.gradient?.stops) ? value.gradient.stops : [];
    return {
      baseColor: normalizeColor(value?.baseColor, defaultCanvasBackground.baseColor),
      editorGrid: value?.editorGrid !== false,
      gradient: {
        enabled: value?.gradient?.enabled === true,
        type: normalizeEnum(value?.gradient?.type, gradientTypes, defaultCanvasBackground.gradient.type),
        angle: clamp(number(value?.gradient?.angle, defaultCanvasBackground.gradient.angle), 0, 360),
        stops: defaultCanvasBackground.gradient.stops.map((fallback, index) => normalizeBackgroundStop(sourceStops[index], fallback)),
      },
      paper: {
        enabled: value?.paper?.enabled === true,
        strength: clamp(number(value?.paper?.strength, defaultCanvasBackground.paper.strength), 0, 100),
        scale: clamp(number(value?.paper?.scale, defaultCanvasBackground.paper.scale), 0.5, 4),
      },
    };
  };

  const gradientCss = (background) => {
    const gradient = background.gradient;
    const stops = gradient.stops
      .slice()
      .sort((first, second) => first.position - second.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    return gradient.type === "radial"
      ? `radial-gradient(circle at 50% 46%, ${stops})`
      : `linear-gradient(${gradient.angle}deg, ${stops})`;
  };

  const paperCssLayers = (background) => {
    const strength = clamp(number(background?.paper?.strength, 0), 0, 100) / 100;
    const scale = clamp(number(background?.paper?.scale, 1), 0.5, 4);
    const dark = (0.018 + strength * 0.055).toFixed(3);
    const light = (0.035 + strength * 0.105).toFixed(3);
    const fiber = (0.012 + strength * 0.04).toFixed(3);
    return {
      layers: [
        `repeating-radial-gradient(circle at 18px 24px, rgba(23, 23, 23, ${dark}) 0 0.7px, transparent 1.2px ${Math.round(9 * scale)}px)`,
        `repeating-linear-gradient(96deg, rgba(23, 23, 23, ${fiber}) 0 1px, rgba(255, 255, 255, ${light}) 1px 2px, transparent 2px ${Math.round(13 * scale)}px)`,
        `radial-gradient(circle at 18% 22%, rgba(255, 255, 255, ${light}) 0, transparent 28%), radial-gradient(circle at 78% 68%, rgba(23, 23, 23, ${dark}) 0, transparent 32%)`,
      ],
      sizes: [
        `${Math.round(22 * scale)}px ${Math.round(22 * scale)}px`,
        `${Math.round(96 * scale)}px ${Math.round(96 * scale)}px`,
        "auto, auto",
      ],
    };
  };

  const buildCanvasBackgroundCss = (value = {}, options = {}) => {
    const background = normalizeCanvasBackground(value);
    const layers = [];
    const sizes = [];
    if (options.includeGrid && background.editorGrid) {
      layers.push(
        "linear-gradient(rgba(23, 23, 23, 0.055) 1px, transparent 1px)",
        "linear-gradient(90deg, rgba(23, 23, 23, 0.055) 1px, transparent 1px)",
      );
      sizes.push("40px 40px", "40px 40px");
    }
    if (background.paper.enabled) {
      const paper = paperCssLayers(background);
      layers.push(...paper.layers);
      sizes.push(...paper.sizes);
    }
    if (background.gradient.enabled) {
      layers.push(gradientCss(background));
      sizes.push("auto");
    }
    layers.push(background.baseColor);
    sizes.push("auto");
    return {
      background: layers.join(", "),
      size: sizes.join(", "),
    };
  };

  const normalizeLayerTrigger = (value = {}) => {
    const action = normalizeEnum(value?.action, layerTriggerActions, "show");
    let mode = normalizeEnum(value?.mode, layerTriggerModes, "immediate");
    if (action === "show" && mode === "click") mode = "delay";
    return {
      action,
      mode,
      delay: clamp(number(value?.delay, 0), 0, 30),
      key: String(value?.key || "Space").trim() || "Space",
      targetId: String(value?.targetId || "").trim(),
    };
  };

  global.ImageCanvasCore = Object.freeze({
    hoverEffects,
    clickEffects,
    blendModes,
    motionPresets,
    spriteModes,
    gradientTypes,
    layerTriggerActions,
    layerTriggerModes,
    defaultCanvasBackground,
    cloneDefaultCanvasBackground: () => clone(defaultCanvasBackground),
    number,
    clamp,
    hasValue,
    normalizeColor,
    normalizeEnum,
    normalizeBlendMode: (value, fallback = "normal") => normalizeEnum(value, blendModes, fallback),
    normalizeHoverEffect: (value, fallback = "none") => normalizeEnum(value, hoverEffects, fallback),
    normalizeClickEffect: (value, fallback = "none") => {
      const normalized = String(value || "");
      if (normalized === "lightbox") return "open-link";
      return normalizeEnum(normalized, clickEffects, fallback);
    },
    normalizeMotionPreset: (value, fallback = "none") => normalizeEnum(value, motionPresets, fallback),
    normalizeSpriteMode: (value, fallback = "forward") => normalizeEnum(value, spriteModes, fallback),
    normalizeGradientType: (value, fallback = "linear") => normalizeEnum(value, gradientTypes, fallback),
    normalizeOpacity: (value, fallback = 1) => clamp(number(value, fallback), 0, 1),
    normalizeLink: (value) => String(value || "").trim(),
    normalizeCanvasBackground,
    buildCanvasBackgroundCss,
    normalizeLayerTrigger,
  });
})(typeof window !== "undefined" ? window : globalThis);
