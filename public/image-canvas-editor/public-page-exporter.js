(function () {
  const imageCanvasCore = window.ImageCanvasCore || {};
  const visualClickEffects = new Set(["pulse", "pop", "flash", "spin"]);
  const hoverEffects = new Set(["none", "lift", "zoom", "tilt", "glow", "gray-color", "opacity", "paper"]);
  const clickEffects = new Set(["none", "pulse", "pop", "flash", "spin", "open-link", "lock-toggle", "bring-front"]);
  const blendModes = new Set(["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-burn", "color-dodge", "difference", "luminosity"]);
  const motionPresets = new Set(["none", "float", "drift-x", "drift-y", "orbit", "sway", "scroll-left"]);
  const spriteModes = new Set(["forward", "pingpong"]);
  const gradientTypes = new Set(["linear", "radial"]);
  const triggerActions = new Set(["show", "play"]);
  const triggerModes = new Set(["immediate", "delay", "click", "key", "after-layer"]);
  const allowedGameRoles = new Set(["web", "background", "prop", "player", "npc", "obstacle"]);
  const gameInputActionIds = ["move-up", "move-down", "move-left", "move-right", "action", "cancel"];
  const defaultGameInputBindings = {
    "move-up": ["w", "arrowup"],
    "move-down": ["s", "arrowdown"],
    "move-left": ["a", "arrowleft"],
    "move-right": ["d", "arrowright"],
    action: ["e", "enter"],
    cancel: ["escape", "backspace"],
  };
  const spriteDirectionStateIds = new Set(["idle-down", "walk-down", "walk-left", "walk-right", "walk-up"]);
  const defaultCanvasBackground = imageCanvasCore.defaultCanvasBackground || {
    baseColor: "#fbfaf7",
    editorGrid: true,
    gradient: {
      enabled: false,
      type: "linear",
      angle: 135,
      stops: [
        { color: "#fbfaf7", position: 0 },
        { color: "#f2b6bf", position: 52 },
        { color: "#b9c7ef", position: 100 },
      ],
    },
    paper: {
      enabled: false,
      strength: 32,
      scale: 1,
    },
  };

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const normalizeColor = imageCanvasCore.normalizeColor || ((value, fallback = "#fbfaf7") => {
    const raw = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(raw)) {
      return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
    }
    return fallback;
  });

  const normalizeBackgroundStop = (stop, fallback) => ({
    color: normalizeColor(stop?.color, fallback.color),
    position: clamp(number(stop?.position, fallback.position), 0, 100),
  });

  const normalizeCanvasBackground = imageCanvasCore.normalizeCanvasBackground || ((value = {}) => {
    const defaults = defaultCanvasBackground;
    const sourceStops = Array.isArray(value?.gradient?.stops) ? value.gradient.stops : [];
    const stops = defaults.gradient.stops.map((fallback, index) => normalizeBackgroundStop(sourceStops[index], fallback));
    return {
      baseColor: normalizeColor(value?.baseColor, defaults.baseColor),
      editorGrid: value?.editorGrid !== false,
      gradient: {
        enabled: value?.gradient?.enabled === true,
        type: gradientTypes.has(String(value?.gradient?.type || "")) ? String(value.gradient.type) : defaults.gradient.type,
        angle: clamp(number(value?.gradient?.angle, defaults.gradient.angle), 0, 360),
        stops,
      },
      paper: {
        enabled: value?.paper?.enabled === true,
        strength: clamp(number(value?.paper?.strength, defaults.paper.strength), 0, 100),
        scale: clamp(number(value?.paper?.scale, defaults.paper.scale), 0.5, 4),
      },
    };
  });

  const gradientCss = (background) => {
    const gradient = background.gradient;
    const stops = gradient.stops
      .slice()
      .sort((first, second) => first.position - second.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");
    if (gradient.type === "radial") return `radial-gradient(circle at 50% 46%, ${stops})`;
    return `linear-gradient(${gradient.angle}deg, ${stops})`;
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

  const buildCanvasBackgroundCss = imageCanvasCore.buildCanvasBackgroundCss || ((value = {}, options = {}) => {
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
  });

  const normalizeTrim = (item) => {
    const naturalWidth = Math.max(number(item?.trim?.naturalWidth, number(item?.naturalWidth, number(item?.width, 320))), 1);
    const naturalHeight = Math.max(number(item?.trim?.naturalHeight, number(item?.naturalHeight, naturalWidth * 0.75)), 1);
    const x = clamp(number(item?.trim?.x, 0), 0, naturalWidth);
    const y = clamp(number(item?.trim?.y, 0), 0, naturalHeight);
    const width = clamp(number(item?.trim?.width, naturalWidth - x), 1, naturalWidth - x);
    const height = clamp(number(item?.trim?.height, naturalHeight - y), 1, naturalHeight - y);
    return { naturalWidth, naturalHeight, x, y, width, height };
  };

  const normalizeMotion = (value) => ({
    preset: motionPresets.has(value?.preset) ? value.preset : "none",
    speed: clamp(number(value?.speed, 1), 0.05, 5),
    distance: clamp(number(value?.distance, 40), 0, 400),
  });

  const normalizeParallax = (value) => ({
    enabled: value?.enabled === true,
    depth: clamp(number(value?.depth, 1), 0, 2.5),
  });

  const normalizePath = (value) => ({
    enabled: value?.enabled === true,
    duration: clamp(number(value?.duration, 6), 1, 30),
    points: Array.isArray(value?.points)
      ? value.points.map((point) => ({ x: number(point?.x, 0), y: number(point?.y, 0) })).slice(0, 12)
      : [],
  });

  const normalizePublicDrag = (value) => ({
    enabled: value?.enabled === true,
    inertia: clamp(number(value?.inertia, 0.88), 0, 0.98),
  });

  const normalizeTrigger = imageCanvasCore.normalizeLayerTrigger || ((value) => ({
    action: triggerActions.has(String(value?.action || "")) ? String(value.action) : "show",
    mode: triggerModes.has(String(value?.mode || "")) ? String(value.mode) : "immediate",
    delay: clamp(number(value?.delay, 0), 0, 30),
    key: String(value?.key || "Space").trim() || "Space",
    targetId: String(value?.targetId || "").trim(),
  }));

  const normalizeSpriteFrame = (frame, index = 0) => ({
    src: String(typeof frame === "string" ? frame : frame?.src || ""),
    name: String(frame?.name || `frame-${index + 1}`).trim() || `frame-${index + 1}`,
  });

  const normalizeSpriteStates = (value) => {
    const states = {};
    const rawStates = value && typeof value === "object" ? value : {};
    spriteDirectionStateIds.forEach((stateId) => {
      const frames = Array.isArray(rawStates[stateId])
        ? rawStates[stateId].map(normalizeSpriteFrame).filter((frame) => frame.src)
        : [];
      if (frames.length) states[stateId] = frames;
    });
    return states;
  };

  const normalizeSprite = (value, fallbackSrc = "") => {
    const frames = Array.isArray(value?.frames)
      ? value.frames.map(normalizeSpriteFrame).filter((frame) => frame.src)
      : [];
    if (!frames.length && fallbackSrc) frames.push({ src: String(fallbackSrc), name: "frame-1" });
    const states = normalizeSpriteStates(value?.states);
    const selectedState = spriteDirectionStateIds.has(String(value?.directional?.state || ""))
      ? String(value.directional.state)
      : "idle-down";
    return {
      enabled: value?.enabled === true && frames.length > 0,
      name: String(value?.name || "idle").trim() || "idle",
      frames,
      states,
      fps: clamp(number(value?.fps, 8), 1, 30),
      loop: value?.loop !== false,
      mode: spriteModes.has(String(value?.mode || "")) ? String(value.mode) : "forward",
      playing: value?.playing !== false,
      frameIndex: clamp(Math.round(number(value?.frameIndex, 0)), 0, Math.max(frames.length - 1, 0)),
      anchor: String(value?.anchor || "bottom-center"),
      syncMotion: value?.syncMotion === true,
      directional: {
        enabled: value?.directional?.enabled === true,
        state: selectedState,
      },
      onion: {
        enabled: value?.onion?.enabled === true,
        opacity: clamp(number(value?.onion?.opacity, 0.35), 0.05, 0.8),
      },
    };
  };

  const normalizeGameAsset = (value) => {
    const role = allowedGameRoles.has(String(value?.role || "")) ? String(value.role) : "web";
    const isPlayer = value?.player === true || role === "player";
    return {
      role: isPlayer ? "player" : role,
      player: isPlayer,
      speed: clamp(number(value?.speed, 180), 40, 640),
      depthSort: value?.depthSort === true,
      autoFlip: value?.autoFlip === true,
    };
  };

  const normalizeKeyboardKey = (value) => {
    const key = String(value || "").trim();
    if (!key) return "";
    if (key === " ") return "space";
    const normalized = key.toLowerCase();
    if (normalized === "esc") return "escape";
    if (normalized === "return") return "enter";
    if (normalized === "spacebar") return "space";
    if (normalized === "left") return "arrowleft";
    if (normalized === "right") return "arrowright";
    if (normalized === "up") return "arrowup";
    if (normalized === "down") return "arrowdown";
    return normalized;
  };

  const normalizeGameInputBindings = (value) => {
    const source = value && typeof value === "object" ? value : {};
    return gameInputActionIds.reduce((bindings, actionId) => {
      const rawValue = Array.isArray(source[actionId]) ? source[actionId] : defaultGameInputBindings[actionId];
      const keys = rawValue
        .map(normalizeKeyboardKey)
        .filter((key, index, list) => key && list.indexOf(key) === index)
        .slice(0, 2);
      const defaults = defaultGameInputBindings[actionId];
      bindings[actionId] = [keys[0] || defaults[0], keys[1] || defaults[1] || ""].filter(Boolean).slice(0, 2);
      return bindings;
    }, {});
  };

  const normalizeGameInputSettings = (value) => ({
    bindings: normalizeGameInputBindings(value?.bindings),
    mirrorHorizontal: value?.mirrorHorizontal !== false,
  });

  const normalizeGamePoint = (point) => ({
    x: Math.round(number(point?.x)),
    y: Math.round(number(point?.y)),
  });

  const normalizeGameWalkArea = (value) => {
    const points = Array.isArray(value?.points)
      ? value.points.map(normalizeGamePoint).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)).slice(0, 64)
      : [];
    return {
      enabled: value?.enabled === true,
      closed: points.length >= 3 && value?.closed !== false,
      points,
    };
  };

  const normalizeGameSpawn = (value) => {
    const source = value?.point && typeof value.point === "object" ? value.point : value;
    const hasPoint = value?.enabled === true && Number.isFinite(Number(source?.x)) && Number.isFinite(Number(source?.y));
    const point = hasPoint ? normalizeGamePoint(source) : { x: 0, y: 0 };
    return {
      enabled: hasPoint,
      x: point.x,
      y: point.y,
    };
  };

  const normalizeGameRoom = (value) => ({
    walkArea: normalizeGameWalkArea(value?.walkArea),
    spawn: normalizeGameSpawn(value?.spawn),
    input: normalizeGameInputSettings(value?.input),
  });

  const normalizeItem = (item, index) => ({
    id: String(item?.id || `public-image-${index}`),
    src: String(item?.src || ""),
    x: number(item?.x, 120),
    y: number(item?.y, 140),
    width: clamp(number(item?.width, number(item?.w, 320)), 1, 4000),
    rotation: number(item?.rotation, number(item?.rotate, 0)),
    z: clamp(number(item?.z, 20), 0, 10000),
    opacity: imageCanvasCore.normalizeOpacity ? imageCanvasCore.normalizeOpacity(item?.opacity, 1) : clamp(number(item?.opacity, 1), 0, 1),
    blendMode: imageCanvasCore.normalizeBlendMode ? imageCanvasCore.normalizeBlendMode(item?.blendMode, "normal") : (blendModes.has(item?.blendMode) ? item.blendMode : "normal"),
    hoverEffect: imageCanvasCore.normalizeHoverEffect ? imageCanvasCore.normalizeHoverEffect(item?.hoverEffect, "none") : (hoverEffects.has(item?.hoverEffect) ? item.hoverEffect : "none"),
    clickEffect: imageCanvasCore.normalizeClickEffect ? imageCanvasCore.normalizeClickEffect(item?.clickEffect, "none") : (clickEffects.has(item?.clickEffect) ? item.clickEffect : "none"),
    linkUrl: imageCanvasCore.normalizeLink ? imageCanvasCore.normalizeLink(item?.linkUrl) : String(item?.linkUrl || "").trim(),
    trim: normalizeTrim(item),
    hidden: item?.hidden === true,
    locked: item?.locked === true,
    motion: normalizeMotion(item?.motion),
    parallax: normalizeParallax(item?.parallax),
    publicDrag: normalizePublicDrag(item?.publicDrag),
    trigger: normalizeTrigger(item?.trigger),
    game: normalizeGameAsset(item?.game),
    sprite: normalizeSprite(item?.sprite, item?.src),
    pathMotion: normalizePath(item?.pathMotion),
  });

  const htmlEscape = (value) =>
    String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[char]);

  const scriptJson = (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

  const estimateHeight = (items, gameRoom = null) => {
    const itemHeight = items.reduce((max, item) => {
      const scale = item.width / Math.max(item.trim.naturalWidth, 1);
      return Math.max(max, item.y + item.trim.naturalHeight * scale + 220);
    }, 0);
    const walkHeight = Array.isArray(gameRoom?.walkArea?.points)
      ? gameRoom.walkArea.points.reduce((max, point) => Math.max(max, number(point?.y, 0) + 180), 0)
      : 0;
    const spawnHeight = gameRoom?.spawn?.enabled ? number(gameRoom.spawn.y, 0) + 180 : 0;
    return Math.max(900, Math.ceil(itemHeight), Math.ceil(walkHeight), Math.ceil(spawnHeight));
  };

  const runtimeScript = function () {
    const visualClickEffects = new Set(["pulse", "pop", "flash", "spin"]);
    const motionPresets = new Set(["none", "float", "drift-x", "drift-y", "orbit", "sway", "scroll-left"]);
    const number = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const canvas = document.querySelector("[data-public-canvas]");
    const rawData = document.getElementById("canvas-data");
    const items = rawData ? JSON.parse(rawData.textContent || "[]") : [];
    const rawGameData = document.getElementById("game-data");
    const gameInputActionIds = ["move-up", "move-down", "move-left", "move-right", "action", "cancel"];
    const gameInputMovementActions = new Set(["move-up", "move-down", "move-left", "move-right"]);
    const defaultGameInputBindings = {
      "move-up": ["w", "arrowup"],
      "move-down": ["s", "arrowdown"],
      "move-left": ["a", "arrowleft"],
      "move-right": ["d", "arrowright"],
      action: ["e", "enter"],
      cancel: ["escape", "backspace"],
    };
    const spriteDirectionStateIds = new Set(["idle-down", "walk-down", "walk-left", "walk-right", "walk-up"]);
    const normalizeKeyboardKey = (value) => {
      const key = String(value || "").trim();
      if (!key) return "";
      if (key === " ") return "space";
      const normalized = key.toLowerCase();
      if (normalized === "esc") return "escape";
      if (normalized === "return") return "enter";
      if (normalized === "spacebar") return "space";
      if (normalized === "left") return "arrowleft";
      if (normalized === "right") return "arrowright";
      if (normalized === "up") return "arrowup";
      if (normalized === "down") return "arrowdown";
      return normalized;
    };
    const normalizeGameInputBindings = (value) => {
      const source = value && typeof value === "object" ? value : {};
      return gameInputActionIds.reduce((bindings, actionId) => {
        const rawValue = Array.isArray(source[actionId]) ? source[actionId] : defaultGameInputBindings[actionId];
        const keys = rawValue
          .map(normalizeKeyboardKey)
          .filter((key, index, list) => key && list.indexOf(key) === index)
          .slice(0, 2);
        const defaults = defaultGameInputBindings[actionId];
        bindings[actionId] = [keys[0] || defaults[0], keys[1] || defaults[1] || ""].filter(Boolean).slice(0, 2);
        return bindings;
      }, {});
    };
    const normalizeGamePoint = (point) => ({
      x: Math.round(number(point?.x)),
      y: Math.round(number(point?.y)),
    });
    const normalizeGameRoom = (value) => {
      const rawWalkPoints = Array.isArray(value?.walkArea?.points) ? value.walkArea.points : [];
      const walkPoints = rawWalkPoints
        .map(normalizeGamePoint)
        .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
        .slice(0, 64);
      const spawnSource = value?.spawn?.point && typeof value.spawn.point === "object" ? value.spawn.point : value?.spawn;
      const spawnEnabled = value?.spawn?.enabled === true &&
        Number.isFinite(Number(spawnSource?.x)) &&
        Number.isFinite(Number(spawnSource?.y));
      const spawnPoint = spawnEnabled ? normalizeGamePoint(spawnSource) : { x: 0, y: 0 };
      return {
        walkArea: {
          enabled: value?.walkArea?.enabled === true,
          closed: walkPoints.length >= 3 && value?.walkArea?.closed !== false,
          points: walkPoints,
        },
        spawn: {
          enabled: spawnEnabled,
          x: spawnPoint.x,
          y: spawnPoint.y,
        },
        input: {
          bindings: normalizeGameInputBindings(value?.input?.bindings),
          mirrorHorizontal: value?.input?.mirrorHorizontal !== false,
        },
      };
    };
    const gameRoom = normalizeGameRoom(rawGameData ? JSON.parse(rawGameData.textContent || "{}") : {});
    const boxes = new Map();
    const masks = new Map();
    const dragOffsets = new Map();
    const inertiaItems = new Map();
    const gameStates = new Map();
    const gamePressedActions = new Set();
    const clickSuppressions = new Map();
    const spriteRuntimeStarts = new Map();
    const spriteMotionRuntime = new Map();
    const triggerRuntime = new Map();
    const triggerTimers = new Map();
    let hoverId = "";
    let raf = 0;
    let inertiaRaf = 0;
    const gamePathMaxNodes = 5200;
    const camera = { x: 0, y: 0 };

    const resolveLink = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      if (raw.startsWith("#")) return window.location.pathname + raw;
      if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
      const path = raw.startsWith("/") ? raw : "/" + raw.replace(/^\/+/, "");
      return new URL(path, window.location.origin).href;
    };

    const motionActive = (motion) => motion && motion.preset !== "none" && motion.speed > 0 && motion.distance > 0;
    const parallaxActive = (parallax) => parallax && parallax.enabled && parallax.depth > 0;
    const pathActive = (item) => item.pathMotion && item.pathMotion.enabled && item.pathMotion.points.length > 1;
    const publicDragActive = (item) =>
      item.publicDrag &&
      item.publicDrag.enabled &&
      item.locked !== true &&
      item.hidden !== true &&
      item?.game?.player !== true &&
      item?.game?.role !== "player";
    const dragOffset = (id) => dragOffsets.get(String(id || "")) || { x: 0, y: 0 };
    const spriteActive = (item) => item.sprite && item.sprite.enabled && item.sprite.frames && item.sprite.frames.length;
    const getSpriteFramesForState = (sprite, stateId = "base") => {
      if (stateId === "base") return sprite.frames || [];
      return Array.isArray(sprite.states?.[stateId]) ? sprite.states[stateId] : [];
    };
    const getSpriteRuntimeKey = (item, stateId = "base") => String(item?.id || "sprite") + ":" + stateId;
    const getGameAsset = (item) => item?.game || { role: "web", player: false, speed: 180, depthSort: false, autoFlip: false };
    const gameAssetIsPlayer = (item) => getGameAsset(item).player === true || getGameAsset(item).role === "player";
    const triggerInitiallyActive = (item) => item.trigger?.mode === "immediate";
    const triggered = (item) => triggerRuntime.get(item.id)?.active === true;
    const layerVisible = (item) => item.trigger?.action !== "show" || triggered(item);
    const animationAllowed = (item) => item.trigger?.action !== "play" || triggered(item);
    const spriteStateFrameCount = (sprite) =>
      Object.values(sprite.states || {}).reduce((count, frames) => count + (Array.isArray(frames) ? frames.length : 0), 0);
    const spriteAnimating = (item) => {
      if (!spriteActive(item) || !animationAllowed(item)) return false;
      const playback = getSpritePlayback(item, window.performance.now());
      const directionalRuntime = playback.directionalRuntime && (playback.moving || item.sprite.playing);
      return (directionalRuntime || item.sprite.syncMotion || item.sprite.playing) && playback.frames.length > 1 && item.sprite.fps > 0;
    };
    const setTriggered = (id, active = true) => {
      if (!id) return;
      triggerRuntime.set(id, { active, startedAt: window.performance.now() });
      const item = items.find((entry) => entry.id === id);
      const box = boxes.get(id);
      if (item && box) box.classList.toggle("is-trigger-hidden", !layerVisible(item));
      resetSpriteRuntime(id);
      items.forEach((entry) => {
        if (entry.trigger?.mode === "after-layer" && entry.trigger.targetId === id) setTriggered(entry.id, true);
      });
      syncMotion();
    };
    const resetTriggers = () => {
      triggerTimers.forEach((timer) => window.clearTimeout(timer));
      triggerTimers.clear();
      triggerRuntime.clear();
      items.forEach((item) => {
        triggerRuntime.set(item.id, { active: triggerInitiallyActive(item), startedAt: window.performance.now() });
        if (item.trigger?.mode === "delay") {
          triggerTimers.set(item.id, window.setTimeout(() => setTriggered(item.id, true), item.trigger.delay * 1000));
        }
      });
      items.forEach((item) => {
        if (item.trigger?.mode === "after-layer") {
          const target = items.find((entry) => entry.id === item.trigger.targetId);
          if (target && triggered(target)) setTriggered(item.id, true);
        }
      });
    };

    const resetSpriteRuntime = (id = "") => {
      if (id) {
        const prefix = String(id) + ":";
        spriteRuntimeStarts.forEach((_, key) => {
          if (key === String(id) || String(key).startsWith(prefix)) spriteRuntimeStarts.delete(key);
        });
        spriteMotionRuntime.forEach((_, key) => {
          if (key === String(id) || String(key).startsWith(prefix)) spriteMotionRuntime.delete(key);
        });
        return;
      }
      spriteRuntimeStarts.clear();
      spriteMotionRuntime.clear();
    };

    const getGameDirectionFromVector = (x = 0, y = 0, fallback = "down") => {
      const absX = Math.abs(number(x));
      const absY = Math.abs(number(y));
      if (absX <= 0.01 && absY <= 0.01) return fallback;
      if (absX > absY) return number(x) < 0 ? "left" : "right";
      return number(y) < 0 ? "up" : "down";
    };

    const getSpriteDirectionalRuntimeStateId = (item, runtimeState = null) => {
      const sprite = item?.sprite || {};
      if (sprite.directional?.enabled !== true) return "base";
      const direction = String(runtimeState?.direction || "down");
      if (runtimeState?.moving === true) {
        const walkState = "walk-" + direction;
        if (getSpriteFramesForState(sprite, walkState).length) return walkState;
        if (getSpriteFramesForState(sprite, "walk-down").length) return "walk-down";
        return "base";
      }
      return getSpriteFramesForState(sprite, "idle-down").length ? "idle-down" : "base";
    };

    const getSpritePlayback = (item, time) => {
      const sprite = item?.sprite || {};
      let stateId = sprite.directional?.enabled === true && spriteDirectionStateIds.has(sprite.directional.state)
        ? sprite.directional.state
        : "base";
      let directionalRuntime = false;
      let moving = false;
      if (sprite.directional?.enabled === true && gameAssetIsPlayer(item)) {
        const runtimeState = getGameState(item);
        stateId = getSpriteDirectionalRuntimeStateId(item, runtimeState);
        directionalRuntime = true;
        moving = runtimeState?.moving === true;
      }
      const stateFrames = getSpriteFramesForState(sprite, stateId);
      return {
        sprite,
        stateId,
        frames: stateFrames.length ? stateFrames : (sprite.frames || []),
        directionalRuntime,
        moving,
        time,
      };
    };

    const spriteFrameIndex = (item, time) => {
      if (!spriteActive(item)) return 0;
      const playback = getSpritePlayback(item, time);
      const sprite = playback.sprite;
      const frames = playback.frames;
      const count = frames.length;
      const runtimeKey = getSpriteRuntimeKey(item, playback.stateId);
      if ((sprite.syncMotion || (playback.directionalRuntime && playback.moving)) && count > 1) {
        const index = items.findIndex((entry) => entry.id === item.id);
        const state = getRenderState(item, Math.max(index, 0), time);
        const x = number(item.x) + state.x;
        const y = number(item.y) + state.y;
        const distancePerFrame = Math.max(number(item.width, 180) / 7, 12);
        const runtime = spriteMotionRuntime.get(runtimeKey) || { x, y, distance: number(sprite.frameIndex, 0) * distancePerFrame };
        const delta = Math.hypot(x - runtime.x, y - runtime.y);
        if (delta > 0.05) runtime.distance += delta;
        runtime.x = x;
        runtime.y = y;
        spriteMotionRuntime.set(runtimeKey, runtime);
        const step = Math.floor(runtime.distance / distancePerFrame);
        if (!sprite.loop) return clamp(step, 0, count - 1);
        if (sprite.mode === "pingpong" && count > 1) {
          const cycle = count * 2 - 2;
          const frame = step % cycle;
          return frame < count ? frame : cycle - frame;
        }
        return step % count;
      }
      if (!sprite.playing || count <= 1) return clamp(number(sprite.frameIndex, 0), 0, count - 1);
      if (!spriteRuntimeStarts.has(runtimeKey)) spriteRuntimeStarts.set(runtimeKey, time - (number(sprite.frameIndex, 0) / sprite.fps) * 1000);
      const elapsed = Math.max(0, (time - spriteRuntimeStarts.get(runtimeKey)) / 1000);
      const step = Math.floor(elapsed * sprite.fps);
      if (!sprite.loop) return clamp(step, 0, count - 1);
      if (sprite.mode === "pingpong" && count > 1) {
        const cycle = count * 2 - 2;
        const frame = step % cycle;
        return frame < count ? frame : cycle - frame;
      }
      return step % count;
    };

    const currentSpriteFrame = (item, time) => {
      if (!spriteActive(item)) return { src: item.src || "", name: "frame-1" };
      const playback = getSpritePlayback(item, time);
      return playback.frames[spriteFrameIndex(item, time)] || playback.frames[0] || { src: item.src || "", name: "frame-1" };
    };

    const applySpriteFrame = (item, time) => {
      if (!spriteActive(item)) return;
      const box = boxes.get(item.id);
      const image = box ? box.querySelector("img") : null;
      if (!(image instanceof HTMLImageElement)) return;
      const frame = currentSpriteFrame(item, time);
      if (frame.src && image.src !== frame.src) {
        image.addEventListener("load", () => buildMask(item, image), { once: true });
        image.src = frame.src;
      }
    };

    const getMotionState = (item, index, time) => {
      if (!animationAllowed(item)) return { x: 0, y: 0, rotation: 0 };
      const motion = item.motion || { preset: "none", speed: 1, distance: 40 };
      if (!motionPresets.has(motion.preset) || !motionActive(motion)) return { x: 0, y: 0, rotation: 0 };
      const phase = ((time / 1000) * motion.speed + index * 0.137) * Math.PI * 2;
      const distance = motion.distance;
      if (motion.preset === "float") return { x: 0, y: Math.sin(phase) * distance, rotation: 0 };
      if (motion.preset === "drift-x") return { x: Math.sin(phase) * distance, y: 0, rotation: 0 };
      if (motion.preset === "drift-y") return { x: 0, y: Math.sin(phase) * distance, rotation: 0 };
      if (motion.preset === "orbit") return { x: Math.cos(phase) * distance, y: Math.sin(phase) * distance * 0.55, rotation: 0 };
      if (motion.preset === "sway") return { x: 0, y: 0, rotation: Math.sin(phase) * Math.min(24, distance / 4) };
      if (motion.preset === "scroll-left") {
        const span = Math.max(distance * 2, 1);
        const progress = ((time / 1000) * motion.speed * 80 + index * 47) % span;
        return { x: distance - progress, y: 0, rotation: 0 };
      }
      return { x: 0, y: 0, rotation: 0 };
    };

    const getPathState = (item, time) => {
      if (!animationAllowed(item)) return { x: 0, y: 0 };
      if (!pathActive(item)) return { x: 0, y: 0 };
      const points = item.pathMotion.points;
      const legCount = points.length - 1;
      const cycleLegs = legCount * 2;
      const progress = ((time / 1000) % item.pathMotion.duration) / item.pathMotion.duration;
      const mirroredProgress = progress * cycleLegs;
      const pathProgress = mirroredProgress <= legCount ? mirroredProgress : cycleLegs - mirroredProgress;
      const legIndex = clamp(Math.floor(pathProgress), 0, legCount - 1);
      const localProgress = pathProgress - legIndex;
      const easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
      const startPoint = points[legIndex];
      const endPoint = points[legIndex + 1];
      return {
        x: startPoint.x + (endPoint.x - startPoint.x) * easedProgress - number(item.x),
        y: startPoint.y + (endPoint.y - startPoint.y) * easedProgress - number(item.y),
      };
    };

    const getImageFullHeight = (item) => {
      const trim = item.trim || { naturalWidth: 1, naturalHeight: 1 };
      return trim.naturalHeight * (number(item?.width, 320) / Math.max(trim.naturalWidth, 1));
    };

    const gameWalkAreaIsActive = () => {
      const walkArea = gameRoom.walkArea;
      return walkArea.enabled && walkArea.closed && walkArea.points.length >= 3;
    };

    const pointInPolygon = (point, polygon) => {
      let inside = false;
      for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
        const current = polygon[index];
        const previous = polygon[previousIndex];
        const denominator = Math.abs(previous.y - current.y) > 0.0001 ? previous.y - current.y : 0.0001;
        const intersects = ((current.y > point.y) !== (previous.y > point.y)) &&
          point.x < ((previous.x - current.x) * (point.y - current.y)) / denominator + current.x;
        if (intersects) inside = !inside;
      }
      return inside;
    };

    const closestPointOnSegment = (point, start, end) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy;
      if (lengthSquared <= 0.0001) return { x: start.x, y: start.y };
      const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
      return { x: start.x + dx * t, y: start.y + dy * t };
    };

    const pointOnPolygonBoundary = (point, polygon, tolerance = 2) => {
      if (!Array.isArray(polygon) || polygon.length < 2) return false;
      return polygon.some((start, index) => {
        const end = polygon[(index + 1) % polygon.length];
        const closest = closestPointOnSegment(point, start, end);
        return Math.hypot(closest.x - point.x, closest.y - point.y) <= tolerance;
      });
    };

    const clampPointToGameWalkArea = (point) => {
      const walkArea = gameRoom.walkArea;
      const polygon = walkArea.points;
      if (!walkArea.enabled || !walkArea.closed || polygon.length < 3 || pointInPolygon(point, polygon)) return point;
      let closestPoint = polygon[0];
      let closestDistance = Infinity;
      polygon.forEach((start, index) => {
        const end = polygon[(index + 1) % polygon.length];
        const candidate = closestPointOnSegment(point, start, end);
        const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestPoint = candidate;
        }
      });
      return closestPoint;
    };

    const getGamePlayerFootPoint = (item, x = number(item?.x), y = number(item?.y)) => ({
      x: number(x) + number(item?.width, 320) / 2,
      y: number(y) + getImageFullHeight(item),
    });

    const gamePositionFromFoot = (item, foot) => ({
      x: foot.x - number(item?.width, 320) / 2,
      y: foot.y - getImageFullHeight(item),
    });

    const gameFootIsInWalkArea = (foot) => {
      if (!gameWalkAreaIsActive()) return true;
      const polygon = gameRoom.walkArea.points;
      return pointInPolygon(foot, polygon) || pointOnPolygonBoundary(foot, polygon, 3);
    };

    const constrainGamePositionToWalkArea = (item, x, y) => {
      if (!gameWalkAreaIsActive()) return { x, y };
      const foot = getGamePlayerFootPoint(item, x, y);
      const nextFoot = clampPointToGameWalkArea(foot);
      return gamePositionFromFoot(item, nextFoot);
    };

    const rectsIntersect = (first, second) =>
      first.left < second.right &&
      first.right > second.left &&
      first.top < second.bottom &&
      first.bottom > second.top;

    const getImageTrimVisualBounds = (item, index = 0, time = window.performance.now()) => {
      const trim = item.trim || { naturalWidth: 1, naturalHeight: 1, x: 0, y: 0, width: 1, height: 1 };
      const imageWidth = number(item.width, 320);
      const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
      const trimLeft = trim.x * imageScale;
      const trimTop = trim.y * imageScale;
      const trimWidth = trim.width * imageScale;
      const trimHeight = trim.height * imageScale;
      const renderState = getRenderState(item, index, time);
      const rotation = number(item.rotation) + number(renderState.rotation);
      const centerX = number(item.x) + number(renderState.x) + trimLeft + trimWidth / 2;
      const centerY = number(item.y) + number(renderState.y) + trimTop + trimHeight / 2;
      const radians = rotation * Math.PI / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const corners = [
        { x: -trimWidth / 2, y: -trimHeight / 2 },
        { x: trimWidth / 2, y: -trimHeight / 2 },
        { x: trimWidth / 2, y: trimHeight / 2 },
        { x: -trimWidth / 2, y: trimHeight / 2 },
      ].map((corner) => ({
        x: centerX + corner.x * cos - corner.y * sin,
        y: centerY + corner.x * sin + corner.y * cos,
      }));
      return {
        left: Math.min(...corners.map((corner) => corner.x)),
        top: Math.min(...corners.map((corner) => corner.y)),
        right: Math.max(...corners.map((corner) => corner.x)),
        bottom: Math.max(...corners.map((corner) => corner.y)),
      };
    };

    const getGameObstacleItems = () => items
      .map((entry, index) => ({ item: entry, index, game: getGameAsset(entry) }))
      .filter(({ item, game }) =>
        game.role === "obstacle" &&
        !item.hidden &&
        number(item.opacity, 1) > 0.01 &&
        layerVisible(item)
      );

    const getGamePlayerCollisionRect = (item, x, y) => {
      const foot = getGamePlayerFootPoint(item, x, y);
      const radius = clamp(number(item?.width, 320) * 0.045, 7, 18);
      return {
        left: foot.x - radius,
        top: foot.y - radius * 0.45,
        right: foot.x + radius,
        bottom: foot.y + radius * 0.45,
      };
    };

    const gamePositionHitsObstacle = (item, x, y, time = window.performance.now()) => {
      if (!gameAssetIsPlayer(item)) return false;
      const playerRect = getGamePlayerCollisionRect(item, x, y);
      return getGameObstacleItems().some(({ item: obstacle, index }) => {
        if (obstacle.id === item.id) return false;
        const bounds = getImageTrimVisualBounds(obstacle, index, time);
        return rectsIntersect(playerRect, bounds);
      });
    };

    const gamePositionIsNavigable = (item, position, time = window.performance.now()) => {
      const foot = getGamePlayerFootPoint(item, position.x, position.y);
      return gameFootIsInWalkArea(foot) && !gamePositionHitsObstacle(item, position.x, position.y, time);
    };

    const constrainGameMovement = (item, nextX, nextY, previousPosition = null, time = window.performance.now()) => {
      const previous = previousPosition || { x: number(item?.x), y: number(item?.y) };
      const walkConstrained = constrainGamePositionToWalkArea(item, nextX, nextY);
      if (!gamePositionHitsObstacle(item, walkConstrained.x, walkConstrained.y, time)) return walkConstrained;
      if (gamePositionHitsObstacle(item, previous.x, previous.y, time)) return walkConstrained;

      const xOnly = constrainGamePositionToWalkArea(item, walkConstrained.x, previous.y);
      if (!gamePositionHitsObstacle(item, xOnly.x, xOnly.y, time)) return xOnly;

      const yOnly = constrainGamePositionToWalkArea(item, previous.x, walkConstrained.y);
      if (!gamePositionHitsObstacle(item, yOnly.x, yOnly.y, time)) return yOnly;

      return previous;
    };

    const getGamePlayer = () => items.find((item) => gameAssetIsPlayer(item) && !item.hidden && layerVisible(item));

    const getGameInitialPosition = (item) => {
      if (!gameRoom.spawn.enabled) return { x: number(item?.x), y: number(item?.y) };
      return constrainGameMovement(
        item,
        gameRoom.spawn.x - number(item?.width, 320) / 2,
        gameRoom.spawn.y - getImageFullHeight(item),
      );
    };

    const getGameState = (item) => {
      if (!gameAssetIsPlayer(item) || !item?.id) return null;
      if (!gameStates.has(item.id)) {
        const initialPosition = getGameInitialPosition(item);
        gameStates.set(item.id, {
          x: initialPosition.x,
          y: initialPosition.y,
          targetX: initialPosition.x,
          targetY: initialPosition.y,
          lastTime: window.performance.now(),
          facingX: 1,
          direction: "down",
          moving: false,
          path: [],
        });
      }
      return gameStates.get(item.id);
    };

    const getGameOffset = (item) => {
      const state = getGameState(item);
      if (!state) return { x: 0, y: 0 };
      return {
        x: number(state.x) - number(item.x),
        y: number(state.y) - number(item.y),
      };
    };

    const getGameFacingX = (item) => {
      const game = getGameAsset(item);
      if (!game.player || !game.autoFlip || !gameRoom.input.mirrorHorizontal) return 1;
      if (item.sprite?.directional?.enabled === true && getSpriteFramesForState(item.sprite, "walk-left").length) return 1;
      const state = getGameState(item);
      return number(state?.facingX, 1) < 0 ? -1 : 1;
    };

    const getImageEffectiveZ = (item, renderOffsetY = 0) => {
      const baseZ = number(item?.z, 20);
      if (!getGameAsset(item).depthSort) return baseZ;
      const depthAnchorY = number(item?.y) + number(renderOffsetY) + getImageFullHeight(item);
      return Math.round(baseZ * 10000 + depthAnchorY);
    };

    const setGameFacing = (item, directionX = 0) => {
      const game = getGameAsset(item);
      if (!game.player || !game.autoFlip || !gameRoom.input.mirrorHorizontal || Math.abs(number(directionX)) <= 0.01) return;
      const state = getGameState(item);
      if (!state) return;
      state.facingX = number(directionX) < 0 ? -1 : 1;
    };

    const setGameMotionState = (item, vectorX = 0, vectorY = 0, moving = true) => {
      if (!gameAssetIsPlayer(item)) return;
      const state = getGameState(item);
      if (!state) return;
      const hasVector = Math.hypot(number(vectorX), number(vectorY)) > 0.01;
      const nextMoving = Boolean(moving && hasVector);
      const nextDirection = hasVector ? getGameDirectionFromVector(vectorX, vectorY, state.direction || "down") : state.direction || "down";
      const previousStateId = getSpriteDirectionalRuntimeStateId(item, state);
      state.direction = nextDirection;
      state.moving = nextMoving;
      const nextStateId = getSpriteDirectionalRuntimeStateId(item, state);
      if (previousStateId !== nextStateId) resetSpriteRuntime(item.id);
    };

    const stopGameMotionState = (item) => setGameMotionState(item, 0, 0, false);

    const clearGamePath = (state) => {
      if (state) state.path = [];
    };

    const advanceGamePathTarget = (state) => {
      if (!state || !Array.isArray(state.path) || !state.path.length) return false;
      const next = state.path.shift();
      state.targetX = number(next.x, state.x);
      state.targetY = number(next.y, state.y);
      return true;
    };

    const setGamePath = (state, path) => {
      const waypoints = Array.isArray(path)
        ? path.filter((point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y)))
        : [];
      if (!state || !waypoints.length) {
        clearGamePath(state);
        return false;
      }
      const first = waypoints[0];
      state.targetX = number(first.x, state.x);
      state.targetY = number(first.y, state.y);
      state.path = waypoints.slice(1).map((point) => ({ x: number(point.x), y: number(point.y) }));
      return true;
    };

    const getGamePathGridSize = (item) => clamp(Math.round(number(item?.width, 320) * 0.12), 28, 56);

    const gameSegmentIsNavigable = (item, start, end, time = window.performance.now()) => {
      const distance = Math.hypot(number(end.x) - number(start.x), number(end.y) - number(start.y));
      const sampleStep = Math.max(getGamePathGridSize(item) * 0.45, 12);
      const sampleCount = Math.max(1, Math.ceil(distance / sampleStep));
      for (let index = 0; index <= sampleCount; index += 1) {
        const t = index / sampleCount;
        const position = {
          x: number(start.x) + (number(end.x) - number(start.x)) * t,
          y: number(start.y) + (number(end.y) - number(start.y)) * t,
        };
        if (!gamePositionIsNavigable(item, position, time)) return false;
      }
      return true;
    };

    const findNearestGameNavigablePosition = (item, position, time = window.performance.now()) => {
      const constrainedPosition = constrainGamePositionToWalkArea(item, position.x, position.y);
      if (gamePositionIsNavigable(item, constrainedPosition, time)) return constrainedPosition;
      const targetFoot = getGamePlayerFootPoint(item, constrainedPosition.x, constrainedPosition.y);
      const step = Math.max(10, Math.round(getGamePathGridSize(item) / 2));
      const maxRadius = Math.max(220, getGamePathGridSize(item) * 8);
      let bestCandidate = null;
      let bestDistance = Infinity;
      for (let radius = step; radius <= maxRadius; radius += step) {
        const slices = Math.max(12, Math.round((Math.PI * 2 * radius) / step));
        for (let slice = 0; slice < slices; slice += 1) {
          const angle = (slice / slices) * Math.PI * 2;
          const foot = {
            x: targetFoot.x + Math.cos(angle) * radius,
            y: targetFoot.y + Math.sin(angle) * radius,
          };
          const candidatePosition = gamePositionFromFoot(item, foot);
          const candidate = constrainGamePositionToWalkArea(item, candidatePosition.x, candidatePosition.y);
          if (!gamePositionIsNavigable(item, candidate, time)) continue;
          const distance = Math.hypot(candidate.x - constrainedPosition.x, candidate.y - constrainedPosition.y);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestCandidate = candidate;
          }
        }
        if (bestCandidate) return bestCandidate;
      }
      return bestCandidate || constrainedPosition;
    };

    const getGameNavigationBounds = (item, start, target, time = window.performance.now()) => {
      const cell = getGamePathGridSize(item);
      const startFoot = getGamePlayerFootPoint(item, start.x, start.y);
      const targetFoot = getGamePlayerFootPoint(item, target.x, target.y);
      let left = Math.min(startFoot.x, targetFoot.x);
      let right = Math.max(startFoot.x, targetFoot.x);
      let top = Math.min(startFoot.y, targetFoot.y);
      let bottom = Math.max(startFoot.y, targetFoot.y);
      if (gameWalkAreaIsActive()) {
        gameRoom.walkArea.points.forEach((point) => {
          left = Math.min(left, point.x);
          right = Math.max(right, point.x);
          top = Math.min(top, point.y);
          bottom = Math.max(bottom, point.y);
        });
      } else {
        left = Math.min(left, 0);
        top = Math.min(top, 0);
        right = Math.max(right, canvas?.scrollWidth || 0, document.documentElement.scrollWidth, window.innerWidth);
        bottom = Math.max(bottom, canvas?.scrollHeight || 0, document.documentElement.scrollHeight, window.innerHeight);
      }
      const routeBox = {
        left: Math.min(startFoot.x, targetFoot.x) - cell * 8,
        right: Math.max(startFoot.x, targetFoot.x) + cell * 8,
        top: Math.min(startFoot.y, targetFoot.y) - cell * 8,
        bottom: Math.max(startFoot.y, targetFoot.y) + cell * 8,
      };
      getGameObstacleItems().forEach(({ item: obstacle, index }) => {
        const bounds = getImageTrimVisualBounds(obstacle, index, time);
        const closeToRoute = bounds.right >= routeBox.left &&
          bounds.left <= routeBox.right &&
          bounds.bottom >= routeBox.top &&
          bounds.top <= routeBox.bottom;
        if (!gameWalkAreaIsActive() && !closeToRoute) return;
        left = Math.min(left, bounds.left);
        right = Math.max(right, bounds.right);
        top = Math.min(top, bounds.top);
        bottom = Math.max(bottom, bounds.bottom);
      });
      const pad = cell * 4;
      left -= pad;
      right += pad;
      top -= pad;
      bottom += pad;
      const maxSpan = cell * 68;
      if (right - left > maxSpan) {
        const center = (startFoot.x + targetFoot.x) / 2;
        left = Math.min(startFoot.x, targetFoot.x, center - maxSpan / 2);
        right = Math.max(startFoot.x, targetFoot.x, center + maxSpan / 2);
      }
      if (bottom - top > maxSpan) {
        const center = (startFoot.y + targetFoot.y) / 2;
        top = Math.min(startFoot.y, targetFoot.y, center - maxSpan / 2);
        bottom = Math.max(startFoot.y, targetFoot.y, center + maxSpan / 2);
      }
      return { left, top, right, bottom, cell };
    };

    const simplifyGamePath = (item, points, time = window.performance.now()) => {
      if (points.length <= 2) return points;
      const simplified = [points[0]];
      let currentIndex = 0;
      while (currentIndex < points.length - 1) {
        let nextIndex = points.length - 1;
        while (nextIndex > currentIndex + 1 && !gameSegmentIsNavigable(item, points[currentIndex], points[nextIndex], time)) {
          nextIndex -= 1;
        }
        simplified.push(points[nextIndex]);
        currentIndex = nextIndex;
      }
      return simplified;
    };

    const findGamePath = (item, start, desiredTarget, time = window.performance.now()) => {
      const target = findNearestGameNavigablePosition(item, desiredTarget, time);
      if (!gamePositionIsNavigable(item, target, time)) return [];
      if (!gamePositionIsNavigable(item, start, time)) {
        return [target].filter((point) => gamePositionIsNavigable(item, point, time));
      }
      if (gameSegmentIsNavigable(item, start, target, time)) return [target];

      const bounds = getGameNavigationBounds(item, start, target, time);
      const cols = Math.max(2, Math.ceil((bounds.right - bounds.left) / bounds.cell) + 1);
      const rows = Math.max(2, Math.ceil((bounds.bottom - bounds.top) / bounds.cell) + 1);
      if (cols * rows > gamePathMaxNodes) return [];

      const nodeKey = (col, row) => col + "," + row;
      const nodeFoot = (col, row) => ({ x: bounds.left + col * bounds.cell, y: bounds.top + row * bounds.cell });
      const nodePosition = (col, row) => gamePositionFromFoot(item, nodeFoot(col, row));
      const nodeIsNavigable = (col, row) => (
        col >= 0 &&
        row >= 0 &&
        col < cols &&
        row < rows &&
        gamePositionIsNavigable(item, nodePosition(col, row), time)
      );
      const closestNode = (position, needsLine = true) => {
        const foot = getGamePlayerFootPoint(item, position.x, position.y);
        const centerCol = clamp(Math.round((foot.x - bounds.left) / bounds.cell), 0, cols - 1);
        const centerRow = clamp(Math.round((foot.y - bounds.top) / bounds.cell), 0, rows - 1);
        let best = null;
        let bestDistance = Infinity;
        const maxRadius = Math.max(cols, rows);
        for (let radius = 0; radius <= maxRadius; radius += 1) {
          const minCol = clamp(centerCol - radius, 0, cols - 1);
          const maxCol = clamp(centerCol + radius, 0, cols - 1);
          const minRow = clamp(centerRow - radius, 0, rows - 1);
          const maxRow = clamp(centerRow + radius, 0, rows - 1);
          for (let row = minRow; row <= maxRow; row += 1) {
            for (let col = minCol; col <= maxCol; col += 1) {
              if (radius > 0 && col > minCol && col < maxCol && row > minRow && row < maxRow) continue;
              if (!nodeIsNavigable(col, row)) continue;
              const candidatePosition = nodePosition(col, row);
              if (needsLine && !gameSegmentIsNavigable(item, position, candidatePosition, time)) continue;
              const distance = Math.hypot(candidatePosition.x - position.x, candidatePosition.y - position.y);
              if (distance < bestDistance) {
                bestDistance = distance;
                best = { col, row, key: nodeKey(col, row) };
              }
            }
          }
          if (best) return best;
        }
        return best;
      };

      const startNode = closestNode(start, true) || closestNode(start, false);
      const targetNode = closestNode(target, true) || closestNode(target, false);
      if (!startNode || !targetNode) return [];

      const heuristic = (col, row) => Math.hypot(targetNode.col - col, targetNode.row - row);
      const open = [{ ...startNode, g: 0, f: heuristic(startNode.col, startNode.row) }];
      const cameFrom = new Map();
      const bestScore = new Map([[startNode.key, 0]]);
      const closed = new Set();
      const neighborSteps = [
        { col: -1, row: 0, cost: 1 },
        { col: 1, row: 0, cost: 1 },
        { col: 0, row: -1, cost: 1 },
        { col: 0, row: 1, cost: 1 },
        { col: -1, row: -1, cost: Math.SQRT2 },
        { col: 1, row: -1, cost: Math.SQRT2 },
        { col: -1, row: 1, cost: Math.SQRT2 },
        { col: 1, row: 1, cost: Math.SQRT2 },
      ];
      let reached = null;
      let visits = 0;
      while (open.length && visits < gamePathMaxNodes) {
        visits += 1;
        let bestOpenIndex = 0;
        for (let index = 1; index < open.length; index += 1) {
          if (open[index].f < open[bestOpenIndex].f) bestOpenIndex = index;
        }
        const current = open.splice(bestOpenIndex, 1)[0];
        if (closed.has(current.key)) continue;
        if (current.key === targetNode.key) {
          reached = current;
          break;
        }
        closed.add(current.key);
        neighborSteps.forEach((step) => {
          const nextCol = current.col + step.col;
          const nextRow = current.row + step.row;
          const nextKey = nodeKey(nextCol, nextRow);
          if (closed.has(nextKey) || !nodeIsNavigable(nextCol, nextRow)) return;
          if (step.col && step.row && (!nodeIsNavigable(current.col + step.col, current.row) || !nodeIsNavigable(current.col, current.row + step.row))) return;
          const nextScore = current.g + step.cost;
          if (nextScore >= number(bestScore.get(nextKey), Infinity)) return;
          cameFrom.set(nextKey, current.key);
          bestScore.set(nextKey, nextScore);
          open.push({
            col: nextCol,
            row: nextRow,
            key: nextKey,
            g: nextScore,
            f: nextScore + heuristic(nextCol, nextRow),
          });
        });
      }
      if (!reached) return [];

      const nodePath = [reached.key];
      while (nodePath[0] !== startNode.key) {
        const previous = cameFrom.get(nodePath[0]);
        if (!previous) break;
        nodePath.unshift(previous);
      }
      const waypointPositions = nodePath
        .map((key) => key.split(",").map((value) => Number(value)))
        .map(([col, row]) => nodePosition(col, row));
      const routePoints = [start, ...waypointPositions];
      const lastWaypoint = routePoints[routePoints.length - 1];
      if (lastWaypoint && gameSegmentIsNavigable(item, lastWaypoint, target, time)) routePoints.push(target);
      return simplifyGamePath(item, routePoints, time)
        .slice(1)
        .filter((point, index, list) => index === 0 || Math.hypot(point.x - list[index - 1].x, point.y - list[index - 1].y) > 0.5);
    };

    const gameActionForKey = (key) => {
      const normalizedKey = normalizeKeyboardKey(key);
      if (!normalizedKey) return "";
      return gameInputActionIds.find((actionId) => gameRoom.input.bindings[actionId]?.includes(normalizedKey)) || "";
    };

    const getGameMoveVector = () => {
      let x = 0;
      let y = 0;
      if (gamePressedActions.has("move-left")) x -= 1;
      if (gamePressedActions.has("move-right")) x += 1;
      if (gamePressedActions.has("move-up")) y -= 1;
      if (gamePressedActions.has("move-down")) y += 1;
      const length = Math.hypot(x, y);
      return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
    };

    const gameRuntimeActive = () => {
      const player = getGamePlayer();
      const state = player ? getGameState(player) : null;
      if (!player || !state) return false;
      return Boolean(
        gamePressedActions.size ||
        state.moving ||
        (Array.isArray(state.path) && state.path.length) ||
        Math.hypot(number(state.targetX) - number(state.x), number(state.targetY) - number(state.y)) > 1
      );
    };

    const advanceGameRuntime = (time) => {
      const keyboardPlayer = getGamePlayer();
      const keyboardVector = getGameMoveVector();
      let hasActiveMovement = false;
      items.forEach((item) => {
        if (!gameAssetIsPlayer(item) || item.hidden || !layerVisible(item)) return;
        const state = getGameState(item);
        if (!state) return;
        const game = getGameAsset(item);
        const elapsed = clamp((time - number(state.lastTime, time)) / 1000, 0.001, 0.05);
        state.lastTime = time;
        if (keyboardPlayer?.id === item.id && (keyboardVector.x || keyboardVector.y)) {
          clearGamePath(state);
          setGameFacing(item, keyboardVector.x);
          setGameMotionState(item, keyboardVector.x, keyboardVector.y, true);
          const nextPosition = constrainGameMovement(item, state.x + keyboardVector.x * game.speed * elapsed, state.y + keyboardVector.y * game.speed * elapsed, state, time);
          state.x = nextPosition.x;
          state.y = nextPosition.y;
          state.targetX = state.x;
          state.targetY = state.y;
          hasActiveMovement = true;
          return;
        }
        const dx = number(state.targetX) - number(state.x);
        const dy = number(state.targetY) - number(state.y);
        setGameFacing(item, dx);
        const distance = Math.hypot(dx, dy);
        if (distance <= 1) {
          state.x = state.targetX;
          state.y = state.targetY;
          if (advanceGamePathTarget(state)) {
            hasActiveMovement = true;
            return;
          }
          stopGameMotionState(item);
          return;
        }
        setGameMotionState(item, dx, dy, true);
        const step = Math.min(distance, game.speed * elapsed);
        const previousX = state.x;
        const previousY = state.y;
        const nextPosition = constrainGameMovement(item, state.x + (dx / distance) * step, state.y + (dy / distance) * step, state, time);
        state.x = nextPosition.x;
        state.y = nextPosition.y;
        const didMove = Math.hypot(number(state.x) - number(previousX), number(state.y) - number(previousY)) > 0.1;
        if (!didMove || Math.hypot(number(state.x) - number(state.targetX), number(state.y) - number(state.targetY)) <= 1) {
          if (didMove && advanceGamePathTarget(state)) {
            hasActiveMovement = true;
          } else {
            clearGamePath(state);
            state.targetX = state.x;
            state.targetY = state.y;
            stopGameMotionState(item);
          }
        }
        hasActiveMovement = hasActiveMovement || didMove;
      });
      return hasActiveMovement || gameRuntimeActive();
    };

    const setGameTargetFromEvent = (event) => {
      const player = getGamePlayer();
      const state = player ? getGameState(player) : null;
      if (!player || !state) return false;
      const targetPosition = constrainGamePositionToWalkArea(
        player,
        event.pageX - number(player.width, 320) / 2,
        event.pageY - getImageFullHeight(player)
      );
      const path = findGamePath(
        player,
        { x: number(state.x), y: number(state.y) },
        targetPosition,
        window.performance.now()
      );
      if (!setGamePath(state, path)) {
        clearGamePath(state);
        state.targetX = state.x;
        state.targetY = state.y;
        state.lastTime = window.performance.now();
        stopGameMotionState(player);
        return true;
      }
      setGameFacing(player, number(state.targetX) - number(state.x));
      setGameMotionState(player, number(state.targetX) - number(state.x), number(state.targetY) - number(state.y), false);
      state.lastTime = window.performance.now();
      syncMotion();
      return true;
    };

    const handleGameKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      const action = gameActionForKey(event.key);
      const player = getGamePlayer();
      if (action === "cancel") {
        if (!player) return false;
        event.preventDefault();
        gamePressedActions.clear();
        const state = getGameState(player);
        if (state) {
          clearGamePath(state);
          state.targetX = state.x;
          state.targetY = state.y;
          state.lastTime = window.performance.now();
          stopGameMotionState(player);
        }
        syncMotion();
        return true;
      }
      if (!gameInputMovementActions.has(action) || !player) return false;
      event.preventDefault();
      gamePressedActions.add(action);
      const state = getGameState(player);
      if (state) {
        clearGamePath(state);
        state.targetX = state.x;
        state.targetY = state.y;
        state.lastTime = window.performance.now();
      }
      syncMotion();
      return true;
    };

    const handleGameKeyUp = (event) => {
      const action = gameActionForKey(event.key);
      if (!gameInputMovementActions.has(action) || !gamePressedActions.has(action)) return false;
      event.preventDefault();
      gamePressedActions.delete(action);
      const player = getGamePlayer();
      const state = player ? getGameState(player) : null;
      if (state && !gamePressedActions.size) {
        state.targetX = state.x;
        state.targetY = state.y;
        state.lastTime = window.performance.now();
        stopGameMotionState(player);
      }
      syncMotion();
      return true;
    };

    const getRenderState = (item, index, time) => {
      const gameRuntimePlayer = gameAssetIsPlayer(item);
      const motion = gameRuntimePlayer ? { x: 0, y: 0, rotation: 0 } : getMotionState(item, index, time);
      const path = gameRuntimePlayer ? { x: 0, y: 0 } : getPathState(item, time);
      const parallax = item.parallax || { enabled: false, depth: 1 };
      const offset = gameRuntimePlayer ? { x: 0, y: 0 } : dragOffset(item.id);
      const gameOffset = getGameOffset(item);
      return {
        x: motion.x + path.x + (!gameRuntimePlayer && parallaxActive(parallax) ? -camera.x * parallax.depth : 0) + offset.x + gameOffset.x,
        y: motion.y + path.y + (!gameRuntimePlayer && parallaxActive(parallax) ? -camera.y * parallax.depth : 0) + offset.y + gameOffset.y,
        rotation: motion.rotation,
      };
    };

    const applyTransform = (item, index, time) => {
      const box = boxes.get(item.id);
      if (!box) return;
      const state = getRenderState(item, index, time);
      box.style.transform = "translate(" + (item.x + state.x) + "px, " + (item.y + state.y) + "px) rotate(" + (item.rotation + state.rotation) + "deg)";
      box.style.zIndex = String(getImageEffectiveZ(item, state.y));
      box.style.setProperty("--image-game-facing-x", String(getGameFacingX(item)));
    };

    const syncMotion = () => {
      const hasMotion = gameRuntimeActive() || items.some((item) => motionActive(item.motion) || pathActive(item) || parallaxActive(item.parallax) || spriteAnimating(item) || inertiaItems.size);
      if (!hasMotion) {
        raf = 0;
        return;
      }
      if (raf) return;
      const tick = (time) => {
        raf = 0;
        advanceGameRuntime(time);
        items.forEach((item, index) => {
          applyTransform(item, index, time);
          applySpriteFrame(item, time);
        });
        syncMotion();
      };
      raf = window.requestAnimationFrame(tick);
    };

    const buildMask = (item, image) => {
      try {
        const width = image.naturalWidth || item.trim.naturalWidth;
        const height = image.naturalHeight || item.trim.naturalHeight;
        if (!width || !height) return;
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        masks.set(item.id, { naturalWidth: width, naturalHeight: height, alpha: ctx.getImageData(0, 0, width, height).data });
      } catch {
        masks.delete(item.id);
      }
    };

    const render = () => {
      canvas.innerHTML = "";
      items.forEach((item, index) => {
        if (item.hidden || !item.src) return;
        const trim = item.trim;
        const scale = item.width / Math.max(trim.naturalWidth, 1);
        const fullHeight = trim.naturalHeight * scale;
        const trimLeft = trim.x * scale;
        const trimTop = trim.y * scale;
        const trimWidth = trim.width * scale;
        const trimHeight = trim.height * scale;
        const box = document.createElement("figure");
        box.className = "public-image";
        box.dataset.id = item.id;
        box.dataset.hoverEffect = item.hoverEffect;
        box.dataset.clickEffect = item.clickEffect;
        box.dataset.hasLink = resolveLink(item.linkUrl) ? "true" : "false";
        box.dataset.publicDrag = publicDragActive(item) ? "true" : "false";
        box.classList.toggle("is-trigger-hidden", !layerVisible(item));
        box.style.width = item.width + "px";
        box.style.height = fullHeight + "px";
        box.style.zIndex = String(getImageEffectiveZ(item, 0));
        box.style.setProperty("--image-opacity", String(item.opacity));
        box.style.setProperty("--blend-mode", item.blendMode);
        box.style.setProperty("--image-game-facing-x", String(getGameFacingX(item)));
        box.style.setProperty("--image-full-width", item.width + "px");
        box.style.setProperty("--image-full-height", fullHeight + "px");
        box.style.setProperty("--trim-left", trimLeft + "px");
        box.style.setProperty("--trim-top", trimTop + "px");
        box.style.setProperty("--trim-width", trimWidth + "px");
        box.style.setProperty("--trim-height", trimHeight + "px");
        const surface = document.createElement("div");
        surface.className = "public-image__surface";
        const image = document.createElement("img");
        const frame = spriteActive(item) ? currentSpriteFrame(item, window.performance.now()) : null;
        image.src = frame && frame.src ? frame.src : item.src;
        image.alt = "Immagine";
        image.draggable = false;
        image.addEventListener("load", () => buildMask(item, image), { once: true });
        surface.append(image);
        box.append(surface);
        boxes.set(item.id, box);
        canvas.append(box);
        applyTransform(item, index, window.performance.now());
      });
      syncMotion();
    };

    const hitForItem = (item, index, pageX, pageY) => {
      if (item.hidden || !layerVisible(item) || item.opacity <= 0.01) return null;
      const state = getRenderState(item, index, window.performance.now());
      const trim = item.trim;
      const scale = item.width / Math.max(trim.naturalWidth, 1);
      const fullHeight = trim.naturalHeight * scale;
      const centerX = item.width / 2;
      const centerY = fullHeight / 2;
      const dx = pageX - item.x - state.x;
      const dy = pageY - item.y - state.y;
      const radians = -(item.rotation + state.rotation) * Math.PI / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const relX = dx - centerX;
      const relY = dy - centerY;
      const localX = relX * cos - relY * sin + centerX;
      const localY = relX * sin + relY * cos + centerY;
      const trimLeft = trim.x * scale;
      const trimTop = trim.y * scale;
      const trimWidth = trim.width * scale;
      const trimHeight = trim.height * scale;
      if (localX < trimLeft || localY < trimTop || localX > trimLeft + trimWidth || localY > trimTop + trimHeight) return null;
      const mask = masks.get(item.id);
      if (mask) {
        const naturalX = Math.floor(localX / Math.max(scale, 0.0001));
        const naturalY = Math.floor(localY / Math.max(scale, 0.0001));
        const alphaIndex = (naturalY * mask.naturalWidth + naturalX) * 4 + 3;
        if (naturalX >= 0 && naturalY >= 0 && naturalX < mask.naturalWidth && naturalY < mask.naturalHeight && mask.alpha[alphaIndex] <= 8) return null;
      }
      return { item, index, localX, localY, trimLeft, trimTop, trimWidth, trimHeight };
    };

    const getHit = (event) => {
      const pageX = event.pageX || event.clientX + window.scrollX;
      const pageY = event.pageY || event.clientY + window.scrollY;
      const now = window.performance.now();
      const ordered = items
        .map((item, index) => ({ item, index, z: getImageEffectiveZ(item, getRenderState(item, index, now).y) }))
        .sort((a, b) => b.z - a.z || b.index - a.index);
      for (const entry of ordered) {
        const hit = hitForItem(entry.item, entry.index, pageX, pageY);
        if (hit) return hit;
      }
      return null;
    };

    const clearHover = () => {
      if (hoverId && boxes.get(hoverId)) boxes.get(hoverId).classList.remove("is-shape-hover");
      hoverId = "";
      document.body.style.cursor = "";
    };

    const setHover = (hit) => {
      if (!hit) return clearHover();
      if (hoverId && hoverId !== hit.item.id && boxes.get(hoverId)) boxes.get(hoverId).classList.remove("is-shape-hover");
      const box = boxes.get(hit.item.id);
      if (!box) return clearHover();
      hoverId = hit.item.id;
      box.classList.add("is-shape-hover");
      document.body.style.cursor = publicDragActive(hit.item) ? "grab" : resolveLink(hit.item.linkUrl) ? "pointer" : "";
      if (hit.item.hoverEffect === "tilt") {
        const x = ((hit.localX - hit.trimLeft) / Math.max(hit.trimWidth, 1) - 0.5) * 2;
        const y = ((hit.localY - hit.trimTop) / Math.max(hit.trimHeight, 1) - 0.5) * 2;
        box.style.setProperty("--tilt-x", clamp(-y * 8, -8, 8) + "deg");
        box.style.setProperty("--tilt-y", clamp(x * 10, -10, 10) + "deg");
      }
    };

    const triggerAnimation = (item) => {
      const box = boxes.get(item.id);
      if (!box) return;
      box.classList.remove("is-click-pulse", "is-click-pop", "is-click-flash", "is-click-spin");
      window.requestAnimationFrame(() => {
        void box.offsetWidth;
        box.classList.add("is-click-" + item.clickEffect);
        box.addEventListener("animationend", () => {
          box.classList.remove("is-click-pulse", "is-click-pop", "is-click-flash", "is-click-spin");
        }, { once: true });
      });
    };

    const activate = (item) => {
      const href = resolveLink(item.linkUrl);
      const visual = visualClickEffects.has(item.clickEffect);
      if (visual) triggerAnimation(item);
      if (item.clickEffect === "bring-front") {
        item.z = Math.max(...items.map((entry) => entry.z)) + 5;
        const box = boxes.get(item.id);
        if (box) box.style.zIndex = String(getImageEffectiveZ(item, getRenderState(item, Math.max(items.findIndex((entry) => entry.id === item.id), 0), window.performance.now()).y));
      }
      if (href) {
        window.setTimeout(() => {
          window.location.href = href;
        }, visual ? 360 : 0);
      }
    };

    const clickSuppressed = (id) => {
      const now = Date.now();
      return now - number(clickSuppressions.get(String(id)), 0) < 450 || now - number(clickSuppressions.get("__global"), 0) < 280;
    };

    const markClickSuppressed = (id) => {
      const now = Date.now();
      clickSuppressions.set(String(id), now);
      clickSuppressions.set("__global", now);
    };

    const syncInertia = () => {
      if (!inertiaItems.size || inertiaRaf) return;
      const tick = (time) => {
        inertiaRaf = 0;
        inertiaItems.forEach((state, id) => {
          const item = items.find((entry) => entry.id === id);
          if (!item || !publicDragActive(item)) {
            inertiaItems.delete(id);
            return;
          }
          const elapsed = Math.max((time - number(state.time, time)) / 1000, 0);
          const dt = clamp(elapsed, 0.001, 0.032);
          const offset = dragOffset(id);
          dragOffsets.set(id, { x: offset.x + state.vx * dt, y: offset.y + state.vy * dt });
          const damping = Math.pow(item.publicDrag.inertia, Math.min(elapsed, 0.12) * 60);
          state.vx *= damping;
          state.vy *= damping;
          state.time = time;
          if (Math.hypot(state.vx, state.vy) < 8 || item.publicDrag.inertia <= 0.01) inertiaItems.delete(id);
        });
        items.forEach((item, index) => applyTransform(item, index, time));
        if (inertiaItems.size) inertiaRaf = window.requestAnimationFrame(tick);
      };
      inertiaRaf = window.requestAnimationFrame(tick);
    };

    const startPublicDrag = (event, hit) => {
      if (!publicDragActive(hit.item)) return false;
      event.preventDefault();
      const item = hit.item;
      const id = item.id;
      inertiaItems.delete(id);
      const startOffset = dragOffset(id);
      const startX = event.pageX;
      const startY = event.pageY;
      let lastX = event.pageX;
      let lastY = event.pageY;
      let lastTime = window.performance.now();
      let velocityX = 0;
      let velocityY = 0;
      let moved = false;
      document.body.style.cursor = "grabbing";
      const move = (moveEvent) => {
        const now = window.performance.now();
        const deltaX = moveEvent.pageX - startX;
        const deltaY = moveEvent.pageY - startY;
        moved = moved || Math.hypot(deltaX, deltaY) > 5;
        const dt = clamp((now - lastTime) / 1000, 0.001, 0.08);
        const instantVelocityX = (moveEvent.pageX - lastX) / dt;
        const instantVelocityY = (moveEvent.pageY - lastY) / dt;
        velocityX = velocityX * 0.35 + instantVelocityX * 0.65;
        velocityY = velocityY * 0.35 + instantVelocityY * 0.65;
        dragOffsets.set(id, { x: startOffset.x + deltaX, y: startOffset.y + deltaY });
        lastX = moveEvent.pageX;
        lastY = moveEvent.pageY;
        lastTime = now;
        applyTransform(item, hit.index, now);
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.body.style.cursor = "";
        if (!moved) return;
        markClickSuppressed(id);
        const releaseNow = window.performance.now();
        const releaseGap = Math.max(releaseNow - lastTime, 0);
        const staleFactor = releaseGap > 80 ? clamp(1 - (releaseGap - 80) / 180, 0, 1) : 1;
        const handoffVelocityX = clamp(velocityX * staleFactor, -2400, 2400);
        const handoffVelocityY = clamp(velocityY * staleFactor, -2400, 2400);
        if (Math.hypot(handoffVelocityX, handoffVelocityY) > 12 && item.publicDrag.inertia > 0.01) {
          inertiaItems.set(id, { vx: handoffVelocityX, vy: handoffVelocityY, time: releaseNow - 16 });
          syncInertia();
        }
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up, { once: true });
      return true;
    };

    document.addEventListener("pointermove", (event) => {
      camera.x = ((event.clientX / Math.max(window.innerWidth, 1)) - 0.5) * 80;
      camera.y = ((event.clientY / Math.max(window.innerHeight, 1)) - 0.5) * 80;
      setHover(getHit(event));
      if (items.some((item) => parallaxActive(item.parallax))) syncMotion();
    });

    document.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const hit = getHit(event);
      if (hit) startPublicDrag(event, hit);
    });

    document.addEventListener("click", (event) => {
      const hit = getHit(event);
      const suppressed = hit && clickSuppressed(hit.item.id);
      const gameTargeted = !suppressed && setGameTargetFromEvent(event);
      if (!hit || suppressed) {
        if (gameTargeted) event.preventDefault();
        return;
      }
      event.preventDefault();
      if (hit.item.trigger?.mode === "click") setTriggered(hit.item.id, true);
      activate(hit.item);
    }, true);

    document.addEventListener("keydown", (event) => {
      if (handleGameKeyDown(event)) return;
      const pressedTriggerKey = event.key === " " ? "Space" : event.key;
      const matchingTriggerItems = items.filter((item) => item.trigger?.mode === "key" && item.trigger.key.toLowerCase() === pressedTriggerKey.toLowerCase());
      if (matchingTriggerItems.length) {
        event.preventDefault();
        matchingTriggerItems.forEach((item) => setTriggered(item.id, true));
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") return;
      const hit = hoverId ? { item: items.find((item) => item.id === hoverId) } : null;
      if (!hit || !hit.item) return;
      event.preventDefault();
      activate(hit.item);
    });

    document.addEventListener("keyup", handleGameKeyUp);

    resetTriggers();
    render();
  };

  const runtimeSource = `(${runtimeScript.toString()})();`;

  window.createImageCanvasPublicHtml = (sourceItems, options = {}) => {
    const items = (Array.isArray(sourceItems) ? sourceItems : [])
      .map(normalizeItem)
      .filter((item) => item.src && !item.hidden);
    const title = options.title || "Canvas immagini";
    const gameRoom = normalizeGameRoom(options.gameRoom);
    const minHeight = estimateHeight(items, gameRoom);
    const backgroundCss = buildCanvasBackgroundCss(options.background, { includeGrid: false });
    const hasGamePlayer = items.some((item) => item.game?.player === true);
    return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${htmlEscape(title)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { min-height: 100%; margin: 0; }
    body {
      min-height: ${minHeight}px;
      overflow-x: hidden;
      background: ${backgroundCss.background};
      background-size: ${backgroundCss.size};
      color: #171717;
      font-family: Inter, "Avenir Next", "Helvetica Neue", Arial, sans-serif;
    }
    .public-stage { position: relative; min-height: ${minHeight}px; }
    .public-canvas { position: absolute; inset: 0; min-height: ${minHeight}px; }
    .public-image {
      --tilt-x: 0deg;
      --tilt-y: 0deg;
      --image-opacity: 1;
      --blend-mode: normal;
      --image-full-width: 100%;
      --image-full-height: auto;
      --trim-left: 0px;
      --trim-top: 0px;
      --trim-width: 100%;
      --trim-height: 100%;
      --image-game-facing-x: 1;
      position: absolute;
      top: 0;
      left: 0;
      margin: 0;
      filter: drop-shadow(0 18px 28px rgba(23, 23, 23, 0.14));
      mix-blend-mode: var(--blend-mode);
      pointer-events: none;
      user-select: none;
      touch-action: none;
    }
    .public-image.is-trigger-hidden {
      opacity: 0;
      pointer-events: none;
    }
    .public-image__surface {
      position: absolute;
      top: var(--trim-top);
      left: var(--trim-left);
      display: block;
      width: var(--trim-width);
      height: var(--trim-height);
      opacity: var(--image-opacity);
      pointer-events: none;
      transform-origin: center;
      transform: scaleX(var(--image-game-facing-x));
      transition: filter 180ms ease, opacity 180ms ease, transform 180ms ease;
      will-change: filter, opacity, transform;
    }
    .public-image__surface img {
      position: absolute;
      top: calc(-1 * var(--trim-top));
      left: calc(-1 * var(--trim-left));
      display: block;
      width: var(--image-full-width);
      max-width: none;
      height: auto;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
    }
    .public-image[data-hover-effect="lift"].is-shape-hover .public-image__surface { transform: scaleX(var(--image-game-facing-x)) translateY(-10px) scale(1.02); }
    .public-image[data-hover-effect="zoom"].is-shape-hover .public-image__surface { transform: scaleX(var(--image-game-facing-x)) scale(1.08); }
    .public-image[data-hover-effect="tilt"].is-shape-hover .public-image__surface { transform: scaleX(var(--image-game-facing-x)) perspective(760px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(1.03); }
    .public-image[data-hover-effect="glow"].is-shape-hover .public-image__surface { filter: drop-shadow(0 0 22px rgba(242, 182, 191, 0.86)); }
    .public-image[data-hover-effect="gray-color"] img { filter: grayscale(1); transition: filter 180ms ease; }
    .public-image[data-hover-effect="gray-color"].is-shape-hover img { filter: grayscale(0); }
    .public-image[data-hover-effect="opacity"] .public-image__surface { opacity: calc(var(--image-opacity) * 0.58); }
    .public-image[data-hover-effect="opacity"].is-shape-hover .public-image__surface { opacity: var(--image-opacity); }
    .public-image[data-hover-effect="paper"].is-shape-hover .public-image__surface { animation: paper-wobble 680ms ease-in-out infinite alternate; }
    .public-image.is-click-pulse .public-image__surface { animation: click-pulse 360ms ease-out; }
    .public-image.is-click-pop .public-image__surface { animation: click-pop 420ms cubic-bezier(.2, 1.3, .3, 1); }
    .public-image.is-click-spin .public-image__surface { animation: click-spin 520ms ease-in-out; }
    .public-image.is-click-flash::before {
      content: "";
      position: absolute;
      inset: -12px;
      z-index: 1;
      border: 2px solid rgba(255, 255, 255, 0.92);
      border-radius: 10px;
      pointer-events: none;
      animation: click-flash 520ms ease-out;
    }
    @keyframes paper-wobble { from { transform: scaleX(var(--image-game-facing-x)) rotate(-1.4deg) translateY(-4px); } to { transform: scaleX(var(--image-game-facing-x)) rotate(1.4deg) translateY(-8px); } }
    @keyframes click-pulse { 0% { transform: scaleX(var(--image-game-facing-x)) scale(1); } 42% { transform: scaleX(var(--image-game-facing-x)) scale(1.075); } 100% { transform: scaleX(var(--image-game-facing-x)) scale(1); } }
    @keyframes click-pop { 0% { transform: scaleX(var(--image-game-facing-x)) scale(1); } 42% { transform: scaleX(var(--image-game-facing-x)) scale(1.13) rotate(-1deg); } 100% { transform: scaleX(var(--image-game-facing-x)) scale(1) rotate(0deg); } }
    @keyframes click-spin { 0% { transform: scaleX(var(--image-game-facing-x)) rotate(0deg) scale(1); } 100% { transform: scaleX(var(--image-game-facing-x)) rotate(360deg) scale(1); } }
    @keyframes click-flash { 0% { opacity: 0; transform: scale(0.95); } 34% { opacity: 1; transform: scale(1.04); } 100% { opacity: 0; transform: scale(1.16); } }
  </style>
</head>
<body data-public-game="${hasGamePlayer ? "true" : "false"}">
  <main class="public-stage" aria-label="${htmlEscape(title)}">
    <div class="public-canvas" data-public-canvas></div>
  </main>
  <script type="application/json" id="canvas-data">${scriptJson(items)}</script>
  <script type="application/json" id="game-data">${scriptJson(gameRoom)}</script>
  <script>${runtimeSource.replace(/<\/script/gi, "<\\/script")}<\/script>
</body>
</html>
`;
  };

  window.downloadImageCanvasPublicHtml = (sourceItems, options = {}) => {
    const html = window.createImageCanvasPublicHtml(sourceItems, options);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = options.filename || "canvas-immagini-pubblica.html";
    document.body.append(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  };
})();
