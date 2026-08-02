(() => {
  const initSharedAdvancedEditor = (root) => {
  if (!(root instanceof HTMLElement) || root.dataset.advancedEditorBound === "true") return;
  root.dataset.advancedEditorBound = "true";

  const namespace = root.dataset.advancedEditorNamespace || "page";
  const settingsKey = `claudia-editor-${namespace}-settings`;
  const bgImageKey = `claudia-editor-${namespace}-bg-image`;
  const imageBoxesKey = `claudia-editor-${namespace}-image-boxes-v1`;
  const galleriesKey = `claudia-editor-${namespace}-galleries-v1`;
  const layersPanelKey = `claudia-editor-${namespace}-layers-panel-v1`;
  const floatingPanelsKey = `claudia-editor-${namespace}-floating-panels-v1`;
  const inspectorDockKey = `claudia-editor-${namespace}-inspector-dock-v1`;
  const canvasBackgroundKey = `claudia-editor-${namespace}-canvas-background-v1`;
  const gameRoomKey = `claudia-editor-${namespace}-game-room-v1`;
  const demoSeedKey = `claudia-editor-${namespace}-demo-seeded-v1`;
  const demoLayerStyleKey = `claudia-editor-${namespace}-demo-layer-styles-v1`;
  const demoParallaxStyleKey = `claudia-editor-${namespace}-demo-parallax-styles-v1`;
  const demoPublicDragStyleKey = `claudia-editor-${namespace}-demo-public-drag-styles-v1`;
  const demoPathStyleKey = `claudia-editor-${namespace}-demo-path-styles-v1`;
  const demoSpriteSeedKey = `claudia-editor-${namespace}-demo-sprite-seeded-v1`;
  const imageCanvasCore = window.ImageCanvasCore || {};

  const bgUploadButton = root.querySelector("[data-uccelli-bg-upload-btn]");
  const bgResetButton = root.querySelector("[data-uccelli-bg-reset-btn]");
  const bgUploadInput = root.querySelector("[data-uccelli-bg-upload-input]");
  const bgImage = root.querySelector("[data-uccelli-bg-img]");
  const imageUploadButtons = Array.from(root.querySelectorAll("[data-uccelli-image-upload-btn]"));
  const imageToolbar = root.querySelector(".image-board-toolbar");
  const editorMenus = Array.from(root.querySelectorAll("[data-image-board-menu]"));
  const menuActionButtons = Array.from(root.querySelectorAll("[data-image-board-menu-action]"));
  const commandPalette = root.querySelector("[data-image-board-command-palette]");
  const commandPaletteOpenButton = root.querySelector("[data-image-board-command-palette-open]");
  const commandPaletteInput = root.querySelector("[data-image-board-command-palette-input]");
  const commandPaletteList = root.querySelector("[data-image-board-command-palette-list]");
  const commandPaletteEmpty = root.querySelector("[data-image-board-command-palette-empty]");
  const commandPaletteCloseButtons = Array.from(root.querySelectorAll("[data-image-board-command-palette-close]"));
  const contextualMenus = {
    sprite: root.querySelector('[data-image-board-context-menu="sprite"]'),
    game: root.querySelector('[data-image-board-context-menu="game"]'),
  };
  const contextualMenuBadges = {
    sprite: root.querySelector('[data-image-board-context-badge="sprite"]'),
    game: root.querySelector('[data-image-board-context-badge="game"]'),
  };
  const contextualMenuTitles = {
    sprite: root.querySelector('[data-image-board-context-title="sprite"]'),
  };
  const imageDemoSeedButton = root.querySelector("[data-uccelli-demo-seed-btn]");
  const publicModeButton = root.querySelector("[data-image-board-public-mode-btn]");
  const editorModeButton = root.querySelector("[data-image-board-editor-mode-btn]");
  const inspectorDockToggleButton = root.querySelector("[data-image-board-inspector-dock-toggle]");
  const imageExportDataButton = root.querySelector("[data-uccelli-image-export-data-btn]");
  const imageImportDataButton = root.querySelector("[data-uccelli-image-import-data-btn]");
  const imageImportDataInput = root.querySelector("[data-uccelli-image-import-data-input]");
  const imageExportPageButton = root.querySelector("[data-uccelli-image-export-page-btn]");
  const imageSelectAllButton = root.querySelector("[data-uccelli-image-select-all-btn]");
  const imageCenterAllButton = root.querySelector("[data-uccelli-image-center-all-btn]");
  const panelsCloseButton = root.querySelector("[data-uccelli-panels-close-btn]");
  const panelsResetButton = root.querySelector("[data-uccelli-panels-reset-btn]");
  const layersMenuToggleButton = root.querySelector("[data-uccelli-layers-menu-toggle]");
  const imageClearButton = root.querySelector("[data-uccelli-image-clear-btn]");
  const imageUploadInput = root.querySelector("[data-uccelli-image-upload-input]");
  const spriteUploadButton = root.querySelector("[data-uccelli-sprite-upload-btn]");
  const spriteUploadInput = root.querySelector("[data-uccelli-sprite-upload-input]");
  const imageLayer = root.querySelector("[data-uccelli-image-layer]");
  const imageZInput = root.querySelector("[data-uccelli-image-z]");
  const imageLayerDownButton = root.querySelector("[data-uccelli-image-layer-down-btn]");
  const imageLayerUpButton = root.querySelector("[data-uccelli-image-layer-up-btn]");
  const imageLayerBottomButton = root.querySelector("[data-uccelli-image-layer-bottom-btn]");
  const imageLayerTopButton = root.querySelector("[data-uccelli-image-layer-top-btn]");
  const imageUndoButton = root.querySelector("[data-uccelli-image-undo-btn]");
  const imageRedoButton = root.querySelector("[data-uccelli-image-redo-btn]");
  const imageHoverEffectInput = root.querySelector("[data-uccelli-image-hover-effect]");
  const imageClickEffectInput = root.querySelector("[data-uccelli-image-click-effect]");
  const imageMotionPresetInput = root.querySelector("[data-uccelli-image-motion-preset]");
  const imageMotionSpeedInput = root.querySelector("[data-uccelli-image-motion-speed]");
  const imageMotionDistanceInput = root.querySelector("[data-uccelli-image-motion-distance]");
  const imageParallaxEnabledInput = root.querySelector("[data-uccelli-image-parallax-enabled]");
  const imageParallaxDepthInput = root.querySelector("[data-uccelli-image-parallax-depth]");
  const imagePublicDragEnabledInput = root.querySelector("[data-uccelli-image-public-drag-enabled]");
  const imagePublicDragInertiaInput = root.querySelector("[data-uccelli-image-public-drag-inertia]");
  const layerTriggerControls = {
    action: root.querySelector("[data-uccelli-layer-trigger-action]"),
    mode: root.querySelector("[data-uccelli-layer-trigger-mode]"),
    delay: root.querySelector("[data-uccelli-layer-trigger-delay]"),
    key: root.querySelector("[data-uccelli-layer-trigger-key]"),
    target: root.querySelector("[data-uccelli-layer-trigger-target]"),
    hint: root.querySelector("[data-uccelli-layer-trigger-hint]"),
  };
  const imagePathEnabledInput = root.querySelector("[data-uccelli-image-path-enabled]");
  const imagePathDurationInput = root.querySelector("[data-uccelli-image-path-duration]");
  const imagePathAddPointButton = root.querySelector("[data-uccelli-image-path-add-point]");
  const imagePathToggleButton = root.querySelector("[data-uccelli-image-path-toggle]");
  const imagePathClearButton = root.querySelector("[data-uccelli-image-path-clear]");
  const imageLinkInput = root.querySelector("[data-uccelli-image-link]");
  const imageLinkPresetInput = root.querySelector("[data-uccelli-image-link-preset]");
  const imageOpacityInput = root.querySelector("[data-uccelli-image-opacity]");
  const imageBlendInput = root.querySelector("[data-uccelli-image-blend]");
  const imageVisibilityButton = root.querySelector("[data-uccelli-image-visibility-btn]");
  const imageLockButton = root.querySelector("[data-uccelli-image-lock-btn]");
  const imageStatus = root.querySelector("[data-uccelli-image-status]");
  const imageEmptyState = root.querySelector("[data-uccelli-image-empty]");
  const galleryUploadButton = root.querySelector("[data-uccelli-gallery-upload-btn]");
  const galleryClearButton = root.querySelector("[data-uccelli-gallery-clear-btn]");
  const galleryUploadInput = root.querySelector("[data-uccelli-gallery-upload-input]");
  const galleryLayer = root.querySelector("[data-uccelli-gallery-layer]");
  const galleryControls = {
    layout: root.querySelector("[data-uccelli-gallery-layout]"),
    columns: root.querySelector("[data-uccelli-gallery-columns]"),
    gap: root.querySelector("[data-uccelli-gallery-gap]"),
    fit: root.querySelector("[data-uccelli-gallery-fit]"),
    autoplay: root.querySelector("[data-uccelli-gallery-autoplay]"),
    interval: root.querySelector("[data-uccelli-gallery-interval]"),
    click: root.querySelector("[data-uccelli-gallery-click]"),
    z: root.querySelector("[data-uccelli-gallery-z]"),
  };
  const layersPanel = root.querySelector("[data-uccelli-layers-panel]");
  const layersPanelDrag = root.querySelector("[data-uccelli-layers-drag]");
  const layersPanelToggle = root.querySelector("[data-uccelli-layers-toggle]");
  const layersList = root.querySelector("[data-uccelli-layers-list]");
  const layersSearchInput = root.querySelector("[data-uccelli-layers-search]");
  const layersFilterButtons = Array.from(root.querySelectorAll("[data-uccelli-layers-filter]"));
  const motionPanel = root.querySelector("[data-uccelli-motion-panel]");
  const motionPanelToggles = Array.from(root.querySelectorAll("[data-uccelli-motion-panel-toggle]"));
  const motionPanelToggle = motionPanelToggles[0] || null;
  const motionPanelHide = root.querySelector("[data-uccelli-motion-panel-hide]");
  const backgroundPanel = root.querySelector("[data-uccelli-background-panel]");
  const backgroundPanelToggles = Array.from(root.querySelectorAll("[data-uccelli-background-panel-toggle]"));
  const backgroundPanelToggle = backgroundPanelToggles[0] || null;
  const backgroundPanelHide = root.querySelector("[data-uccelli-background-panel-hide]");
  const gamePanel = root.querySelector("[data-uccelli-game-panel]");
  const gamePanelToggles = Array.from(root.querySelectorAll("[data-uccelli-game-panel-toggle]"));
  const gamePanelToggle = gamePanelToggles[0] || null;
  const gamePanelHide = root.querySelector("[data-uccelli-game-panel-hide]");
  const spritePanel = root.querySelector("[data-uccelli-sprite-panel]");
  const spritePanelToggles = Array.from(root.querySelectorAll("[data-uccelli-sprite-panel-toggle]"));
  const spritePanelToggle = spritePanelToggles[0] || null;
  const spritePanelHide = root.querySelector("[data-uccelli-sprite-panel-hide]");
  const spriteControls = {
    play: root.querySelector("[data-uccelli-sprite-play-toggle]"),
    fps: root.querySelector("[data-uccelli-sprite-fps]"),
    loop: root.querySelector("[data-uccelli-sprite-loop]"),
    mode: root.querySelector("[data-uccelli-sprite-mode]"),
    frame: root.querySelector("[data-uccelli-sprite-frame]"),
    prev: root.querySelector("[data-uccelli-sprite-prev-frame]"),
    next: root.querySelector("[data-uccelli-sprite-next-frame]"),
    fitFrames: root.querySelector("[data-uccelli-sprite-fit-frames]"),
    onionEnabled: root.querySelector("[data-uccelli-sprite-onion-enabled]"),
    onionOpacity: root.querySelector("[data-uccelli-sprite-onion-opacity]"),
    syncMotion: root.querySelector("[data-uccelli-sprite-sync-motion]"),
    directionalEnabled: root.querySelector("[data-uccelli-sprite-directional-enabled]"),
    directionState: root.querySelector("[data-uccelli-sprite-direction-state]"),
    directionImport: root.querySelector("[data-uccelli-sprite-direction-import]"),
    directionCopyBase: root.querySelector("[data-uccelli-sprite-direction-copy-base]"),
    directionClear: root.querySelector("[data-uccelli-sprite-direction-clear]"),
    directionStatus: root.querySelector("[data-uccelli-sprite-direction-status]"),
    strip: root.querySelector("[data-uccelli-sprite-strip]"),
  };
  const cutoutPanel = root.querySelector("[data-uccelli-cutout-panel]");
  const cutoutPanelToggles = Array.from(root.querySelectorAll("[data-uccelli-cutout-panel-toggle]"));
  const cutoutPanelToggle = cutoutPanelToggles[0] || null;
  const cutoutPanelHide = root.querySelector("[data-uccelli-cutout-panel-hide]");
  const cutoutControls = {
    tolerance: root.querySelector("[data-uccelli-cutout-tolerance]"),
    feather: root.querySelector("[data-uccelli-cutout-feather]"),
    edge: root.querySelector("[data-uccelli-cutout-edge]"),
    crop: root.querySelector("[data-uccelli-cutout-crop]"),
    margin: root.querySelector("[data-uccelli-cutout-margin]"),
    smooth: root.querySelector("[data-uccelli-cutout-smooth]"),
    apply: root.querySelector("[data-uccelli-cutout-apply]"),
    reset: root.querySelector("[data-uccelli-cutout-reset]"),
  };
  const backgroundControls = {
    base: root.querySelector("[data-uccelli-bg-base]"),
    editorGrid: root.querySelector("[data-uccelli-bg-editor-grid]"),
    gradientEnabled: root.querySelector("[data-uccelli-bg-gradient-enabled]"),
    gradientType: root.querySelector("[data-uccelli-bg-gradient-type]"),
    gradientAngle: root.querySelector("[data-uccelli-bg-gradient-angle]"),
    paperEnabled: root.querySelector("[data-uccelli-bg-paper-enabled]"),
    paperStrength: root.querySelector("[data-uccelli-bg-paper-strength]"),
    paperScale: root.querySelector("[data-uccelli-bg-paper-scale]"),
    reset: root.querySelector("[data-uccelli-bg-reset]"),
    stopColors: Array.from(root.querySelectorAll("[data-uccelli-bg-stop-color]")),
    stopPositions: Array.from(root.querySelectorAll("[data-uccelli-bg-stop-position]")),
    stopValues: Array.from(root.querySelectorAll("[data-uccelli-bg-stop-value]")),
  };
  const gameControls = {
    role: root.querySelector("[data-uccelli-game-role]"),
    player: root.querySelector("[data-uccelli-game-player]"),
    depthSort: root.querySelector("[data-uccelli-game-depth-sort]"),
    speed: root.querySelector("[data-uccelli-game-speed]"),
    autoFlip: root.querySelector("[data-uccelli-game-auto-flip]"),
    preview: root.querySelector("[data-uccelli-game-preview-toggle]"),
    reset: root.querySelector("[data-uccelli-game-preview-reset]"),
    status: root.querySelector("[data-uccelli-game-status]"),
    spawnPick: root.querySelector("[data-uccelli-game-spawn-pick]"),
    spawnFromPlayer: root.querySelector("[data-uccelli-game-spawn-from-player]"),
    spawnClear: root.querySelector("[data-uccelli-game-spawn-clear]"),
    spawnStatus: root.querySelector("[data-uccelli-game-spawn-status]"),
    walkEnabled: root.querySelector("[data-uccelli-game-walk-enabled]"),
    walkDraw: root.querySelector("[data-uccelli-game-walk-draw]"),
    walkClose: root.querySelector("[data-uccelli-game-walk-close]"),
    walkDeletePoint: root.querySelector("[data-uccelli-game-walk-delete-point]"),
    walkClear: root.querySelector("[data-uccelli-game-walk-clear]"),
    walkStatus: root.querySelector("[data-uccelli-game-walk-status]"),
    inputMap: root.querySelector("[data-uccelli-game-input-map]"),
    inputKeyButtons: Array.from(root.querySelectorAll("[data-uccelli-game-input-key]")),
    inputMirror: root.querySelector("[data-uccelli-game-input-mirror]"),
    inputReset: root.querySelector("[data-uccelli-game-input-reset]"),
    inputStatus: root.querySelector("[data-uccelli-game-input-status]"),
  };
  const cameraResetButton = root.querySelector("[data-uccelli-camera-reset]");
  const snapSettingsKey = "claudia-editor-snap-settings-v1";
  const defaultSnapSettings = {
    enabled: true,
    showGrid: true,
    size: 20,
  };
  const imageBoardMode = root.classList.contains("image-board-page");
  const hoverEffectLabels = {
    none: "Nessuno",
    lift: "Solleva",
    zoom: "Zoom",
    tilt: "Tilt",
    glow: "Glow",
    "gray-color": "B/N → colore",
    opacity: "Trasparenza",
    paper: "Carta viva",
  };
  const clickEffectLabels = {
    none: "Nessuno",
    pulse: "Pulse",
    pop: "Pop",
    flash: "Flash",
    spin: "Giro",
    "open-link": "Apri link",
    "lock-toggle": "Blocca/sblocca",
    "bring-front": "Porta davanti",
  };
  const blendModeLabels = {
    normal: "Normale",
    multiply: "Moltiplica",
    screen: "Scolora",
    overlay: "Sovrapponi",
    darken: "Scurisci",
    lighten: "Schiarisci",
    "color-burn": "Brucia",
    "color-dodge": "Scherma",
    difference: "Differenza",
    luminosity: "Luminosità",
  };
  const motionPresetLabels = {
    none: "Fermo",
    float: "Fluttua",
    "drift-x": "Onda X",
    "drift-y": "Onda Y",
    orbit: "Orbita",
    sway: "Dondola",
    "scroll-left": "Scorre",
  };
  const allowedHoverEffects = new Set(Object.keys(hoverEffectLabels));
  const allowedClickEffects = new Set(Object.keys(clickEffectLabels));
  const allowedBlendModes = new Set(Object.keys(blendModeLabels));
  const allowedMotionPresets = new Set(Object.keys(motionPresetLabels));
  const allowedSpriteModes = new Set(["forward", "pingpong"]);
  const spriteDirectionStateLabels = {
    "idle-down": "idle-down",
    "walk-down": "walk-down",
    "walk-left": "walk-left",
    "walk-right": "walk-right",
    "walk-up": "walk-up",
  };
  const spriteDirectionStateIds = new Set(Object.keys(spriteDirectionStateLabels));
  const allowedLayerTriggerActions = new Set(["show", "play"]);
  const allowedLayerTriggerModes = new Set(["immediate", "delay", "click", "key", "after-layer"]);
  const allowedGameRoles = new Set(["web", "background", "prop", "player", "npc", "obstacle"]);
  const gameRoleLabels = {
    web: "Web",
    background: "Sfondo stanza",
    prop: "Prop",
    player: "Player",
    npc: "NPC",
    obstacle: "Ostacolo",
  };
  const layerListFilterLabels = {
    all: "Tutti",
    player: "Player",
    obstacle: "Ostacoli",
    sprite: "Sprite",
    web: "Web",
    hidden: "Nascosti",
  };
  const allowedLayerListFilters = new Set(Object.keys(layerListFilterLabels));
  const layerGroupLabels = {
    player: "Player",
    obstacle: "Ostacoli",
    sprite: "Sprite",
    game: "Gioco 2D",
    web: "Web / pagina",
    hidden: "Nascosti",
    gallery: "Gallerie",
    content: "Testi",
    other: "Altri",
  };
  const layerGroupOrder = ["player", "obstacle", "sprite", "game", "web", "hidden", "gallery", "content", "other"];
  const gameInputActionLabels = {
    "move-up": "Su",
    "move-down": "Giù",
    "move-left": "Sinistra",
    "move-right": "Destra",
    action: "Azione",
    cancel: "Annulla",
  };
  const gameInputActionIds = Object.keys(gameInputActionLabels);
  const gameInputMovementActions = new Set(["move-up", "move-down", "move-left", "move-right"]);
  const defaultGameInputBindings = {
    "move-up": ["w", "arrowup"],
    "move-down": ["s", "arrowdown"],
    "move-left": ["a", "arrowleft"],
    "move-right": ["d", "arrowright"],
    action: ["e", "enter"],
    cancel: ["escape", "backspace"],
  };
  const gradientTypes = new Set(["linear", "radial"]);
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

  if (!imageLayer || !galleryLayer) return;

  const readStorageValue = (key, fallback = "") => {
    try {
      const value = window.localStorage.getItem(key);
      return value ?? fallback;
    } catch (error) {
      console.warn("Lettura storage locale non riuscita.", error);
      return fallback;
    }
  };

  const writeStorageValue = (key, value) => {
    window.localStorage.setItem(key, value);
  };

  const removeStorageValue = (key) => {
    window.localStorage.removeItem(key);
  };

  const readJson = (key, fallback) => {
    try {
      const rawValue = readStorageValue(key, "");
      return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    writeStorageValue(key, JSON.stringify(value));
  };

  let preferenceStorageWarningShown = false;
  const warnPreferenceStorageFailure = (label, error) => {
    console.warn(`${label} non salvato nello storage locale.`, error);
    if (preferenceStorageWarningShown) return;
    preferenceStorageWarningShown = true;
    if (imageStatus instanceof HTMLElement) {
      imageStatus.textContent = `${label} non salvato in locale: esporta pacchetto/HTML per sicurezza.`;
    }
  };
  const tryWriteJson = (key, value, label = "Preferenze") => {
    try {
      writeJson(key, value);
      return true;
    } catch (error) {
      warnPreferenceStorageFailure(label, error);
      return false;
    }
  };
  const tryWriteStorageValue = (key, value, label = "Preferenze") => {
    try {
      writeStorageValue(key, value);
      return true;
    } catch (error) {
      warnPreferenceStorageFailure(label, error);
      return false;
    }
  };
  const tryRemoveStorageValue = (key, label = "Preferenze") => {
    try {
      removeStorageValue(key);
      return true;
    } catch (error) {
      warnPreferenceStorageFailure(label, error);
      return false;
    }
  };

  const imageAssetDbName = "claudia-editor-image-assets-v1";
  const imageAssetStoreName = "assets";
  const localImageAssetPrefix = `claudia-local-image-asset://${encodeURIComponent(namespace)}/`;
  const packageImageAssetPrefix = "claudia-package-image-asset://";
  let imageAssetDbPromise = null;
  let imagePersistQueue = Promise.resolve();
  let galleryPersistQueue = Promise.resolve();
  let imagePersistWarningShown = false;
  let transientBackgroundImageValue = "";
  const runtimeImageAssetCache = new Map();

  const isInlineImageSource = (value) => typeof value === "string" && value.startsWith("data:image/");
  const isLocalImageAssetReference = (value) => typeof value === "string" && value.startsWith(localImageAssetPrefix);
  const isPackageImageAssetReference = (value) => typeof value === "string" && value.startsWith(packageImageAssetPrefix);
  const transparentImageSource = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  const renderableImageSource = (value) => isLocalImageAssetReference(value) ? transparentImageSource : value;
  const hashString = (value) => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  };
  const imageAssetKeyFor = (value) => `${namespace}-${value.length}-${hashString(value)}`;
  const openImageAssetDb = () => {
    if (!("indexedDB" in window)) return Promise.resolve(null);
    if (!imageAssetDbPromise) {
      imageAssetDbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(imageAssetDbName, 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(imageAssetStoreName)) {
            request.result.createObjectStore(imageAssetStoreName, { keyPath: "key" });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("IndexedDB non disponibile."));
      });
    }
    return imageAssetDbPromise;
  };
  const writeImageAsset = async (key, value) => {
    if (typeof key === "string" && key && typeof value === "string") runtimeImageAssetCache.set(key, value);
    const db = await openImageAssetDb();
    if (!db) return false;
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(imageAssetStoreName, "readwrite");
      transaction.objectStore(imageAssetStoreName).put({ key, value, updatedAt: new Date().toISOString() });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error("Asset immagine non salvato."));
      transaction.onabort = () => reject(transaction.error || new Error("Salvataggio asset immagine interrotto."));
    });
    return true;
  };
  const readImageAsset = async (key) => {
    if (runtimeImageAssetCache.has(key)) return runtimeImageAssetCache.get(key);
    const db = await openImageAssetDb();
    if (!db) return "";
    return new Promise((resolve) => {
      const transaction = db.transaction(imageAssetStoreName, "readonly");
      const request = transaction.objectStore(imageAssetStoreName).get(key);
      request.onsuccess = () => resolve(typeof request.result?.value === "string" ? request.result.value : "");
      request.onerror = () => resolve("");
    });
  };
  const replaceInlineImageAsset = (value, writes) => {
    if (!isInlineImageSource(value)) return value;
    const key = imageAssetKeyFor(value);
    runtimeImageAssetCache.set(key, value);
    writes.push(writeImageAsset(key, value));
    return `${localImageAssetPrefix}${key}`;
  };
  const cloneImageForLocalStorage = (item, writes) => {
    const clone = JSON.parse(JSON.stringify(item));
    clone.src = replaceInlineImageAsset(clone.src, writes);
    if (clone.cutoutOriginalSrc) clone.cutoutOriginalSrc = replaceInlineImageAsset(clone.cutoutOriginalSrc, writes);
    if (Array.isArray(clone.sprite?.frames)) {
      clone.sprite.frames = clone.sprite.frames.map((frame) => ({
        ...frame,
        src: replaceInlineImageAsset(frame.src, writes),
      }));
    }
    if (clone.sprite?.states && typeof clone.sprite.states === "object") {
      Object.entries(clone.sprite.states).forEach(([stateId, frames]) => {
        if (!Array.isArray(frames)) return;
        clone.sprite.states[stateId] = frames.map((frame) => ({
          ...frame,
          src: replaceInlineImageAsset(frame.src, writes),
        }));
      });
    }
    if (Array.isArray(clone.cutoutOriginalSpriteFrames)) {
      clone.cutoutOriginalSpriteFrames = clone.cutoutOriginalSpriteFrames.map((frame) => ({
        ...frame,
        src: replaceInlineImageAsset(frame.src, writes),
      }));
    }
    return clone;
  };
  const cloneGalleryForLocalStorage = (gallery, writes) => {
    const clone = JSON.parse(JSON.stringify(gallery));
    if (Array.isArray(clone.images)) clone.images = clone.images.map((src) => replaceInlineImageAsset(src, writes));
    return clone;
  };
  const prepareImagePayloadForLocalStorage = async (payload) => {
    const writes = [];
    const images = payload.images.map((item) => cloneImageForLocalStorage(item, writes));
    if (!writes.length) return payload;
    const results = await Promise.allSettled(writes);
    const rejectedCount = results.filter((result) => result.status === "rejected").length;
    if (rejectedCount && imageStatus instanceof HTMLElement) {
      imageStatus.textContent = "Salvataggio locale: metadati salvati, alcuni asset restano solo in sessione. Esporta pacchetto per sicurezza.";
    }
    return {
      ...payload,
      version: 2,
      assetStorage: "indexeddb",
      assetStatus: rejectedCount ? "partial" : "ok",
      images,
    };
  };
  const prepareGalleryPayloadForLocalStorage = async (payload) => {
    const writes = [];
    const nextGalleries = payload.galleries.map((gallery) => cloneGalleryForLocalStorage(gallery, writes));
    if (!writes.length) return payload;
    const results = await Promise.allSettled(writes);
    return {
      ...payload,
      version: 2,
      assetStorage: "indexeddb",
      assetStatus: results.some((result) => result.status === "rejected") ? "partial" : "ok",
      galleries: nextGalleries,
    };
  };
  const resolveLocalImageAsset = async (value) => {
    if (!isLocalImageAssetReference(value)) return value;
    return readImageAsset(value.slice(localImageAssetPrefix.length));
  };
  const storeInlineImageAssetReference = async (value) => {
    if (!isInlineImageSource(value)) return value;
    const key = imageAssetKeyFor(value);
    runtimeImageAssetCache.set(key, value);
    try {
      await writeImageAsset(key, value);
    } catch (error) {
      console.warn("Asset immagine non scritto in IndexedDB.", error);
    }
    return `${localImageAssetPrefix}${key}`;
  };
  const setBackgroundImageStorageValue = async (value) => {
    if (!value) {
      transientBackgroundImageValue = "";
      tryRemoveStorageValue(bgImageKey, "Sfondo immagine");
      return "";
    }
    const storedValue = await storeInlineImageAssetReference(value);
    if (tryWriteStorageValue(bgImageKey, storedValue, "Sfondo immagine")) {
      transientBackgroundImageValue = "";
    } else {
      transientBackgroundImageValue = storedValue;
    }
    return storedValue;
  };
  const getBackgroundImageStorageValue = () => transientBackgroundImageValue || readStorageValue(bgImageKey, "");
  const imageItemHasLocalAssetReferences = (item) =>
    isLocalImageAssetReference(item?.src) ||
    isLocalImageAssetReference(item?.cutoutOriginalSrc) ||
    (Array.isArray(item?.sprite?.frames) && item.sprite.frames.some((frame) => isLocalImageAssetReference(frame?.src))) ||
    (item?.sprite?.states && typeof item.sprite.states === "object" && Object.values(item.sprite.states).some((frames) =>
      Array.isArray(frames) && frames.some((frame) => isLocalImageAssetReference(frame?.src))
    )) ||
    (Array.isArray(item?.cutoutOriginalSpriteFrames) && item.cutoutOriginalSpriteFrames.some((frame) => isLocalImageAssetReference(frame?.src)));
  const resolveImageItemLocalAssets = async (item) => {
    const clone = JSON.parse(JSON.stringify(item));
    clone.src = await resolveLocalImageAsset(clone.src);
    if (clone.cutoutOriginalSrc) clone.cutoutOriginalSrc = await resolveLocalImageAsset(clone.cutoutOriginalSrc);
    if (Array.isArray(clone.sprite?.frames)) {
      clone.sprite.frames = await Promise.all(clone.sprite.frames.map(async (frame) => ({
        ...frame,
        src: await resolveLocalImageAsset(frame.src),
      })));
      if (!clone.src && clone.sprite.frames[0]?.src) clone.src = clone.sprite.frames[0].src;
    }
    if (clone.sprite?.states && typeof clone.sprite.states === "object") {
      await Promise.all(Object.entries(clone.sprite.states).map(async ([stateId, frames]) => {
        if (!Array.isArray(frames)) return;
        clone.sprite.states[stateId] = await Promise.all(frames.map(async (frame) => ({
          ...frame,
          src: await resolveLocalImageAsset(frame.src),
        })));
      }));
    }
    if (Array.isArray(clone.cutoutOriginalSpriteFrames)) {
      clone.cutoutOriginalSpriteFrames = await Promise.all(clone.cutoutOriginalSpriteFrames.map(async (frame) => ({
        ...frame,
        src: await resolveLocalImageAsset(frame.src),
      })));
    }
    return clone;
  };
  const galleryHasLocalAssetReferences = (gallery) =>
    Array.isArray(gallery?.images) && gallery.images.some((src) => isLocalImageAssetReference(src));
  const resolveGalleryLocalAssets = async (gallery) => {
    const clone = JSON.parse(JSON.stringify(gallery));
    if (Array.isArray(clone.images)) {
      clone.images = await Promise.all(clone.images.map(async (src) => await resolveLocalImageAsset(src)));
    }
    return clone;
  };

  const clamp = (value, minValue, maxValue) => Math.min(Math.max(value, minValue), maxValue);
  const numeric = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const normalizeColor = imageCanvasCore.normalizeColor || ((value, fallback = "#fbfaf7") => {
    const rawValue = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(rawValue)) return rawValue.toLowerCase();
    if (/^#[0-9a-f]{3}$/i.test(rawValue)) {
      return `#${rawValue[1]}${rawValue[1]}${rawValue[2]}${rawValue[2]}${rawValue[3]}${rawValue[3]}`.toLowerCase();
    }
    return fallback;
  });
  const normalizeBackgroundStop = (stop, fallback) => ({
    color: normalizeColor(stop?.color, fallback.color),
    position: clamp(numeric(stop?.position, fallback.position), 0, 100),
  });
  const normalizeCanvasBackground = imageCanvasCore.normalizeCanvasBackground || ((value = {}) => {
    const sourceStops = Array.isArray(value?.gradient?.stops) ? value.gradient.stops : [];
    return {
      baseColor: normalizeColor(value?.baseColor, defaultCanvasBackground.baseColor),
      editorGrid: value?.editorGrid !== false,
      gradient: {
        enabled: value?.gradient?.enabled === true,
        type: gradientTypes.has(String(value?.gradient?.type || "")) ? String(value.gradient.type) : defaultCanvasBackground.gradient.type,
        angle: clamp(numeric(value?.gradient?.angle, defaultCanvasBackground.gradient.angle), 0, 360),
        stops: defaultCanvasBackground.gradient.stops.map((fallback, index) => normalizeBackgroundStop(sourceStops[index], fallback)),
      },
      paper: {
        enabled: value?.paper?.enabled === true,
        strength: clamp(numeric(value?.paper?.strength, defaultCanvasBackground.paper.strength), 0, 100),
        scale: clamp(numeric(value?.paper?.scale, defaultCanvasBackground.paper.scale), 0.5, 4),
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
    return gradient.type === "radial"
      ? `radial-gradient(circle at 50% 46%, ${stops})`
      : `linear-gradient(${gradient.angle}deg, ${stops})`;
  };
  const paperCssLayers = (background) => {
    const strength = clamp(numeric(background?.paper?.strength, 0), 0, 100) / 100;
    const scale = clamp(numeric(background?.paper?.scale, 1), 0.5, 4);
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
  const normalizeSnapSettings = (value) => ({
    enabled: value?.enabled !== false,
    showGrid: value?.showGrid !== false,
    size: clamp(Math.round(numeric(value?.size, defaultSnapSettings.size)), 4, 160),
  });
  const readSnapSettings = () => normalizeSnapSettings(readJson(snapSettingsKey, null));
  const applySnapGridVisual = (settings = readSnapSettings()) => {
    const nextSettings = normalizeSnapSettings(settings);
    document.documentElement.style.setProperty("--editor-snap-size", `${nextSettings.size}px`);
    document.body.classList.toggle("editor-snap-enabled", nextSettings.enabled);
    document.body.classList.toggle("editor-snap-grid-visible", nextSettings.enabled && nextSettings.showGrid);
  };
  const snapNumber = (value, settings = readSnapSettings(), event = null) => {
    const nextSettings = normalizeSnapSettings(settings);
    if (!nextSettings.enabled || event?.altKey) return value;
    return Math.round(value / nextSettings.size) * nextSettings.size;
  };
  const snapClamped = (value, minValue, maxValue, settings = readSnapSettings(), event = null) =>
    clamp(snapNumber(value, settings, event), minValue, maxValue);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")));
      reader.addEventListener("error", () => reject(reader.error || new Error("File non leggibile.")));
      reader.readAsDataURL(file);
    });

  const readCutoutSettings = () => ({
    tolerance: clamp(numeric(cutoutControls.tolerance?.value, 38), 0, 120),
    feather: clamp(Math.round(numeric(cutoutControls.feather?.value, 3)), 0, 32),
    edge: clamp(Math.round(numeric(cutoutControls.edge?.value, 0)), -12, 12),
    crop: cutoutControls.crop?.checked !== false,
    margin: clamp(Math.round(numeric(cutoutControls.margin?.value, 8)), 0, 80),
    smooth: cutoutControls.smooth?.checked !== false,
  });

  const loadCanvasImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error("Immagine non leggibile per lo scontorno.")), { once: true });
    image.src = src;
  });

  const colorDistance = (r, g, b, color) => {
    const dr = r - color.r;
    const dg = g - color.g;
    const db = b - color.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const sampleCheckerColors = (data, width, height) => {
    const buckets = new Map();
    const addPixel = (x, y) => {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      buckets.set(key, bucket);
    };
    const band = clamp(Math.round(Math.min(width, height) * 0.05), 4, 36);
    const step = Math.max(1, Math.floor(Math.min(width, height) / 140));
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (x < band || y < band || x >= width - band || y >= height - band) addPixel(x, y);
      }
    }
    [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]].forEach(([x, y]) => addPixel(x, y));
    return [...buckets.values()]
      .sort((first, second) => second.count - first.count)
      .slice(0, 6)
      .map((bucket) => ({
        r: bucket.r / bucket.count,
        g: bucket.g / bucket.count,
        b: bucket.b / bucket.count,
      }));
  };

  const canvasAlphaBounds = (canvas, margin = 0, alphaThreshold = 8) => {
    const width = canvas.width || 1;
    const height = canvas.height || 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const data = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] <= alphaThreshold) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < minX || maxY < minY) return { x: 0, y: 0, width, height };
    const nextX = clamp(minX - margin, 0, width - 1);
    const nextY = clamp(minY - margin, 0, height - 1);
    const nextMaxX = clamp(maxX + margin, nextX, width - 1);
    const nextMaxY = clamp(maxY + margin, nextY, height - 1);
    return { x: nextX, y: nextY, width: nextMaxX - nextX + 1, height: nextMaxY - nextY + 1 };
  };
  const unionCanvasAlphaBounds = (canvases, margin = 0) => {
    const width = Math.max(...canvases.map((canvas) => canvas.width || 1), 1);
    const height = Math.max(...canvases.map((canvas) => canvas.height || 1), 1);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    canvases.forEach((canvas) => {
      const bounds = canvasAlphaBounds(canvas, 0);
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width - 1);
      maxY = Math.max(maxY, bounds.y + bounds.height - 1);
    });
    if (maxX < minX || maxY < minY) return { x: 0, y: 0, width, height };
    const nextX = clamp(minX - margin, 0, width - 1);
    const nextY = clamp(minY - margin, 0, height - 1);
    const nextMaxX = clamp(maxX + margin, nextX, width - 1);
    const nextMaxY = clamp(maxY + margin, nextY, height - 1);
    return { x: nextX, y: nextY, width: nextMaxX - nextX + 1, height: nextMaxY - nextY + 1 };
  };
  const cropCanvas = (canvas, bounds = null) => {
    const crop = bounds || { x: 0, y: 0, width: canvas.width || 1, height: canvas.height || 1 };
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = Math.max(Math.round(crop.width), 1);
    outputCanvas.height = Math.max(Math.round(crop.height), 1);
    outputCanvas.getContext("2d").drawImage(canvas, crop.x, crop.y, crop.width, crop.height, 0, 0, outputCanvas.width, outputCanvas.height);
    return outputCanvas;
  };
  const placeCanvasOnFrame = (canvas, width, height) => {
    if (canvas.width === width && canvas.height === height) return canvas;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const context = outputCanvas.getContext("2d");
    context.drawImage(canvas, Math.round((width - canvas.width) / 2), Math.round((height - canvas.height) / 2));
    return outputCanvas;
  };
  const createCheckerCutoutCanvas = async (src, settings = readCutoutSettings()) => {
    const image = await loadCanvasImage(src);
    const width = image.naturalWidth || image.width || 1;
    const height = image.naturalHeight || image.height || 1;
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0, width, height);
    const sourceImageData = sourceContext.getImageData(0, 0, width, height);
    const sourceData = sourceImageData.data;
    const colors = sampleCheckerColors(sourceData, width, height);
    if (!colors.length) return sourceCanvas;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskContext = maskCanvas.getContext("2d");
    const maskImageData = maskContext.createImageData(width, height);
    const maskData = maskImageData.data;
    const threshold = clamp(settings.tolerance - settings.edge * 4, 0, 180);
    const softness = settings.smooth ? Math.max(1, 18 + settings.feather * 1.5) : 1;
    for (let index = 0; index < sourceData.length; index += 4) {
      const nearest = Math.min(...colors.map((color) => colorDistance(sourceData[index], sourceData[index + 1], sourceData[index + 2], color)));
      const alpha = clamp((nearest - threshold) / softness, 0, 1) * 255;
      maskData[index] = 255;
      maskData[index + 1] = 255;
      maskData[index + 2] = 255;
      maskData[index + 3] = alpha;
    }
    maskContext.putImageData(maskImageData, 0, 0);

    const finalMask = document.createElement("canvas");
    finalMask.width = width;
    finalMask.height = height;
    const finalMaskContext = finalMask.getContext("2d");
    if (settings.feather > 0) finalMaskContext.filter = `blur(${settings.feather}px)`;
    finalMaskContext.drawImage(maskCanvas, 0, 0);

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputContext = outputCanvas.getContext("2d");
    outputContext.drawImage(sourceCanvas, 0, 0);
    outputContext.globalCompositeOperation = "destination-in";
    outputContext.drawImage(finalMask, 0, 0);
    return outputCanvas;
  };
  const createCheckerCutout = async (src, settings = readCutoutSettings()) => {
    const outputCanvas = await createCheckerCutoutCanvas(src, settings);
    const finalCanvas = settings.crop ? cropCanvas(outputCanvas, canvasAlphaBounds(outputCanvas, settings.margin)) : outputCanvas;
    return {
      src: finalCanvas.toDataURL("image/png"),
      crop: settings.crop ? canvasAlphaBounds(outputCanvas, settings.margin) : { x: 0, y: 0, width: outputCanvas.width, height: outputCanvas.height },
      sourceWidth: outputCanvas.width,
      sourceHeight: outputCanvas.height,
      width: finalCanvas.width,
      height: finalCanvas.height,
    };
  };
  const createSpriteCutoutFrames = async (frames, settings = readCutoutSettings()) => {
    const canvases = [];
    for (const frame of frames) canvases.push(await createCheckerCutoutCanvas(frame.src, settings));
    const frameWidth = Math.max(...canvases.map((canvas) => canvas.width || 1), 1);
    const frameHeight = Math.max(...canvases.map((canvas) => canvas.height || 1), 1);
    const normalizedCanvases = canvases.map((canvas) => placeCanvasOnFrame(canvas, frameWidth, frameHeight));
    const bounds = settings.crop ? unionCanvasAlphaBounds(normalizedCanvases, settings.margin) : { x: 0, y: 0, width: frameWidth, height: frameHeight };
    return {
      frames: normalizedCanvases.map((canvas, index) => ({
        ...frames[index],
        src: cropCanvas(canvas, bounds).toDataURL("image/png"),
      })),
      crop: bounds,
      sourceWidth: frameWidth,
      sourceHeight: frameHeight,
      width: bounds.width,
      height: bounds.height,
    };
  };

  const acceptedImageFile = (file) => {
    const fileName = String(file.name || "").toLowerCase();
    return file.type.startsWith("image/") || fileName.endsWith(".heic") || fileName.endsWith(".heif");
  };

  const uploadGalleryFiles = async (files) => {
    const acceptedFiles = files.filter(acceptedImageFile);
    if (!acceptedFiles.length) return [];
    const payloadFiles = [];
    for (const file of acceptedFiles) {
      payloadFiles.push({
        name: file.name || `${namespace}-gallery-${Date.now()}`,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: await readFileAsDataUrl(file),
      });
    }
    const response = await fetch("/api/editor-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files: payloadFiles }),
    });
    if (!response.ok) throw new Error(`Upload non riuscito (${response.status}).`);
    const result = await response.json();
    if (Array.isArray(result.errors) && result.errors.length) {
      alert(`Alcune immagini non sono state caricate:\n${result.errors.join("\n")}`);
    }
    return Array.isArray(result.files) ? result.files.map((file) => file.url).filter(Boolean) : [];
  };

  const getSettings = () => readJson(settingsKey, {});
  const setSettings = (patch) => tryWriteJson(settingsKey, { ...getSettings(), ...patch }, "Impostazioni editor");
  const normalizeHoverEffect = imageCanvasCore.normalizeHoverEffect || ((value, fallback = "none") =>
    allowedHoverEffects.has(String(value || "")) ? String(value) : fallback);
  const normalizeClickEffect = (value, fallback = "none") => {
    const nextValue = String(value || "");
    if (nextValue === "lightbox") return "open-link";
    if (imageCanvasCore.normalizeClickEffect) return imageCanvasCore.normalizeClickEffect(nextValue, fallback);
    return allowedClickEffects.has(nextValue) ? nextValue : fallback;
  };
  const normalizeImageLink = imageCanvasCore.normalizeLink || ((value) => String(value ?? "").trim());
  const normalizeOpacity = imageCanvasCore.normalizeOpacity || ((value, fallback = 1) => clamp(numeric(value, fallback), 0, 1));
  const normalizeBlendMode = imageCanvasCore.normalizeBlendMode || ((value, fallback = "normal") =>
    allowedBlendModes.has(String(value || "")) ? String(value) : fallback);
  const normalizeMotionPreset = imageCanvasCore.normalizeMotionPreset || ((value, fallback = "none") =>
    allowedMotionPresets.has(String(value || "")) ? String(value) : fallback);
  const normalizeImageMotion = (value) => {
    const preset = normalizeMotionPreset(value?.enabled === false ? "none" : value?.preset, "none");
    return {
      preset,
      speed: clamp(numeric(value?.speed, 1), 0.1, 4),
      distance: clamp(Math.round(numeric(value?.distance, 40)), 0, 320),
    };
  };
  const motionIsActive = (motion) => {
    const normalizedMotion = normalizeImageMotion(motion);
    return normalizedMotion.preset !== "none" && normalizedMotion.speed > 0 && normalizedMotion.distance > 0;
  };
  const formatMotionSpeed = (value) => {
    const speed = clamp(numeric(value, 1), 0.1, 4);
    return `${speed.toFixed(1).replace(/\.0$/, "")}x`;
  };
  const normalizeImageParallax = (value) => ({
    enabled: value?.enabled === true,
    depth: clamp(numeric(value?.depth, 1), 0, 2.5),
  });
  const parallaxIsActive = (parallax) => {
    const normalizedParallax = normalizeImageParallax(parallax);
    return normalizedParallax.enabled && normalizedParallax.depth > 0;
  };
  const formatParallaxDepth = (value) => {
    const depth = clamp(numeric(value, 1), 0, 2.5);
    return `${depth.toFixed(1).replace(/\.0$/, "")}x`;
  };
  const normalizePublicDrag = (value) => ({
    enabled: value?.enabled === true,
    inertia: clamp(numeric(value?.inertia, 0.88), 0, 0.98),
  });
  const publicDragIsActive = (item) => {
    const publicDrag = normalizePublicDrag(item?.publicDrag);
    return publicDrag.enabled && item?.locked !== true && item?.hidden !== true;
  };
  const formatPublicDragInertia = (value) => `${Math.round(clamp(numeric(value, 0.88), 0, 0.98) * 100)}%`;
  const normalizeGameAsset = (value) => {
    const role = allowedGameRoles.has(String(value?.role || "")) ? String(value.role) : "web";
    const isPlayer = value?.player === true || role === "player";
    return {
      role: isPlayer ? "player" : role,
      player: isPlayer,
      speed: clamp(numeric(value?.speed, 180), 40, 640),
      depthSort: value?.depthSort === true,
      autoFlip: value?.autoFlip === true,
    };
  };
  const formatGameSpeed = (value) => `${Math.round(clamp(numeric(value, 180), 40, 640))}px/s`;
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
  const formatKeyboardKey = (value) => {
    const key = normalizeKeyboardKey(value);
    const labels = {
      arrowup: "↑",
      arrowdown: "↓",
      arrowleft: "←",
      arrowright: "→",
      escape: "Esc",
      enter: "Enter",
      backspace: "Backspace",
      space: "Space",
      tab: "Tab",
      shift: "Shift",
      alt: "Alt",
      control: "Ctrl",
      meta: "Meta",
    };
    return labels[key] || (key.length === 1 ? key.toUpperCase() : key.replace(/\b\w/g, (letter) => letter.toUpperCase()));
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
    x: Math.round(numeric(point?.x)),
    y: Math.round(numeric(point?.y)),
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
  const normalizeGameRoom = (value) => {
    return {
      walkArea: normalizeGameWalkArea(value?.walkArea),
      spawn: normalizeGameSpawn(value?.spawn),
      input: normalizeGameInputSettings(value?.input),
    };
  };
  const normalizeLayerTrigger = imageCanvasCore.normalizeLayerTrigger || ((value) => {
    const mode = allowedLayerTriggerModes.has(String(value?.mode || "")) ? String(value.mode) : "immediate";
    const action = allowedLayerTriggerActions.has(String(value?.action || "")) ? String(value.action) : "show";
    return {
      action,
      mode,
      delay: clamp(numeric(value?.delay, 0), 0, 30),
      key: String(value?.key || "Space").trim() || "Space",
      targetId: String(value?.targetId || "").trim(),
    };
  });
  const formatTriggerDelay = (value) => `${clamp(numeric(value, 0), 0, 30).toFixed(1).replace(/\.0$/, "")}s`;
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
      fps: clamp(numeric(value?.fps, 8), 1, 30),
      loop: value?.loop !== false,
      mode: allowedSpriteModes.has(String(value?.mode || "")) ? String(value.mode) : "forward",
      playing: value?.playing !== false,
      frameIndex: clamp(Math.round(numeric(value?.frameIndex, 0)), 0, Math.max(frames.length - 1, 0)),
      anchor: String(value?.anchor || "bottom-center"),
      syncMotion: value?.syncMotion === true,
      directional: {
        enabled: value?.directional?.enabled === true,
        state: selectedState,
      },
      onion: {
        enabled: value?.onion?.enabled === true,
        opacity: clamp(numeric(value?.onion?.opacity, 0.35), 0.05, 0.8),
      },
    };
  };
  const spriteStateFrameCount = (sprite) =>
    Object.values(sprite.states || {}).reduce((count, frames) => count + (Array.isArray(frames) ? frames.length : 0), 0);
  const spriteIsEnabled = (item) => {
    const sprite = normalizeSprite(item?.sprite, item?.src);
    return sprite.enabled && sprite.frames.length > 0;
  };
  const spriteIsAnimating = (item) => {
    const sprite = normalizeSprite(item?.sprite, item?.src);
    const directionalRuntime = gamePreviewEnabled && normalizeGameAsset(item?.game).player && sprite.directional.enabled && spriteStateFrameCount(sprite) > 0;
    const availableFrames = Math.max(sprite.frames.length, ...Object.values(sprite.states || {}).map((frames) => Array.isArray(frames) ? frames.length : 0));
    return sprite.enabled && layerAnimationAllowed(item) && (directionalRuntime || sprite.syncMotion || sprite.playing) && availableFrames > 1 && sprite.fps > 0;
  };
  const normalizePathPoint = (point) => ({
    x: numeric(point?.x, 0),
    y: numeric(point?.y, 0),
  });
  const normalizePathMotion = (value) => ({
    enabled: value?.enabled === true,
    duration: clamp(numeric(value?.duration, 6), 1, 30),
    points: Array.isArray(value?.points) ? value.points.map(normalizePathPoint).slice(0, 12) : [],
  });
  const pathMotionIsActive = (item) => {
    const pathMotion = normalizePathMotion(item?.pathMotion);
    return pathMotion.enabled && pathMotion.duration > 0 && pathMotion.points.length >= 2;
  };
  const formatPathDuration = (value) => `${clamp(numeric(value, 6), 1, 30).toFixed(1).replace(/\.0$/, "")}s`;
  const normalizeImageTrim = (value) => {
    const naturalWidth = numeric(value?.naturalWidth, 0);
    const naturalHeight = numeric(value?.naturalHeight, 0);
    const width = numeric(value?.width, 0);
    const height = numeric(value?.height, 0);
    if (naturalWidth <= 0 || naturalHeight <= 0 || width <= 0 || height <= 0) return null;
    return {
      naturalWidth,
      naturalHeight,
      x: clamp(numeric(value?.x, 0), 0, naturalWidth),
      y: clamp(numeric(value?.y, 0), 0, naturalHeight),
      width: clamp(width, 1, naturalWidth),
      height: clamp(height, 1, naturalHeight),
    };
  };
  const getImageTrim = (item) => {
    const trim = normalizeImageTrim(item?.trim);
    if (trim) return trim;
    const naturalWidth = Math.max(numeric(item?.naturalWidth, numeric(item?.width, 320)), 1);
    const naturalHeight = Math.max(numeric(item?.naturalHeight, naturalWidth * 0.75), 1);
    return { naturalWidth, naturalHeight, x: 0, y: 0, width: naturalWidth, height: naturalHeight };
  };
  const trimEquals = (first, second) => {
    const a = normalizeImageTrim(first);
    const b = normalizeImageTrim(second);
    if (!a || !b) return false;
    return ["naturalWidth", "naturalHeight", "x", "y", "width", "height"].every((key) => Math.round(a[key]) === Math.round(b[key]));
  };
  const resolveImageLink = (value) => {
    const rawLink = normalizeImageLink(value);
    if (!rawLink) return "";
    if (rawLink.startsWith("#")) return `${window.location.pathname}${rawLink}`;
    if (/^[a-z][a-z0-9+.-]*:/i.test(rawLink)) return rawLink;
    const path = rawLink.startsWith("/") ? rawLink : `/${rawLink.replace(/^\/+/, "")}`;
    return new URL(path, window.location.origin).href;
  };

  const normalizeImageBox = (item) => ({
    ...item,
    width: numeric(item?.width, numeric(item?.w, 320)),
    rotation: numeric(item?.rotation, numeric(item?.rotate, 0)),
    hoverEffect: normalizeHoverEffect(item?.hoverEffect, "none"),
    clickEffect: normalizeClickEffect(item?.clickEffect, "none"),
    linkUrl: normalizeImageLink(item?.linkUrl),
    opacity: normalizeOpacity(item?.opacity, 1),
    blendMode: normalizeBlendMode(item?.blendMode, "normal"),
    motion: normalizeImageMotion(item?.motion),
    parallax: normalizeImageParallax(item?.parallax),
    publicDrag: normalizePublicDrag(item?.publicDrag),
    game: normalizeGameAsset(item?.game),
    trigger: normalizeLayerTrigger(item?.trigger),
    sprite: normalizeSprite(item?.sprite, item?.src),
    pathMotion: normalizePathMotion(item?.pathMotion),
    naturalWidth: numeric(item?.naturalWidth, numeric(item?.trim?.naturalWidth, 0)),
    naturalHeight: numeric(item?.naturalHeight, numeric(item?.trim?.naturalHeight, 0)),
    trim: normalizeImageTrim(item?.trim),
    hidden: item?.hidden === true || item?.visible === false,
    locked: Boolean(item?.locked),
  });

  const normalizeGallery = (item) => ({
    ...item,
    width: numeric(item?.width, numeric(item?.w, 620)),
    rotation: numeric(item?.rotation, numeric(item?.rotate, 0)),
    images: Array.isArray(item?.images) ? item.images : [],
  });

  const normalizeRemovedIds = (value) =>
    Array.isArray(value)
      ? value.filter((item, index, items) => typeof item === "string" && item && items.indexOf(item) === index)
      : [];

  const loadImageBoxes = () => {
    const stored = readJson(imageBoxesKey, null);
    if (Array.isArray(stored)) return { images: stored.map(normalizeImageBox), removedIds: [] };
    if (stored && typeof stored === "object" && Array.isArray(stored.images)) {
      const removedIds = normalizeRemovedIds(stored.removedIds);
      return {
        images: stored.images.map(normalizeImageBox).filter((item) => !removedIds.includes(item.id)),
        removedIds,
      };
    }
    return { images: [], removedIds: [] };
  };

  const loadGalleries = () => {
    const stored = readJson(galleriesKey, null);
    if (Array.isArray(stored)) return { galleries: stored.map(normalizeGallery), removedIds: [] };
    if (stored && typeof stored === "object" && Array.isArray(stored.galleries)) {
      const removedIds = normalizeRemovedIds(stored.removedIds);
      return {
        galleries: stored.galleries.map(normalizeGallery).filter((item) => !removedIds.includes(item.id)),
        removedIds,
      };
    }
    return { galleries: [], removedIds: [] };
  };

  const setRangeValue = (name, value, suffix = "") => {
    root.querySelectorAll(`[data-uccelli-gallery-value="${name}"], [data-uccelli-image-value="${name}"]`).forEach((element) => {
      element.textContent = `${value}${suffix}`;
    });
  };

  const updateTriggerTargetOptions = (activeId = "") => {
    const select = layerTriggerControls.target;
    if (!(select instanceof HTMLSelectElement)) return;
    const currentValue = select.value;
    select.innerHTML = '<option value="">Nessun layer</option>';
    imageBoxes.forEach((item, index) => {
      if (item.id === activeId) return;
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `Immagine ${index + 1}`;
      select.append(option);
    });
    select.value = Array.from(select.options).some((option) => option.value === currentValue) ? currentValue : "";
  };

  const normalizeLayerTriggerForEditor = (trigger) => {
    const nextTrigger = normalizeLayerTrigger(trigger);
    if (nextTrigger.action === "show" && nextTrigger.mode === "click") {
      nextTrigger.mode = "delay";
      nextTrigger.delay = Math.max(nextTrigger.delay, 0);
    }
    return nextTrigger;
  };

  const syncLayerTriggerControlsAvailability = () => {
    const actionControl = layerTriggerControls.action;
    const modeControl = layerTriggerControls.mode;
    const hint = layerTriggerControls.hint;
    const action = actionControl instanceof HTMLSelectElement ? actionControl.value : "show";
    if (modeControl instanceof HTMLSelectElement) {
      const clickOption = Array.from(modeControl.options).find((option) => option.value === "click");
      if (clickOption) {
        clickOption.disabled = action === "show";
        clickOption.textContent = action === "show" ? "Click sul layer (non valido)" : "Click sul layer";
      }
      if (action === "show" && modeControl.value === "click") modeControl.value = "delay";
    }
    if (hint instanceof HTMLElement) {
      hint.textContent = action === "show"
        ? "Per mostrare un layer nascosto usa tempo, tasto o dopo layer."
        : "Il click sul layer puo avviare sprite, percorso o animazioni senza nasconderlo.";
    }
  };

  const updateCameraReadout = () => {
    root.querySelectorAll('[data-uccelli-camera-value="x"]').forEach((element) => {
      element.textContent = String(Math.round(parallaxCamera.x));
    });
    root.querySelectorAll('[data-uccelli-camera-value="y"]').forEach((element) => {
      element.textContent = String(Math.round(parallaxCamera.y));
    });
  };

  const getSpriteFramesForState = (sprite, stateId = "base") => {
    if (stateId === "base") return sprite.frames;
    return Array.isArray(sprite.states?.[stateId]) ? sprite.states[stateId] : [];
  };

  const getSpriteEditorStateId = (sprite) =>
    sprite.directional.enabled && spriteDirectionStateIds.has(sprite.directional.state)
      ? sprite.directional.state
      : "base";

  const getSpriteEditorFrames = (sprite) => getSpriteFramesForState(sprite, getSpriteEditorStateId(sprite));

  const getSpriteDirectionStatusText = (sprite) => {
    const selectedState = sprite.directional.state;
    const selectedCount = getSpriteFramesForState(sprite, selectedState).length;
    const filledStates = Object.entries(sprite.states || {})
      .filter(([, frames]) => Array.isArray(frames) && frames.length)
      .map(([stateId, frames]) => `${stateId} ${frames.length}`);
    const prefix = sprite.directional.enabled ? "Direzionale attivo" : "Direzionale spento";
    return `${prefix}. Stato ${selectedState}: ${selectedCount || 0} frame${filledStates.length ? ` · ${filledStates.join(" · ")}` : ""}.`;
  };

  const renderSpriteStrip = (item) => {
    if (!(spriteControls.strip instanceof HTMLElement)) return;
    spriteControls.strip.innerHTML = "";
    const sprite = normalizeSprite(item?.sprite, item?.src);
    if (!item || !sprite.enabled) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "uccelli-layers-item__meta";
      emptyMessage.textContent = "Seleziona uno sprite.";
      spriteControls.strip.append(emptyMessage);
      return;
    }
    const stateId = getSpriteEditorStateId(sprite);
    const frames = getSpriteEditorFrames(sprite);
    if (!frames.length) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "uccelli-layers-item__meta";
      emptyMessage.textContent = `Stato ${stateId} vuoto. Importa frame o usa la timeline base.`;
      spriteControls.strip.append(emptyMessage);
      return;
    }
    frames.forEach((frame, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "image-board-sprite-frame-button";
      button.classList.toggle("is-active", index === sprite.frameIndex);
      button.title = `${index + 1}. ${frame.name}`;
      button.setAttribute("aria-label", `Frame ${index + 1}`);
      const image = document.createElement("img");
      image.src = renderableImageSource(frame.src);
      image.alt = "";
      image.draggable = false;
      button.append(image);
      button.addEventListener("click", () => {
        updateSelectedImages((layer) => {
          if (layer.id !== item.id || !spriteIsEnabled(layer)) return;
          const nextSprite = normalizeSprite(layer.sprite, layer.src);
          layer.sprite = { ...nextSprite, playing: false, frameIndex: index };
        });
        resetSpriteRuntime(item.id);
        syncSpriteLoop();
      });
      spriteControls.strip.append(button);
    });
  };

  const applyCanvasBackground = () => {
    const backgroundCss = buildCanvasBackgroundCss(canvasBackground, { includeGrid: !publicMode && !gamePreviewEnabled });
    root.style.setProperty("--image-board-canvas-bg-layers", backgroundCss.background);
    root.style.setProperty("--image-board-canvas-bg-size", backgroundCss.size);
  };

  const syncCanvasBackgroundControls = () => {
    const background = normalizeCanvasBackground(canvasBackground);
    if (backgroundControls.base instanceof HTMLInputElement) backgroundControls.base.value = background.baseColor;
    if (backgroundControls.editorGrid instanceof HTMLInputElement) backgroundControls.editorGrid.checked = background.editorGrid;
    if (backgroundControls.gradientEnabled instanceof HTMLInputElement) backgroundControls.gradientEnabled.checked = background.gradient.enabled;
    if (backgroundControls.gradientType instanceof HTMLSelectElement) backgroundControls.gradientType.value = background.gradient.type;
    if (backgroundControls.gradientAngle instanceof HTMLInputElement) backgroundControls.gradientAngle.value = String(background.gradient.angle);
    if (backgroundControls.paperEnabled instanceof HTMLInputElement) backgroundControls.paperEnabled.checked = background.paper.enabled;
    if (backgroundControls.paperStrength instanceof HTMLInputElement) backgroundControls.paperStrength.value = String(background.paper.strength);
    if (backgroundControls.paperScale instanceof HTMLInputElement) backgroundControls.paperScale.value = String(background.paper.scale);
    root.querySelectorAll('[data-uccelli-bg-value="angle"]').forEach((output) => {
      output.textContent = `${Math.round(background.gradient.angle)}°`;
    });
    root.querySelectorAll('[data-uccelli-bg-value="paperStrength"]').forEach((output) => {
      output.textContent = `${Math.round(background.paper.strength)}%`;
    });
    root.querySelectorAll('[data-uccelli-bg-value="paperScale"]').forEach((output) => {
      output.textContent = `${background.paper.scale.toFixed(1).replace(/\.0$/, "")}x`;
    });
    background.gradient.stops.forEach((stop, index) => {
      const colorInput = backgroundControls.stopColors[index];
      const positionInput = backgroundControls.stopPositions[index];
      const output = backgroundControls.stopValues[index];
      if (colorInput instanceof HTMLInputElement) colorInput.value = stop.color;
      if (positionInput instanceof HTMLInputElement) positionInput.value = String(stop.position);
      if (output instanceof HTMLOutputElement) output.textContent = `${Math.round(stop.position)}%`;
    });
    const gradientDisabled = !background.gradient.enabled;
    [backgroundControls.gradientType, backgroundControls.gradientAngle, ...backgroundControls.stopColors, ...backgroundControls.stopPositions].forEach((control) => {
      if (control instanceof HTMLInputElement || control instanceof HTMLSelectElement) control.disabled = gradientDisabled;
    });
    const paperDisabled = !background.paper.enabled;
    [backgroundControls.paperStrength, backgroundControls.paperScale].forEach((control) => {
      if (control instanceof HTMLInputElement) control.disabled = paperDisabled;
    });
  };

  const persistCanvasBackground = () => {
    canvasBackground = normalizeCanvasBackground(canvasBackground);
    tryWriteJson(canvasBackgroundKey, canvasBackground, "Sfondo canvas");
  };

  const updateCanvasBackground = (updater) => {
    const nextBackground = normalizeCanvasBackground(canvasBackground);
    updater(nextBackground);
    canvasBackground = normalizeCanvasBackground(nextBackground);
    applyCanvasBackground();
    syncCanvasBackgroundControls();
    persistCanvasBackground();
  };

  const applyDemoBackground = () => {
    canvasBackground = normalizeCanvasBackground({
      baseColor: "#fbfaf7",
      editorGrid: true,
      gradient: {
        enabled: true,
        type: "linear",
        angle: 132,
        stops: [
          { color: "#fbfaf7", position: 0 },
          { color: "#f6e6a8", position: 46 },
          { color: "#b9c7ef", position: 100 },
        ],
      },
      paper: {
        enabled: true,
        strength: 42,
        scale: 1.2,
      },
    });
    applyCanvasBackground();
    syncCanvasBackgroundControls();
    persistCanvasBackground();
  };

  const updateMenuActionState = ({ hasActiveImage = false, hasActiveSprite = false } = {}) => {
    menuActionButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const requiresImage = button.hasAttribute("data-requires-image");
      const requiresSprite = button.hasAttribute("data-requires-sprite");
      button.disabled = (requiresImage && !hasActiveImage) || (requiresSprite && !hasActiveSprite);
    });
  };

  const setContextualBadge = (name, value = "") => {
    const badge = contextualMenuBadges[name];
    if (!(badge instanceof HTMLElement)) return;
    const text = String(value || "").trim();
    badge.textContent = text;
    badge.hidden = !text;
  };

  const updateContextualMenus = ({ hasActiveImage = false, hasActiveSprite = false, activeSprite = null, activeGame = null } = {}) => {
    const game = activeGame || normalizeGameAsset(null);
    const isPlayer = hasActiveImage && game.player;
    const isObstacle = hasActiveImage && game.role === "obstacle";
    const isGameRole = hasActiveImage && game.role !== "web";
    root.classList.toggle("has-active-sprite", hasActiveSprite);
    root.classList.toggle("has-game-player-selection", isPlayer);
    root.classList.toggle("has-game-obstacle-selection", isObstacle);
    root.classList.toggle("has-game-role-selection", isGameRole);
    contextualMenus.sprite?.classList.toggle("is-context-active", hasActiveSprite);
    contextualMenus.game?.classList.toggle("is-context-active", isGameRole);

    if (hasActiveSprite && activeSprite) {
      const totalFrames = activeSprite.frames.length + spriteStateFrameCount(activeSprite);
      const frameText = `${totalFrames || activeSprite.frames.length} frame`;
      const directionText = activeSprite.directional.enabled ? "direzionale" : "";
      setContextualBadge("sprite", directionText || frameText);
      if (contextualMenuTitles.sprite instanceof HTMLElement) contextualMenuTitles.sprite.textContent = `Sprite ${frameText}`;
    } else {
      setContextualBadge("sprite", "");
      if (contextualMenuTitles.sprite instanceof HTMLElement) contextualMenuTitles.sprite.textContent = "Sprite selezionato";
    }

    if (isPlayer) setContextualBadge("game", "Player");
    else if (isObstacle) setContextualBadge("game", "Ostacolo");
    else if (isGameRole) setContextualBadge("game", game.role);
    else setContextualBadge("game", "");
  };

  const updateImageToolState = () => {
    const selectedImages = getSelectedImages();
    const activeImage =
      activeItem?.type === "image"
        ? imageBoxes.find((item) => item.id === activeItem.id) || selectedImages[0] || null
        : selectedImages[0] || null;
    const hasActiveImage = selectedImages.length > 0;
    const activeSprite = activeImage ? normalizeSprite(activeImage.sprite, activeImage.src) : null;
    const hasActiveSprite = Boolean(activeImage && activeSprite?.enabled);
    const activeGame = activeImage ? normalizeGameAsset(activeImage.game) : normalizeGameAsset(null);
    updateMenuActionState({ hasActiveImage, hasActiveSprite });
    updateContextualMenus({ hasActiveImage, hasActiveSprite, activeSprite, activeGame });
    if (commandPaletteOpen) renderCommandPalette();
    [
      imageClearButton,
      imageLayerDownButton,
      imageLayerUpButton,
      imageLayerBottomButton,
      imageLayerTopButton,
      imageHoverEffectInput,
      imageClickEffectInput,
      imageMotionPresetInput,
      imageMotionSpeedInput,
      imageMotionDistanceInput,
      imageParallaxEnabledInput,
      imageParallaxDepthInput,
      imagePublicDragEnabledInput,
      imagePublicDragInertiaInput,
      ...Object.values(layerTriggerControls),
      imagePathEnabledInput,
      imagePathDurationInput,
      imagePathAddPointButton,
      imagePathToggleButton,
      imagePathClearButton,
      imageLinkInput,
      imageLinkPresetInput,
      imageOpacityInput,
      imageBlendInput,
      imageVisibilityButton,
      imageLockButton,
      imageZInput,
    ].forEach((control) => {
      if (
        control instanceof HTMLButtonElement ||
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement
      ) control.disabled = !hasActiveImage;
    });
    Object.values(spriteControls).forEach((control) => {
      if (
        control instanceof HTMLButtonElement ||
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement
      ) control.disabled = !hasActiveSprite;
    });
    Object.values(cutoutControls).forEach((control) => {
      if (
        control instanceof HTMLButtonElement ||
        control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement
      ) control.disabled = !hasActiveImage;
    });
    if (!hasActiveImage) {
      if (imageLinkInput instanceof HTMLInputElement) imageLinkInput.value = "";
      if (imageLinkPresetInput instanceof HTMLSelectElement) imageLinkPresetInput.value = "";
      if (imageOpacityInput instanceof HTMLInputElement) imageOpacityInput.value = "100";
      if (imageBlendInput instanceof HTMLSelectElement) imageBlendInput.value = "normal";
      if (imageMotionPresetInput instanceof HTMLSelectElement) imageMotionPresetInput.value = "none";
      if (imageMotionSpeedInput instanceof HTMLInputElement) imageMotionSpeedInput.value = "1";
      if (imageMotionDistanceInput instanceof HTMLInputElement) imageMotionDistanceInput.value = "40";
      if (imageParallaxEnabledInput instanceof HTMLInputElement) imageParallaxEnabledInput.checked = false;
      if (imageParallaxDepthInput instanceof HTMLInputElement) imageParallaxDepthInput.value = "1";
      if (imagePublicDragEnabledInput instanceof HTMLInputElement) imagePublicDragEnabledInput.checked = false;
      if (imagePublicDragInertiaInput instanceof HTMLInputElement) imagePublicDragInertiaInput.value = "0.88";
      if (layerTriggerControls.action instanceof HTMLSelectElement) layerTriggerControls.action.value = "show";
      if (layerTriggerControls.mode instanceof HTMLSelectElement) layerTriggerControls.mode.value = "immediate";
      if (layerTriggerControls.delay instanceof HTMLInputElement) layerTriggerControls.delay.value = "0";
      if (layerTriggerControls.key instanceof HTMLInputElement) layerTriggerControls.key.value = "Space";
      updateTriggerTargetOptions();
      if (imagePathEnabledInput instanceof HTMLInputElement) imagePathEnabledInput.checked = false;
      if (imagePathDurationInput instanceof HTMLInputElement) imagePathDurationInput.value = "6";
      if (imagePathToggleButton instanceof HTMLButtonElement) imagePathToggleButton.textContent = "Play";
      if (spriteControls.play instanceof HTMLButtonElement) spriteControls.play.textContent = "Play";
      if (spriteControls.fps instanceof HTMLInputElement) spriteControls.fps.value = "8";
      if (spriteControls.loop instanceof HTMLInputElement) spriteControls.loop.checked = true;
      if (spriteControls.mode instanceof HTMLSelectElement) spriteControls.mode.value = "forward";
      if (spriteControls.syncMotion instanceof HTMLInputElement) spriteControls.syncMotion.checked = false;
      if (spriteControls.directionalEnabled instanceof HTMLInputElement) spriteControls.directionalEnabled.checked = false;
      if (spriteControls.directionState instanceof HTMLSelectElement) spriteControls.directionState.value = "idle-down";
      if (spriteControls.directionStatus instanceof HTMLElement) {
        spriteControls.directionStatus.textContent = "In preview gioco, il player usa walk-up/down/left/right mentre si muove e idle-down quando si ferma.";
      }
      if (spriteControls.onionEnabled instanceof HTMLInputElement) spriteControls.onionEnabled.checked = false;
      if (spriteControls.onionOpacity instanceof HTMLInputElement) spriteControls.onionOpacity.value = "35";
      if (spriteControls.frame instanceof HTMLInputElement) {
        spriteControls.frame.max = "0";
        spriteControls.frame.value = "0";
      }
      if (gameControls.role instanceof HTMLSelectElement) gameControls.role.value = "web";
      if (gameControls.player instanceof HTMLInputElement) gameControls.player.checked = false;
      if (gameControls.depthSort instanceof HTMLInputElement) gameControls.depthSort.checked = false;
      if (gameControls.autoFlip instanceof HTMLInputElement) gameControls.autoFlip.checked = false;
      if (gameControls.speed instanceof HTMLInputElement) gameControls.speed.value = "180";
      setRangeValue("z", 20);
      setRangeValue("opacity", 100, "%");
      setRangeValue("motionSpeed", "1", "x");
      setRangeValue("motionDistance", 40, "px");
      setRangeValue("parallaxDepth", "1", "x");
      setRangeValue("publicDragInertia", 88, "%");
      setRangeValue("pathDuration", "6", "s");
      setRangeValue("pathPoints", 0, " punti");
      setRangeValue("spriteFps", 8);
      setRangeValue("spriteFrame", "1/1");
      setRangeValue("spriteOnionOpacity", 35, "%");
      setRangeValue("gameSpeed", "180", "px/s");
      setRangeValue("triggerDelay", "0", "s");
      setRangeValue("cutoutTolerance", 38);
      setRangeValue("cutoutFeather", 3, "px");
      setRangeValue("cutoutEdge", 0, "px");
      setRangeValue("cutoutMargin", 8, "px");
      renderSpriteStrip(null);
    } else {
      const activeMotion = normalizeImageMotion(activeImage.motion);
      const activeParallax = normalizeImageParallax(activeImage.parallax);
      const activePublicDrag = normalizePublicDrag(activeImage.publicDrag);
      const activePath = normalizePathMotion(activeImage.pathMotion);
      const activeTrigger = normalizeLayerTrigger(activeImage.trigger);
      const activeGame = normalizeGameAsset(activeImage.game);
      if (imageParallaxEnabledInput instanceof HTMLInputElement) imageParallaxEnabledInput.checked = activeParallax.enabled;
      if (imageParallaxDepthInput instanceof HTMLInputElement) imageParallaxDepthInput.value = String(activeParallax.depth);
      if (imagePublicDragEnabledInput instanceof HTMLInputElement) imagePublicDragEnabledInput.checked = activePublicDrag.enabled;
      if (imagePublicDragInertiaInput instanceof HTMLInputElement) imagePublicDragInertiaInput.value = String(activePublicDrag.inertia);
      if (layerTriggerControls.action instanceof HTMLSelectElement) layerTriggerControls.action.value = activeTrigger.action;
      if (layerTriggerControls.mode instanceof HTMLSelectElement) layerTriggerControls.mode.value = activeTrigger.mode;
      if (layerTriggerControls.delay instanceof HTMLInputElement) layerTriggerControls.delay.value = String(activeTrigger.delay);
      if (layerTriggerControls.key instanceof HTMLInputElement) layerTriggerControls.key.value = activeTrigger.key;
      updateTriggerTargetOptions(activeImage.id);
      if (layerTriggerControls.target instanceof HTMLSelectElement) layerTriggerControls.target.value = Array.from(layerTriggerControls.target.options).some((option) => option.value === activeTrigger.targetId) ? activeTrigger.targetId : "";
      if (imagePathEnabledInput instanceof HTMLInputElement) imagePathEnabledInput.checked = activePath.enabled;
      if (imagePathDurationInput instanceof HTMLInputElement) imagePathDurationInput.value = String(activePath.duration);
      if (imagePathToggleButton instanceof HTMLButtonElement) imagePathToggleButton.textContent = activePath.enabled ? "Pausa" : "Play";
      if (gameControls.role instanceof HTMLSelectElement) gameControls.role.value = activeGame.role;
      if (gameControls.player instanceof HTMLInputElement) gameControls.player.checked = activeGame.player;
      if (gameControls.depthSort instanceof HTMLInputElement) gameControls.depthSort.checked = activeGame.depthSort;
      if (gameControls.autoFlip instanceof HTMLInputElement) gameControls.autoFlip.checked = activeGame.autoFlip;
      if (gameControls.speed instanceof HTMLInputElement) gameControls.speed.value = String(activeGame.speed);
      if (hasActiveSprite) {
        if (spriteControls.play instanceof HTMLButtonElement) spriteControls.play.textContent = activeSprite.playing ? "Pausa" : "Play";
        if (spriteControls.fps instanceof HTMLInputElement) spriteControls.fps.value = String(activeSprite.fps);
        if (spriteControls.loop instanceof HTMLInputElement) spriteControls.loop.checked = activeSprite.loop;
        if (spriteControls.mode instanceof HTMLSelectElement) spriteControls.mode.value = activeSprite.mode;
        if (spriteControls.syncMotion instanceof HTMLInputElement) spriteControls.syncMotion.checked = activeSprite.syncMotion;
        if (spriteControls.directionalEnabled instanceof HTMLInputElement) spriteControls.directionalEnabled.checked = activeSprite.directional.enabled;
        if (spriteControls.directionState instanceof HTMLSelectElement) spriteControls.directionState.value = activeSprite.directional.state;
        if (spriteControls.directionStatus instanceof HTMLElement) spriteControls.directionStatus.textContent = getSpriteDirectionStatusText(activeSprite);
        if (spriteControls.onionEnabled instanceof HTMLInputElement) spriteControls.onionEnabled.checked = activeSprite.onion.enabled;
        if (spriteControls.onionOpacity instanceof HTMLInputElement) spriteControls.onionOpacity.value = String(Math.round(activeSprite.onion.opacity * 100));
        if (spriteControls.frame instanceof HTMLInputElement) {
          const editorFrames = getSpriteEditorFrames(activeSprite);
          spriteControls.frame.max = String(Math.max(editorFrames.length - 1, 0));
          spriteControls.frame.value = String(clamp(activeSprite.frameIndex, 0, Math.max(editorFrames.length - 1, 0)));
        }
      }
      setRangeValue("z", numeric(activeImage.z, 20));
      setRangeValue("opacity", Math.round(normalizeOpacity(activeImage.opacity) * 100), "%");
      setRangeValue("motionSpeed", formatMotionSpeed(activeMotion.speed));
      setRangeValue("motionDistance", activeMotion.distance, "px");
      setRangeValue("parallaxDepth", formatParallaxDepth(activeParallax.depth));
      setRangeValue("publicDragInertia", formatPublicDragInertia(activePublicDrag.inertia));
      setRangeValue("pathDuration", formatPathDuration(activePath.duration));
      setRangeValue("pathPoints", activePath.points.length, activePath.points.length === 1 ? " punto" : " punti");
      setRangeValue("spriteFps", hasActiveSprite ? activeSprite.fps : 8);
      if (hasActiveSprite) {
        const editorFrameCount = Math.max(getSpriteEditorFrames(activeSprite).length, 1);
        setRangeValue("spriteFrame", `${clamp(activeSprite.frameIndex, 0, editorFrameCount - 1) + 1}/${editorFrameCount}`);
      } else {
        setRangeValue("spriteFrame", "1/1");
      }
      setRangeValue("spriteOnionOpacity", hasActiveSprite ? Math.round(activeSprite.onion.opacity * 100) : 35, "%");
      setRangeValue("gameSpeed", formatGameSpeed(activeGame.speed));
      setRangeValue("triggerDelay", formatTriggerDelay(activeTrigger.delay));
      setRangeValue("cutoutTolerance", numeric(cutoutControls.tolerance?.value, 38));
      setRangeValue("cutoutFeather", numeric(cutoutControls.feather?.value, 3), "px");
      setRangeValue("cutoutEdge", numeric(cutoutControls.edge?.value, 0), "px");
      setRangeValue("cutoutMargin", numeric(cutoutControls.margin?.value, 8), "px");
      renderSpriteStrip(activeImage);
    }
    if (imageVisibilityButton instanceof HTMLButtonElement) {
      const allHidden = hasActiveImage && selectedImages.every((item) => item.hidden);
      imageVisibilityButton.textContent = allHidden ? "Mostra" : "Nascondi";
      imageVisibilityButton.setAttribute("aria-pressed", allHidden ? "true" : "false");
      imageVisibilityButton.title = allHidden ? "Mostra selezione" : "Nascondi selezione";
    }
    if (imageLockButton instanceof HTMLButtonElement) {
      const allLocked = hasActiveImage && selectedImages.every((item) => item.locked);
      imageLockButton.textContent = allLocked ? "Sblocca" : "Blocca";
      imageLockButton.setAttribute("aria-pressed", allLocked ? "true" : "false");
      imageLockButton.title = allLocked ? "Sblocca selezione" : "Blocca selezione";
    }
    if (imageStatus) {
      imageStatus.textContent = hasActiveImage
        ? [
            selectedImages.length > 1 ? `${selectedImages.length} immagini selezionate` : `Immagine selezionata`,
            hasActiveSprite ? `sprite ${activeSprite.frames.length} frame${spriteStateFrameCount(activeSprite) ? ` + direzioni ${spriteStateFrameCount(activeSprite)}` : ""}` : "",
            `layer ${numeric(activeImage.z, 20)}`,
            `${Math.round(normalizeOpacity(activeImage.opacity) * 100)}%`,
            `${blendModeLabels[normalizeBlendMode(activeImage.blendMode)]}`,
            `${hoverEffectLabels[normalizeHoverEffect(activeImage.hoverEffect)]}`,
            `${clickEffectLabels[normalizeClickEffect(activeImage.clickEffect)]}`,
            motionIsActive(activeImage.motion) ? `${motionPresetLabels[normalizeImageMotion(activeImage.motion).preset]}` : "",
            parallaxIsActive(activeImage.parallax) ? `parallasse ${formatParallaxDepth(normalizeImageParallax(activeImage.parallax).depth)}` : "",
            normalizePublicDrag(activeImage.publicDrag).enabled ? `drag pubblico ${formatPublicDragInertia(normalizePublicDrag(activeImage.publicDrag).inertia)}` : "",
            normalizePathMotion(activeImage.pathMotion).points.length ? `percorso ${normalizePathMotion(activeImage.pathMotion).points.length} pt` : "",
            normalizeGameAsset(activeImage.game).role !== "web" ? `game ${gameRoleLabels[normalizeGameAsset(activeImage.game).role]}` : "",
            normalizeGameAsset(activeImage.game).role === "obstacle" ? "collisione box" : "",
            normalizeGameAsset(activeImage.game).autoFlip ? "specchio sx" : "",
            activeImage.linkUrl ? "link" : "senza link",
            activeImage.hidden ? "nascosta" : "",
            activeImage.locked ? "bloccata" : "",
          ].filter(Boolean).join(" · ")
        : imageBoxes.length
          ? `${imageBoxes.length} immagini`
          : "Nessuna immagine";
    }
    if (imageEmptyState instanceof HTMLElement) imageEmptyState.hidden = imageBoxes.length > 0;
    [imageSelectAllButton, imageCenterAllButton].forEach((button) => {
      if (button instanceof HTMLButtonElement) button.disabled = publicMode || !imageBoxes.length;
    });
    if (!hasActiveImage || publicMode) imagePathPicking = false;
    syncLayerTriggerControlsAvailability();
    syncImagePathPickButton();
    updateGamePreviewStatus();
    updateGameSpawnStatus();
    syncGameInputControls();
  };

  const applyBackgroundImage = () => {
    if (!bgImage) return;
    const storedImage = getBackgroundImageStorageValue();
    if (storedImage) {
      bgImage.src = renderableImageSource(storedImage);
      bgImage.hidden = false;
      if (isLocalImageAssetReference(storedImage)) {
        void resolveLocalImageAsset(storedImage).then((resolvedImage) => {
          if (resolvedImage && getBackgroundImageStorageValue() === storedImage) bgImage.src = resolvedImage;
        });
      }
    } else {
      bgImage.removeAttribute("src");
      bgImage.hidden = true;
    }
    document.body.classList.toggle("uccelli-bg-scroll", Boolean(getSettings().backgroundImgScroll));
  };

  bgUploadButton?.addEventListener("click", () => bgUploadInput?.click());
  bgUploadInput?.addEventListener("change", async () => {
    const file = bgUploadInput.files?.[0];
    if (!file) return;
    await setBackgroundImageStorageValue(await readFileAsDataUrl(file));
    bgUploadInput.value = "";
    applyBackgroundImage();
  });
  bgResetButton?.addEventListener("click", () => {
    void setBackgroundImageStorageValue("");
    applyBackgroundImage();
  });
  root.querySelector('[data-style-control="backgroundImgScroll"]')?.addEventListener("input", () => {
    window.setTimeout(applyBackgroundImage, 0);
  });

  const storedImageBoxes = loadImageBoxes();
  const storedGalleries = loadGalleries();
  let imageBoxes = storedImageBoxes.images;
  let removedImageIds = storedImageBoxes.removedIds;
  let galleries = storedGalleries.galleries;
  let removedGalleryIds = storedGalleries.removedIds;
  let activeItem = null;
  let selectedImageIds = new Set();
  let imageCounter = 0;
  let galleryCounter = 0;
  const slideshowTimers = new Map();
  const clickEffectTimestamps = new Map();
  let publicMode = false;
  let inspectorDocked = false;
  inspectorDocked = Boolean(readJson(inspectorDockKey, { docked: false })?.docked);
  const initialLayersPanelState = readJson(layersPanelKey, {});
  let layersSearchQuery = String(initialLayersPanelState.search || "");
  let layersActiveFilter = allowedLayerListFilters.has(String(initialLayersPanelState.filter || ""))
    ? String(initialLayersPanelState.filter)
    : "all";
  let collapsedLayerGroupIds = new Set(
    Array.isArray(initialLayersPanelState.collapsedGroups)
      ? initialLayersPanelState.collapsedGroups.filter((groupId) => Object.prototype.hasOwnProperty.call(layerGroupLabels, groupId))
      : []
  );
  let commandPaletteOpen = false;
  let commandPaletteSelectedIndex = 0;
  let commandPaletteMatches = [];
  const pendingImageTrims = new Set();
  const imagePixelMasks = new Map();
  let shapeHoverImageId = null;
  let copiedImageStyle = null;
  let copiedImageMotion = null;
  let imageContextMenu = null;
  let imageMotionFrame = 0;
  let imagePathPicking = false;
  const parallaxCamera = { x: 0, y: 0 };
  const publicDragOffsets = new Map();
  const publicDragInertiaItems = new Map();
  const publicDragClickSuppressions = new Map();
  let publicDragInertiaFrame = 0;
  const gamePreviewPositions = new Map();
  const gamePreviewPressedActions = new Set();
  let gamePreviewEnabled = false;
  let gamePreviewFrame = 0;
  const gamePreviewPathMaxNodes = 5200;
  let gameInputCapture = null;
  const spriteRuntimeStarts = new Map();
  const spriteMotionRuntime = new Map();
  let spriteAnimationFrame = 0;
  let spriteUploadMode = { type: "new", state: "idle-down" };
  let gameWalkPicking = false;
  let gameWalkSelectedPointIndex = -1;
  let gameWalkPointDrag = null;
  let gameSpawnPicking = false;
  let gameSpawnDrag = null;
  const layerTriggerRuntime = new Map();
  const layerTriggerTimers = new Map();
  const imageHistoryLimit = 80;
  let imageUndoStack = [];
  let imageRedoStack = [];
  let lastImageHistorySnapshot = null;
  const imageHistoryAssetCache = new Map();
  const imageHistoryAssetWriteKeys = new Set();
  let imageHistoryApplyQueue = Promise.resolve();
  let canvasBackground = normalizeCanvasBackground(readJson(canvasBackgroundKey, null));
  let gameRoom = normalizeGameRoom(readJson(gameRoomKey, null));

  const resetImageBoxTrim = (item) => {
    item.trim = null;
    item.naturalWidth = 0;
    item.naturalHeight = 0;
    pendingImageTrims.delete(item.id);
    imagePixelMasks.delete(item.id);
  };

  const applyCutoutPlacement = (item, result) => {
    if (!result?.crop || result.sourceWidth <= 0 || result.sourceHeight <= 0) return;
    const displayScale = numeric(item.width, result.sourceWidth) / Math.max(result.sourceWidth, 1);
    item.x = numeric(item.x) + result.crop.x * displayScale;
    item.y = numeric(item.y) + result.crop.y * displayScale;
    item.width = Math.max(result.width * displayScale, 1);
  };

  const triggerInitiallyActive = (item) => {
    const trigger = normalizeLayerTrigger(item?.trigger);
    if (trigger.mode === "immediate") return true;
    if (trigger.action === "play") return false;
    return false;
  };
  const isLayerTriggered = (item) => {
    if (!publicMode) return true;
    const trigger = normalizeLayerTrigger(item?.trigger);
    const state = layerTriggerRuntime.get(item.id);
    if (!state) return triggerInitiallyActive(item);
    return state.active === true;
  };
  const layerIsVisibleByTrigger = (item) => {
    const trigger = normalizeLayerTrigger(item?.trigger);
    return trigger.action !== "show" || isLayerTriggered(item);
  };
  const layerAnimationAllowed = (item) => {
    const trigger = normalizeLayerTrigger(item?.trigger);
    return trigger.action !== "play" || isLayerTriggered(item);
  };
  const setLayerTriggered = (id, active = true) => {
    if (!id) return;
    layerTriggerRuntime.set(id, { active, startedAt: window.performance.now() });
    const item = imageBoxes.find((entry) => entry.id === id);
    if (item) {
      resetSpriteRuntime(id);
      const box = getImageBoxElement(id);
      if (box) box.classList.toggle("is-trigger-hidden", !layerIsVisibleByTrigger(item));
    }
    imageBoxes.forEach((entry) => {
      const trigger = normalizeLayerTrigger(entry.trigger);
      if (trigger.mode === "after-layer" && trigger.targetId === id) setLayerTriggered(entry.id, true);
    });
    syncSpriteLoop();
    syncImageMotionLoop();
  };
  const clearLayerTriggerTimers = () => {
    layerTriggerTimers.forEach((timer) => window.clearTimeout(timer));
    layerTriggerTimers.clear();
  };
  const resetLayerTriggers = () => {
    clearLayerTriggerTimers();
    layerTriggerRuntime.clear();
    if (!publicMode) return;
    imageBoxes.forEach((item) => {
      const trigger = normalizeLayerTrigger(item.trigger);
      layerTriggerRuntime.set(item.id, { active: triggerInitiallyActive(item), startedAt: window.performance.now() });
      if (trigger.mode === "delay") {
        layerTriggerTimers.set(item.id, window.setTimeout(() => setLayerTriggered(item.id, true), trigger.delay * 1000));
      }
      if (trigger.mode === "after-layer" && trigger.targetId) {
        const target = imageBoxes.find((entry) => entry.id === trigger.targetId);
        if (target && isLayerTriggered(target)) setLayerTriggered(item.id, true);
      }
    });
  };

  const isImageMultiSelectEvent = (event) => Boolean(event?.metaKey || event?.ctrlKey || event?.shiftKey);

  const normalizeSelectedImageIds = () => {
    const availableIds = new Set(imageBoxes.map((item) => item.id));
    selectedImageIds = new Set([...selectedImageIds].filter((id) => availableIds.has(id)));
    if (activeItem?.type === "image" && !availableIds.has(activeItem.id)) {
      activeItem = selectedImageIds.size ? { type: "image", id: [...selectedImageIds].at(-1) } : null;
    }
    return selectedImageIds;
  };

  const getSelectedImages = () => {
    const ids = normalizeSelectedImageIds();
    return imageBoxes.filter((item) => ids.has(item.id));
  };

  const setSelectedImages = (ids, primaryId = null) => {
    const availableIds = new Set(imageBoxes.map((item) => item.id));
    const nextIds = Array.from(ids).filter((id, index, items) => availableIds.has(id) && items.indexOf(id) === index);
    selectedImageIds = new Set(nextIds);
    if (selectedImageIds.size) {
      const nextPrimary = primaryId && selectedImageIds.has(primaryId) ? primaryId : nextIds.at(-1);
      activeItem = { type: "image", id: nextPrimary };
    } else if (activeItem?.type === "image") {
      activeItem = null;
    }
  };

  const updateSelectedImages = (updater) => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return false;
    selectedImages.forEach(updater);
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const deleteSelectedImages = () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return false;
    const selectedIds = new Set(selectedImages.map((item) => item.id));
    selectedIds.forEach(rememberRemovedImage);
    selectedIds.forEach((id) => {
      publicDragOffsets.delete(id);
      publicDragInertiaItems.delete(id);
      publicDragClickSuppressions.delete(id);
      gamePreviewPositions.delete(id);
      spriteRuntimeStarts.delete(id);
    });
    imageBoxes = imageBoxes.filter((item) => !selectedIds.has(item.id));
    selectedImageIds.clear();
    activeItem = null;
    renderImageBoxes();
    renderLayersList();
    return true;
  };

  const getImageVisualBounds = (item) => {
    const trim = getImageTrim(item);
    const imageWidth = numeric(item.width, 320);
    const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
    const imageHeight = trim.naturalHeight * imageScale;
    const centerX = numeric(item.x) + imageWidth / 2;
    const centerY = numeric(item.y) + imageHeight / 2;
    const radians = numeric(item.rotation) * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const corners = [
      { x: -imageWidth / 2, y: -imageHeight / 2 },
      { x: imageWidth / 2, y: -imageHeight / 2 },
      { x: imageWidth / 2, y: imageHeight / 2 },
      { x: -imageWidth / 2, y: imageHeight / 2 },
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

  const getImageTrimVisualBounds = (item, index = 0, time = window.performance.now()) => {
    const trim = getImageTrim(item);
    const imageWidth = numeric(item.width, 320);
    const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
    const trimLeft = trim.x * imageScale;
    const trimTop = trim.y * imageScale;
    const trimWidth = trim.width * imageScale;
    const trimHeight = trim.height * imageScale;
    const renderState = getImageRenderState(item, index, time);
    const rotation = numeric(item.rotation) + numeric(renderState.rotation);
    const centerX = numeric(item.x) + numeric(renderState.x) + trimLeft + trimWidth / 2;
    const centerY = numeric(item.y) + numeric(renderState.y) + trimTop + trimHeight / 2;
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

  const getImagesVisualBounds = (items) => items.reduce((bounds, item) => {
    const itemBounds = getImageVisualBounds(item);
    return {
      left: Math.min(bounds.left, itemBounds.left),
      top: Math.min(bounds.top, itemBounds.top),
      right: Math.max(bounds.right, itemBounds.right),
      bottom: Math.max(bounds.bottom, itemBounds.bottom),
    };
  }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });

  const translateImageBox = (item, deltaX, deltaY) => {
    item.x = numeric(item.x) + deltaX;
    item.y = numeric(item.y) + deltaY;
    const pathMotion = normalizePathMotion(item.pathMotion);
    if (pathMotion.points.length) {
      item.pathMotion = {
        ...pathMotion,
        points: pathMotion.points.map((point) => ({
          x: numeric(point.x) + deltaX,
          y: numeric(point.y) + deltaY,
        })),
      };
    }
  };

  const selectAllImageBoxes = () => {
    if (!imageBoxes.length || publicMode) return false;
    setSelectedImages(imageBoxes.map((item) => item.id), imageBoxes.at(-1)?.id);
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const centerAllImageBoxes = () => {
    if (!imageBoxes.length || publicMode) return false;
    const visibleImages = imageBoxes.filter((item) => !item.hidden && item.src);
    const referenceImages = visibleImages.length ? visibleImages : imageBoxes;
    const bounds = getImagesVisualBounds(referenceImages);
    if (!Number.isFinite(bounds.left) || !Number.isFinite(bounds.right)) return false;
    const layerRect = imageLayer.getBoundingClientRect();
    const targetX = window.scrollX + window.innerWidth / 2 - (layerRect.left + window.scrollX);
    const targetY = window.scrollY + window.innerHeight / 2 - (layerRect.top + window.scrollY);
    const deltaX = Math.round(targetX - (bounds.left + bounds.right) / 2);
    const deltaY = Math.round(targetY - (bounds.top + bounds.bottom) / 2);
    if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return false;
    imageBoxes.forEach((item) => translateImageBox(item, deltaX, deltaY));
    setSelectedImages(imageBoxes.map((item) => item.id), imageBoxes.at(-1)?.id);
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const getImageMotionState = (item, index = 0, time = window.performance.now()) => {
    if (!layerAnimationAllowed(item)) return { x: 0, y: 0, rotation: 0 };
    const motion = normalizeImageMotion(item?.motion);
    if (!motionIsActive(motion)) return { x: 0, y: 0, rotation: 0 };
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

  const getPublicDragOffset = (id) => publicDragOffsets.get(String(id || "")) || { x: 0, y: 0 };

  const getSpriteRuntimeKey = (item, stateId = "base") => `${String(item?.id || "sprite")}:${stateId}`;

  const getGameDirectionFromVector = (x = 0, y = 0, fallback = "down") => {
    const absX = Math.abs(numeric(x));
    const absY = Math.abs(numeric(y));
    if (absX <= 0.01 && absY <= 0.01) return fallback;
    if (absX > absY) return numeric(x) < 0 ? "left" : "right";
    return numeric(y) < 0 ? "up" : "down";
  };

  const getSpriteDirectionalRuntimeStateId = (item, runtimeState = null) => {
    const sprite = normalizeSprite(item?.sprite, item?.src);
    if (!sprite.directional.enabled) return "base";
    const direction = String(runtimeState?.direction || "down");
    if (runtimeState?.moving === true) {
      const walkState = `walk-${direction}`;
      if (getSpriteFramesForState(sprite, walkState).length) return walkState;
      if (getSpriteFramesForState(sprite, "walk-down").length) return "walk-down";
      return "base";
    }
    return getSpriteFramesForState(sprite, "idle-down").length ? "idle-down" : "base";
  };

  const getSpritePlayback = (item, time = window.performance.now()) => {
    const sprite = normalizeSprite(item?.sprite, item?.src);
    let stateId = getSpriteEditorStateId(sprite);
    let directionalRuntime = false;
    let moving = false;
    if (sprite.directional.enabled && gamePreviewEnabled && normalizeGameAsset(item?.game).player) {
      const runtimeState = getGamePreviewState(item);
      stateId = getSpriteDirectionalRuntimeStateId(item, runtimeState);
      directionalRuntime = true;
      moving = runtimeState?.moving === true;
    }
    const stateFrames = getSpriteFramesForState(sprite, stateId);
    return {
      sprite,
      stateId,
      frames: stateFrames.length ? stateFrames : sprite.frames,
      directionalRuntime,
      moving,
      time,
    };
  };

  const getSpriteFrameIndex = (item, time = window.performance.now()) => {
    const playback = getSpritePlayback(item, time);
    const sprite = playback.sprite;
    const frames = playback.frames;
    const frameCount = frames.length;
    if (!sprite.enabled || !frameCount) return 0;
    const runtimeKey = getSpriteRuntimeKey(item, playback.stateId);
    if ((sprite.syncMotion || (playback.directionalRuntime && playback.moving)) && frameCount > 1) {
      const index = imageBoxes.findIndex((entry) => entry.id === item.id);
      const state = getImageRenderState(item, Math.max(index, 0), time);
      const x = numeric(item?.x) + state.x;
      const y = numeric(item?.y) + state.y;
      const runtime = spriteMotionRuntime.get(runtimeKey) || { x, y, distance: sprite.frameIndex * Math.max(numeric(item?.width, 180) / 7, 12) };
      const delta = Math.hypot(x - runtime.x, y - runtime.y);
      if (delta > 0.05) runtime.distance += delta;
      runtime.x = x;
      runtime.y = y;
      spriteMotionRuntime.set(runtimeKey, runtime);
      const distancePerFrame = Math.max(numeric(item?.width, 180) / 7, 12);
      const step = Math.floor(runtime.distance / distancePerFrame);
      if (!sprite.loop) return clamp(step, 0, frameCount - 1);
      if (sprite.mode === "pingpong" && frameCount > 1) {
        const cycle = frameCount * 2 - 2;
        const frame = step % cycle;
        return frame < frameCount ? frame : cycle - frame;
      }
      return step % frameCount;
    }
    if (!sprite.playing || frameCount <= 1) return clamp(sprite.frameIndex, 0, frameCount - 1);
    if (!spriteRuntimeStarts.has(runtimeKey)) {
      spriteRuntimeStarts.set(runtimeKey, time - (sprite.frameIndex / sprite.fps) * 1000);
    }
    const elapsed = Math.max(0, (time - spriteRuntimeStarts.get(runtimeKey)) / 1000);
    const step = Math.floor(elapsed * sprite.fps);
    if (!sprite.loop) return clamp(step, 0, frameCount - 1);
    if (sprite.mode === "pingpong" && frameCount > 1) {
      const cycle = frameCount * 2 - 2;
      const frame = step % cycle;
      return frame < frameCount ? frame : cycle - frame;
    }
    return step % frameCount;
  };

  const getCurrentSpriteFrame = (item, time = window.performance.now()) => {
    const playback = getSpritePlayback(item, time);
    return playback.frames[getSpriteFrameIndex(item, time)] || playback.frames[0] || { src: item?.src || "", name: "frame-1" };
  };

  const resetSpriteRuntime = (id = "") => {
    if (id) {
      const prefix = `${String(id)}:`;
      spriteRuntimeStarts.forEach((_, key) => {
        if (key === String(id) || String(key).startsWith(prefix)) spriteRuntimeStarts.delete(key);
      });
      spriteMotionRuntime.forEach((_, key) => {
        if (key === String(id) || String(key).startsWith(prefix)) spriteMotionRuntime.delete(key);
      });
    } else {
      spriteRuntimeStarts.clear();
      spriteMotionRuntime.clear();
    }
  };

  const getImagePathState = (item, time = window.performance.now()) => {
    if (!layerAnimationAllowed(item)) return { x: 0, y: 0 };
    const pathMotion = normalizePathMotion(item?.pathMotion);
    if (!pathMotionIsActive(item)) return { x: 0, y: 0 };
    const points = pathMotion.points;
    const legCount = points.length - 1;
    const cycleLegs = legCount * 2;
    const progress = ((time / 1000) % pathMotion.duration) / pathMotion.duration;
    const mirroredProgress = progress * cycleLegs;
    const pathProgress = mirroredProgress <= legCount ? mirroredProgress : cycleLegs - mirroredProgress;
    const legIndex = clamp(Math.floor(pathProgress), 0, legCount - 1);
    const localProgress = pathProgress - legIndex;
    const easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
    const startPoint = points[legIndex];
    const endPoint = points[legIndex + 1];
    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * easedProgress - numeric(item?.x),
      y: startPoint.y + (endPoint.y - startPoint.y) * easedProgress - numeric(item?.y),
    };
  };

  const getGamePreviewPlayer = () => imageBoxes.find((item) => {
    const game = normalizeGameAsset(item?.game);
    return game.player && !item.hidden;
  });

  const persistGameRoom = () => {
    gameRoom = normalizeGameRoom(gameRoom);
    tryWriteJson(gameRoomKey, gameRoom, "Stanza gioco");
  };

  const getGameWalkArea = () => normalizeGameRoom(gameRoom).walkArea;
  const setGameWalkArea = (patch, { history = true, render = true } = {}) => {
    const current = getGameWalkArea();
    gameRoom = normalizeGameRoom({
      ...gameRoom,
      walkArea: {
        ...current,
        ...patch,
      },
    });
    const pointsLength = getGameWalkArea().points.length;
    if (gameWalkSelectedPointIndex >= pointsLength) gameWalkSelectedPointIndex = pointsLength - 1;
    if (gameWalkSelectedPointIndex < 0 || pointsLength <= 0) gameWalkSelectedPointIndex = -1;
    if (history && typeof saveGameRoom === "function") saveGameRoom();
    else persistGameRoom();
    if (render) {
      updateGameWalkStatus();
      renderGameWalkOverlay();
    }
  };
  const getGameWalkEventPoint = (event) => {
    const layerRect = imageLayer.getBoundingClientRect();
    return normalizeGamePoint({
      x: event.clientX - layerRect.left,
      y: event.clientY - layerRect.top,
    });
  };
  const getGameSpawn = () => normalizeGameRoom(gameRoom).spawn;
  const getGameSpawnPoint = () => {
    const spawn = getGameSpawn();
    return spawn.enabled ? { x: spawn.x, y: spawn.y } : null;
  };
  const gameWalkAreaIsActive = () => {
    const walkArea = getGameWalkArea();
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

  const clampPointToGameWalkArea = (point) => {
    const walkArea = getGameWalkArea();
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

  const constrainGamePreviewPosition = (item, x, y) => {
    if (!gameWalkAreaIsActive()) return { x, y };
    const foot = getGamePlayerFootPoint(item, x, y);
    const nextFoot = clampPointToGameWalkArea(foot);
    return {
      x: nextFoot.x - numeric(item?.width, 320) / 2,
      y: nextFoot.y - getImageFullHeight(item),
    };
  };

  const getGameObstacleItems = () => imageBoxes
    .map((entry, index) => ({ item: entry, index, game: normalizeGameAsset(entry.game) }))
    .filter(({ item, game }) =>
      game.role === "obstacle" &&
      !item.hidden &&
      normalizeOpacity(item.opacity) > 0.01 &&
      layerIsVisibleByTrigger(item)
    );

  const getGameObstacleCount = () => getGameObstacleItems().length;

  const rectsIntersect = (first, second) =>
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top;

  const getGamePlayerFootPoint = (item, x = numeric(item?.x), y = numeric(item?.y)) => ({
    x: numeric(x) + numeric(item?.width, 320) / 2,
    y: numeric(y) + getImageFullHeight(item),
  });

  const getGamePreviewInitialPosition = (item) => {
    const spawn = getGameSpawnPoint();
    if (!spawn) return { x: numeric(item?.x), y: numeric(item?.y) };
    return constrainGamePreviewPosition(
      item,
      spawn.x - numeric(item?.width, 320) / 2,
      spawn.y - getImageFullHeight(item)
    );
  };

  const setGameSpawnPoint = (point, { history = true, render = true } = {}) => {
    const nextSpawn = point
      ? { enabled: true, ...normalizeGamePoint(point) }
      : { enabled: false, x: 0, y: 0 };
    gameRoom = normalizeGameRoom({
      ...gameRoom,
      spawn: nextSpawn,
    });
    if (history && typeof saveGameRoom === "function") saveGameRoom();
    else persistGameRoom();
    gamePreviewPositions.clear();
    if (render) {
      updateGameSpawnStatus();
      updateGamePreviewStatus();
      renderGameWalkOverlay();
      applyImageTransforms();
    }
  };

  const updateGameSpawnStatus = () => {
    const spawn = getGameSpawn();
    const player = getGamePreviewPlayer();
    if (gameControls.spawnPick instanceof HTMLButtonElement) {
      gameControls.spawnPick.textContent = gameSpawnPicking ? "Fine spawn" : spawn.enabled ? "Sposta spawn" : "Piazza spawn";
      gameControls.spawnPick.setAttribute("aria-pressed", gameSpawnPicking ? "true" : "false");
    }
    if (gameControls.spawnFromPlayer instanceof HTMLButtonElement) {
      gameControls.spawnFromPlayer.disabled = !player;
    }
    if (gameControls.spawnClear instanceof HTMLButtonElement) {
      gameControls.spawnClear.disabled = !spawn.enabled;
    }
    if (!(gameControls.spawnStatus instanceof HTMLElement)) return;
    if (gameSpawnPicking) {
      gameControls.spawnStatus.textContent = "Clicca nel canvas per scegliere dove appaiono i piedi del player. Esc annulla.";
      return;
    }
    gameControls.spawnStatus.textContent = spawn.enabled
      ? `Spawn pronto: x ${spawn.x}, y ${spawn.y}. Reset player riparte da qui.`
      : "Nessuno spawn: la preview parte dalla posizione editor del player.";
  };

  const getGamePlayerCollisionRect = (item, x, y) => {
    const foot = getGamePlayerFootPoint(item, x, y);
    const radius = clamp(numeric(item?.width, 320) * 0.045, 7, 18);
    return {
      left: foot.x - radius,
      top: foot.y - radius * 0.45,
      right: foot.x + radius,
      bottom: foot.y + radius * 0.45,
    };
  };

  const gamePreviewPositionHitsObstacle = (item, x, y, time = window.performance.now()) => {
    const game = normalizeGameAsset(item?.game);
    if (!game.player) return false;
    const playerRect = getGamePlayerCollisionRect(item, x, y);
    return getGameObstacleItems().some(({ item: obstacle, index }) => {
      if (obstacle.id === item.id) return false;
      const bounds = getImageTrimVisualBounds(obstacle, index, time);
      return rectsIntersect(playerRect, bounds);
    });
  };

  const gamePreviewFootFromPosition = (item, position) => getGamePlayerFootPoint(item, position.x, position.y);

  const gamePreviewPositionFromFoot = (item, foot) => ({
    x: foot.x - numeric(item?.width, 320) / 2,
    y: foot.y - getImageFullHeight(item),
  });

  const pointOnPolygonBoundary = (point, polygon, tolerance = 2) => {
    if (!Array.isArray(polygon) || polygon.length < 2) return false;
    return polygon.some((start, index) => {
      const end = polygon[(index + 1) % polygon.length];
      const closest = closestPointOnSegment(point, start, end);
      return Math.hypot(closest.x - point.x, closest.y - point.y) <= tolerance;
    });
  };

  const gamePreviewFootIsInWalkArea = (foot) => {
    if (!gameWalkAreaIsActive()) return true;
    const polygon = getGameWalkArea().points;
    return pointInPolygon(foot, polygon) || pointOnPolygonBoundary(foot, polygon, 3);
  };

  const gamePreviewPositionIsNavigable = (item, position, time = window.performance.now()) => {
    const foot = gamePreviewFootFromPosition(item, position);
    return gamePreviewFootIsInWalkArea(foot) &&
      !gamePreviewPositionHitsObstacle(item, position.x, position.y, time);
  };

  const getGamePreviewPathGridSize = (item) =>
    clamp(Math.round(numeric(item?.width, 320) * 0.12), 28, 56);

  const gamePreviewSegmentIsNavigable = (item, start, end, time = window.performance.now()) => {
    const distance = Math.hypot(numeric(end.x) - numeric(start.x), numeric(end.y) - numeric(start.y));
    const sampleStep = Math.max(getGamePreviewPathGridSize(item) * 0.45, 12);
    const sampleCount = Math.max(1, Math.ceil(distance / sampleStep));
    for (let index = 0; index <= sampleCount; index += 1) {
      const t = index / sampleCount;
      const position = {
        x: numeric(start.x) + (numeric(end.x) - numeric(start.x)) * t,
        y: numeric(start.y) + (numeric(end.y) - numeric(start.y)) * t,
      };
      if (!gamePreviewPositionIsNavigable(item, position, time)) return false;
    }
    return true;
  };

  const findNearestGamePreviewNavigablePosition = (item, position, time = window.performance.now()) => {
    const constrainedPosition = constrainGamePreviewPosition(item, position.x, position.y);
    if (gamePreviewPositionIsNavigable(item, constrainedPosition, time)) return constrainedPosition;
    const targetFoot = gamePreviewFootFromPosition(item, constrainedPosition);
    const step = Math.max(10, Math.round(getGamePreviewPathGridSize(item) / 2));
    const maxRadius = Math.max(220, getGamePreviewPathGridSize(item) * 8);
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
        const candidatePosition = gamePreviewPositionFromFoot(item, foot);
        const candidate = constrainGamePreviewPosition(item, candidatePosition.x, candidatePosition.y);
        if (!gamePreviewPositionIsNavigable(item, candidate, time)) continue;
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

  const getGamePreviewNavigationBounds = (item, start, target, time = window.performance.now()) => {
    const cell = getGamePreviewPathGridSize(item);
    const startFoot = gamePreviewFootFromPosition(item, start);
    const targetFoot = gamePreviewFootFromPosition(item, target);
    let left = Math.min(startFoot.x, targetFoot.x);
    let right = Math.max(startFoot.x, targetFoot.x);
    let top = Math.min(startFoot.y, targetFoot.y);
    let bottom = Math.max(startFoot.y, targetFoot.y);
    const walkArea = getGameWalkArea();
    if (gameWalkAreaIsActive()) {
      walkArea.points.forEach((point) => {
        left = Math.min(left, point.x);
        right = Math.max(right, point.x);
        top = Math.min(top, point.y);
        bottom = Math.max(bottom, point.y);
      });
    } else {
      left = Math.min(left, 0);
      top = Math.min(top, 0);
      right = Math.max(right, imageLayer.scrollWidth, imageLayer.clientWidth, window.innerWidth);
      bottom = Math.max(bottom, imageLayer.scrollHeight, imageLayer.clientHeight, window.innerHeight);
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

  const simplifyGamePreviewPath = (item, points, time = window.performance.now()) => {
    if (points.length <= 2) return points;
    const simplified = [points[0]];
    let currentIndex = 0;
    while (currentIndex < points.length - 1) {
      let nextIndex = points.length - 1;
      while (
        nextIndex > currentIndex + 1 &&
        !gamePreviewSegmentIsNavigable(item, points[currentIndex], points[nextIndex], time)
      ) {
        nextIndex -= 1;
      }
      simplified.push(points[nextIndex]);
      currentIndex = nextIndex;
    }
    return simplified;
  };

  const findGamePreviewPath = (item, start, desiredTarget, time = window.performance.now()) => {
    const target = findNearestGamePreviewNavigablePosition(item, desiredTarget, time);
    if (!gamePreviewPositionIsNavigable(item, target, time)) return [];
    if (!gamePreviewPositionIsNavigable(item, start, time)) return [target].filter((point) => gamePreviewPositionIsNavigable(item, point, time));
    if (gamePreviewSegmentIsNavigable(item, start, target, time)) return [target];

    const bounds = getGamePreviewNavigationBounds(item, start, target, time);
    const cols = Math.max(2, Math.ceil((bounds.right - bounds.left) / bounds.cell) + 1);
    const rows = Math.max(2, Math.ceil((bounds.bottom - bounds.top) / bounds.cell) + 1);
    if (cols * rows > gamePreviewPathMaxNodes) return [];

    const nodeKey = (col, row) => `${col},${row}`;
    const nodeFoot = (col, row) => ({
      x: bounds.left + col * bounds.cell,
      y: bounds.top + row * bounds.cell,
    });
    const nodePosition = (col, row) => gamePreviewPositionFromFoot(item, nodeFoot(col, row));
    const nodeIsNavigable = (col, row) => (
      col >= 0 &&
      row >= 0 &&
      col < cols &&
      row < rows &&
      gamePreviewPositionIsNavigable(item, nodePosition(col, row), time)
    );
    const closestNode = (position, needsLine = true) => {
      const foot = gamePreviewFootFromPosition(item, position);
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
            if (needsLine && !gamePreviewSegmentIsNavigable(item, position, candidatePosition, time)) continue;
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
    const open = [{
      ...startNode,
      g: 0,
      f: heuristic(startNode.col, startNode.row),
    }];
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
    while (open.length && visits < gamePreviewPathMaxNodes) {
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
        if (nextScore >= numeric(bestScore.get(nextKey), Infinity)) return;
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
    if (lastWaypoint && gamePreviewSegmentIsNavigable(item, lastWaypoint, target, time)) {
      routePoints.push(target);
    }
    const fullPath = simplifyGamePreviewPath(item, routePoints, time)
      .slice(1)
      .filter((point, index, list) => index === 0 || Math.hypot(point.x - list[index - 1].x, point.y - list[index - 1].y) > 0.5);
    return fullPath;
  };

  const constrainGamePreviewMovement = (item, nextX, nextY, previousPosition = null, time = window.performance.now()) => {
    const previous = previousPosition || { x: numeric(item?.x), y: numeric(item?.y) };
    const walkConstrained = constrainGamePreviewPosition(item, nextX, nextY);
    if (!gamePreviewPositionHitsObstacle(item, walkConstrained.x, walkConstrained.y, time)) return walkConstrained;
    if (gamePreviewPositionHitsObstacle(item, previous.x, previous.y, time)) return walkConstrained;

    const xOnly = constrainGamePreviewPosition(item, walkConstrained.x, previous.y);
    if (!gamePreviewPositionHitsObstacle(item, xOnly.x, xOnly.y, time)) return xOnly;

    const yOnly = constrainGamePreviewPosition(item, previous.x, walkConstrained.y);
    if (!gamePreviewPositionHitsObstacle(item, yOnly.x, yOnly.y, time)) return yOnly;

    return previous;
  };

  const updateGameWalkStatus = () => {
    const walkArea = getGameWalkArea();
    if (gameControls.walkEnabled instanceof HTMLInputElement) gameControls.walkEnabled.checked = walkArea.enabled;
    if (gameControls.walkDraw instanceof HTMLButtonElement) {
      gameControls.walkDraw.textContent = gameWalkPicking ? "Fine punti" : walkArea.points.length ? "Aggiungi punti" : "Disegna zona";
      gameControls.walkDraw.setAttribute("aria-pressed", gameWalkPicking ? "true" : "false");
    }
    if (!(gameControls.walkStatus instanceof HTMLElement)) return;
    const count = walkArea.points.length;
    const hasSelectedPoint = gameWalkSelectedPointIndex >= 0 && gameWalkSelectedPointIndex < count;
    if (gameControls.walkClose instanceof HTMLButtonElement) {
      gameControls.walkClose.disabled = count < 3;
      gameControls.walkClose.textContent = walkArea.closed ? "Riapri zona" : "Chiudi zona";
    }
    if (gameControls.walkDeletePoint instanceof HTMLButtonElement) {
      gameControls.walkDeletePoint.disabled = !hasSelectedPoint;
    }
    if (gameWalkPicking) {
      gameControls.walkStatus.textContent = `Aggiunta punti attiva: ${count} punti. Clicca nel canvas, Esc per finire.`;
      return;
    }
    gameControls.walkStatus.textContent = count >= 3
      ? `${walkArea.closed ? "Zona chiusa" : "Zona aperta"}: ${count} punti${walkArea.enabled && walkArea.closed ? ", vincolo attivo" : ", vincolo spento"}${hasSelectedPoint ? `, punto ${gameWalkSelectedPointIndex + 1} selezionato` : ""}.`
      : "Clicca Disegna zona e aggiungi almeno 3 punti per definire il pavimento.";
  };

  const renderGameWalkOverlay = () => {
    imageLayer.querySelectorAll(".image-board-walkable-overlay").forEach((overlay) => overlay.remove());
    const walkArea = getGameWalkArea();
    const spawn = getGameSpawn();
    if (publicMode || gamePreviewEnabled || (!walkArea.points.length && !spawn.enabled)) return;
    const svgNamespace = "http://www.w3.org/2000/svg";
    const overlay = document.createElementNS(svgNamespace, "svg");
    const width = Math.max(imageLayer.scrollWidth, document.documentElement.scrollWidth, window.innerWidth, 1);
    const height = Math.max(imageLayer.scrollHeight, document.documentElement.scrollHeight, window.innerHeight, 1);
    overlay.classList.add("image-board-walkable-overlay");
    overlay.setAttribute("viewBox", `0 0 ${Math.ceil(width)} ${Math.ceil(height)}`);
    overlay.setAttribute("width", String(Math.ceil(width)));
    overlay.setAttribute("height", String(Math.ceil(height)));
    overlay.setAttribute("aria-hidden", "true");

    const pointsText = walkArea.points.map((point) => `${point.x},${point.y}`).join(" ");
    if (walkArea.closed && walkArea.points.length >= 3) {
      const polygon = document.createElementNS(svgNamespace, "polygon");
      polygon.classList.add("image-board-walkable-overlay__area");
      polygon.setAttribute("points", pointsText);
      overlay.append(polygon);
    }
    if (walkArea.points.length >= 2) {
      const line = document.createElementNS(svgNamespace, "polyline");
      line.classList.add("image-board-walkable-overlay__line");
      line.setAttribute("points", pointsText);
      overlay.append(line);
    }
    const segmentCount = walkArea.closed && walkArea.points.length >= 3
      ? walkArea.points.length
      : Math.max(walkArea.points.length - 1, 0);
    Array.from({ length: segmentCount }).forEach((_, index) => {
      const start = walkArea.points[index];
      const end = walkArea.points[(index + 1) % walkArea.points.length];
      const hitLine = document.createElementNS(svgNamespace, "line");
      hitLine.classList.add("image-board-walkable-overlay__segment-hit");
      hitLine.setAttribute("x1", String(start.x));
      hitLine.setAttribute("y1", String(start.y));
      hitLine.setAttribute("x2", String(end.x));
      hitLine.setAttribute("y2", String(end.y));
      hitLine.addEventListener("pointerdown", (event) => insertGameWalkPointOnSegment(event, index));
      overlay.append(hitLine);
    });
    walkArea.points.forEach((point, index) => {
      const marker = document.createElementNS(svgNamespace, "circle");
      marker.classList.add("image-board-walkable-overlay__point");
      if (index === gameWalkSelectedPointIndex) marker.classList.add("is-selected");
      marker.setAttribute("cx", String(point.x));
      marker.setAttribute("cy", String(point.y));
      marker.setAttribute("r", index === gameWalkSelectedPointIndex ? "8" : index === 0 ? "7" : "5");
      marker.dataset.pointIndex = String(index);
      marker.addEventListener("pointerdown", (event) => startGameWalkPointDrag(event, index));
      overlay.append(marker);
      const label = document.createElementNS(svgNamespace, "text");
      label.classList.add("image-board-walkable-overlay__label");
      label.setAttribute("x", String(point.x + 10));
      label.setAttribute("y", String(point.y - 9));
      label.textContent = String(index + 1);
      overlay.append(label);
    });
    if (spawn.enabled) {
      const spawnGroup = document.createElementNS(svgNamespace, "g");
      spawnGroup.classList.add("image-board-spawn-overlay");
      const spawnRing = document.createElementNS(svgNamespace, "circle");
      spawnRing.classList.add("image-board-spawn-overlay__ring");
      spawnRing.setAttribute("cx", String(spawn.x));
      spawnRing.setAttribute("cy", String(spawn.y));
      spawnRing.setAttribute("r", "15");
      spawnGroup.append(spawnRing);

      const spawnMarker = document.createElementNS(svgNamespace, "circle");
      spawnMarker.classList.add("image-board-spawn-overlay__marker");
      spawnMarker.setAttribute("cx", String(spawn.x));
      spawnMarker.setAttribute("cy", String(spawn.y));
      spawnMarker.setAttribute("r", "7");
      spawnMarker.addEventListener("pointerdown", startGameSpawnDrag);
      spawnGroup.append(spawnMarker);

      const spawnLabel = document.createElementNS(svgNamespace, "text");
      spawnLabel.classList.add("image-board-spawn-overlay__label");
      spawnLabel.setAttribute("x", String(spawn.x + 18));
      spawnLabel.setAttribute("y", String(spawn.y - 14));
      spawnLabel.textContent = "Spawn";
      spawnGroup.append(spawnLabel);
      overlay.append(spawnGroup);
    }
    imageLayer.append(overlay);
  };

  const setGameWalkPicking = (enabled) => {
    gameWalkPicking = Boolean(enabled) && !publicMode && !gamePreviewEnabled;
    if (gameWalkPicking) {
      gameSpawnPicking = false;
      root.classList.remove("is-game-spawn-picking");
      setImagePathPicking(false);
      hideImageContextMenu();
      clearImageShapeHover();
      updateGameSpawnStatus();
    }
    root.classList.toggle("is-game-walk-picking", gameWalkPicking);
    updateGameWalkStatus();
  };

  const setGameSpawnPicking = (enabled) => {
    gameSpawnPicking = Boolean(enabled) && !publicMode && !gamePreviewEnabled;
    if (gameSpawnPicking) {
      gameWalkPicking = false;
      root.classList.remove("is-game-walk-picking");
      setImagePathPicking(false);
      hideImageContextMenu();
      clearImageShapeHover();
      updateGameWalkStatus();
    }
    root.classList.toggle("is-game-spawn-picking", gameSpawnPicking);
    updateGameSpawnStatus();
  };

  const addGameSpawnFromEvent = (event) => {
    if (!gameSpawnPicking || eventTargetsImageShapeUi(event)) return false;
    event.preventDefault();
    event.stopPropagation();
    setGameSpawnPoint(getGameWalkEventPoint(event));
    setGameSpawnPicking(false);
    return true;
  };

  const startGameSpawnDrag = (event) => {
    if (publicMode || gamePreviewEnabled || event.button !== 0) return false;
    event.preventDefault();
    event.stopPropagation();
    gameSpawnPicking = false;
    gameSpawnDrag = {
      pointerId: event.pointerId,
      moved: false,
    };
    root.classList.remove("is-game-spawn-picking");
    root.classList.add("is-game-spawn-dragging");
    event.currentTarget?.setPointerCapture?.(event.pointerId);
    updateGameSpawnStatus();
    return true;
  };

  const handleGameSpawnPointerMove = (event) => {
    if (!gameSpawnDrag || event.pointerId !== gameSpawnDrag.pointerId) return;
    event.preventDefault();
    gameSpawnDrag.moved = true;
    setGameSpawnPoint(getGameWalkEventPoint(event), { history: false });
  };

  const endGameSpawnDrag = (event) => {
    if (!gameSpawnDrag || event.pointerId !== gameSpawnDrag.pointerId) return;
    event.preventDefault();
    const moved = gameSpawnDrag.moved;
    gameSpawnDrag = null;
    root.classList.remove("is-game-spawn-dragging");
    if (moved && typeof saveGameRoom === "function") saveGameRoom();
    updateGameSpawnStatus();
    renderGameWalkOverlay();
  };

  const addGameWalkPointFromEvent = (event) => {
    if (!gameWalkPicking || eventTargetsImageShapeUi(event)) return false;
    event.preventDefault();
    event.stopPropagation();
    const point = getGameWalkEventPoint(event);
    const walkArea = getGameWalkArea();
    const points = [...walkArea.points, point].slice(0, 64);
    gameWalkSelectedPointIndex = points.length - 1;
    setGameWalkArea({
      enabled: true,
      closed: false,
      points,
    });
    return true;
  };

  const updateGameWalkPoint = (index, point, options = {}) => {
    const walkArea = getGameWalkArea();
    if (index < 0 || index >= walkArea.points.length) return false;
    const points = walkArea.points.map((entry, pointIndex) => pointIndex === index ? normalizeGamePoint(point) : entry);
    setGameWalkArea({ points }, options);
    return true;
  };

  const insertGameWalkPointOnSegment = (event, segmentIndex) => {
    if (publicMode || gamePreviewEnabled || event.button !== 0) return false;
    event.preventDefault();
    event.stopPropagation();
    const walkArea = getGameWalkArea();
    if (segmentIndex < 0 || segmentIndex >= walkArea.points.length || walkArea.points.length >= 64) return false;
    const point = getGameWalkEventPoint(event);
    const insertIndex = segmentIndex + 1;
    const points = [
      ...walkArea.points.slice(0, insertIndex),
      point,
      ...walkArea.points.slice(insertIndex),
    ];
    gameWalkSelectedPointIndex = insertIndex;
    setGameWalkArea({ points });
    return true;
  };

  const startGameWalkPointDrag = (event, index) => {
    if (publicMode || gamePreviewEnabled || event.button !== 0) return false;
    event.preventDefault();
    event.stopPropagation();
    const walkArea = getGameWalkArea();
    if (index < 0 || index >= walkArea.points.length) return false;
    gameWalkSelectedPointIndex = index;
    gameWalkPointDrag = {
      index,
      pointerId: event.pointerId,
      moved: false,
    };
    root.classList.add("is-game-walk-dragging");
    event.currentTarget?.setPointerCapture?.(event.pointerId);
    updateGameWalkStatus();
    renderGameWalkOverlay();
    return true;
  };

  const handleGameWalkPointPointerMove = (event) => {
    if (!gameWalkPointDrag || event.pointerId !== gameWalkPointDrag.pointerId) return;
    event.preventDefault();
    const point = getGameWalkEventPoint(event);
    gameWalkPointDrag.moved = true;
    updateGameWalkPoint(gameWalkPointDrag.index, point, { history: false });
  };

  const endGameWalkPointDrag = (event) => {
    if (!gameWalkPointDrag || event.pointerId !== gameWalkPointDrag.pointerId) return;
    event.preventDefault();
    const moved = gameWalkPointDrag.moved;
    gameWalkPointDrag = null;
    root.classList.remove("is-game-walk-dragging");
    if (moved && typeof saveGameRoom === "function") saveGameRoom();
    updateGameWalkStatus();
    renderGameWalkOverlay();
  };

  const deleteSelectedGameWalkPoint = () => {
    const walkArea = getGameWalkArea();
    if (gameWalkSelectedPointIndex < 0 || gameWalkSelectedPointIndex >= walkArea.points.length) return false;
    const points = walkArea.points.filter((_, index) => index !== gameWalkSelectedPointIndex);
    gameWalkSelectedPointIndex = points.length ? clamp(gameWalkSelectedPointIndex, 0, points.length - 1) : -1;
    setGameWalkArea({
      closed: walkArea.closed && points.length >= 3,
      points,
    });
    return true;
  };

  const parseGameInputButton = (button) => {
    const [actionId, slotValue] = String(button?.dataset?.uccelliGameInputKey || "").split(":");
    return {
      actionId: gameInputActionIds.includes(actionId) ? actionId : "",
      slot: clamp(Math.round(numeric(slotValue, 0)), 0, 1),
    };
  };

  const syncGameInputControls = () => {
    const input = getGameInputSettings();
    gameControls.inputKeyButtons.forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const { actionId, slot } = parseGameInputButton(button);
      const key = input.bindings[actionId]?.[slot] || "";
      const listening = gameInputCapture?.actionId === actionId && gameInputCapture?.slot === slot;
      button.textContent = listening ? "Premi..." : formatKeyboardKey(key);
      button.classList.toggle("is-listening", listening);
      button.setAttribute("aria-pressed", listening ? "true" : "false");
      button.title = actionId ? `${gameInputActionLabels[actionId]}: ${listening ? "premi un tasto" : formatKeyboardKey(key)}` : "Input";
    });
    if (gameControls.inputMirror instanceof HTMLInputElement) gameControls.inputMirror.checked = getGameInputSettings().mirrorHorizontal;
    if (gameControls.inputStatus instanceof HTMLElement) {
      if (gameInputCapture?.actionId) {
        gameControls.inputStatus.textContent = `Premi il tasto per ${gameInputActionLabels[gameInputCapture.actionId]}.`;
      } else {
        gameControls.inputStatus.textContent = "Input salvato nella stanza. I tasti uguali vengono spostati da una sola azione.";
      }
    }
  };

  const setGameInputSettings = (patch = {}, { history = true } = {}) => {
    const current = getGameInputSettings();
    gameRoom = normalizeGameRoom({
      ...gameRoom,
      input: {
        ...current,
        ...patch,
        bindings: patch.bindings || current.bindings,
      },
    });
    saveGameRoom({ history });
    clearGamePreviewInput();
    syncGameInputControls();
    updateGamePreviewStatus();
  };

  const updateGameInputBinding = (actionId, slot, key) => {
    const normalizedKey = normalizeKeyboardKey(key);
    if (!actionId || !normalizedKey) return false;
    const current = getGameInputSettings();
    const bindings = cloneImageHistoryValue(current.bindings);
    gameInputActionIds.forEach((entryActionId) => {
      bindings[entryActionId] = (bindings[entryActionId] || []).filter((entryKey) => entryKey !== normalizedKey);
    });
    const actionKeys = bindings[actionId] || [];
    actionKeys[slot] = normalizedKey;
    bindings[actionId] = actionKeys.filter(Boolean).slice(0, 2);
    setGameInputSettings({ bindings });
    return true;
  };

  const cancelGameInputCapture = () => {
    if (!gameInputCapture) return false;
    gameInputCapture = null;
    syncGameInputControls();
    return true;
  };

  const handleGameInputCaptureKeyDown = (event) => {
    if (!gameInputCapture) return false;
    if (event.metaKey || event.ctrlKey) return false;
    event.preventDefault();
    event.stopPropagation();
    updateGameInputBinding(gameInputCapture.actionId, gameInputCapture.slot, event.key);
    gameInputCapture = null;
    syncGameInputControls();
    return true;
  };

  const getGameInputSettings = () => normalizeGameRoom(gameRoom).input;

  const formatGameInputActionKeys = (actionId) =>
    (getGameInputSettings().bindings[actionId] || []).map(formatKeyboardKey).join("/") || "-";

  const formatGameInputMovementSummary = () =>
    `Su ${formatGameInputActionKeys("move-up")} · Giù ${formatGameInputActionKeys("move-down")} · SX ${formatGameInputActionKeys("move-left")} · DX ${formatGameInputActionKeys("move-right")}`;

  const gameInputActionForKey = (key) => {
    const normalizedKey = normalizeKeyboardKey(key);
    if (!normalizedKey) return "";
    const input = getGameInputSettings();
    return gameInputActionIds.find((actionId) => input.bindings[actionId]?.includes(normalizedKey)) || "";
  };

  const normalizeGamePreviewAction = (key) => gameInputActionForKey(key);

  const keyboardTargetsTextInput = () => {
    const activeElement = document.activeElement;
    const activeTag = activeElement?.tagName;
    return activeElement instanceof HTMLElement && (
      activeElement.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)
    );
  };

  const getGamePreviewMoveVector = () => {
    let x = 0;
    let y = 0;
    if (gamePreviewPressedActions.has("move-left")) x -= 1;
    if (gamePreviewPressedActions.has("move-right")) x += 1;
    if (gamePreviewPressedActions.has("move-up")) y -= 1;
    if (gamePreviewPressedActions.has("move-down")) y += 1;
    const length = Math.hypot(x, y);
    return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
  };

  const setGamePreviewMotionState = (item, vectorX = 0, vectorY = 0, moving = true) => {
    const game = normalizeGameAsset(item?.game);
    if (!game.player) return;
    const state = getGamePreviewState(item);
    if (!state) return;
    const hasVector = Math.hypot(numeric(vectorX), numeric(vectorY)) > 0.01;
    const nextMoving = Boolean(moving && hasVector);
    const nextDirection = hasVector
      ? getGameDirectionFromVector(vectorX, vectorY, state.direction || "down")
      : state.direction || "down";
    const previousStateId = getSpriteDirectionalRuntimeStateId(item, state);
    state.direction = nextDirection;
    state.moving = nextMoving;
    const nextStateId = getSpriteDirectionalRuntimeStateId(item, state);
    if (previousStateId !== nextStateId) {
      resetSpriteRuntime(item.id);
      applySpriteFrame(item);
      syncSpriteLoop();
    }
  };

  const stopGamePreviewMotionState = (item) => {
    const state = getGamePreviewState(item);
    if (!state) return;
    setGamePreviewMotionState(item, 0, 0, false);
  };

  const clearGamePreviewPath = (state) => {
    if (!state) return;
    state.path = [];
  };

  const advanceGamePreviewPathTarget = (state) => {
    if (!state || !Array.isArray(state.path) || !state.path.length) return false;
    const next = state.path.shift();
    state.targetX = numeric(next.x, state.x);
    state.targetY = numeric(next.y, state.y);
    return true;
  };

  const setGamePreviewPath = (state, path) => {
    if (!state) return false;
    const waypoints = Array.isArray(path)
      ? path.filter((point) => Number.isFinite(Number(point?.x)) && Number.isFinite(Number(point?.y)))
      : [];
    if (!waypoints.length) {
      clearGamePreviewPath(state);
      return false;
    }
    const [first, ...rest] = waypoints;
    state.targetX = numeric(first.x, state.x);
    state.targetY = numeric(first.y, state.y);
    state.path = rest.map((point) => ({ x: numeric(point.x), y: numeric(point.y) }));
    return true;
  };

  const nudgeGamePreviewPlayer = () => {
    const player = getGamePreviewPlayer();
    const state = player ? getGamePreviewState(player) : null;
    const vector = getGamePreviewMoveVector();
    if (!player || !state || (!vector.x && !vector.y)) return false;
    clearGamePreviewPath(state);
    setGamePreviewFacing(player, vector.x);
    setGamePreviewMotionState(player, vector.x, vector.y, true);
    const game = normalizeGameAsset(player.game);
    const step = game.speed / 60;
    const nextPosition = constrainGamePreviewMovement(player, state.x + vector.x * step, state.y + vector.y * step, state);
    state.x = nextPosition.x;
    state.y = nextPosition.y;
    state.targetX = state.x;
    state.targetY = state.y;
    state.lastTime = window.performance.now();
    applyImageTransforms();
    return true;
  };

  const clearGamePreviewInput = () => {
    if (!gamePreviewPressedActions.size) return;
    gamePreviewPressedActions.clear();
    const player = getGamePreviewPlayer();
    const state = player ? getGamePreviewState(player) : null;
    if (state) {
      clearGamePreviewPath(state);
      state.targetX = state.x;
      state.targetY = state.y;
      state.lastTime = window.performance.now();
      stopGamePreviewMotionState(player);
    }
    updateGamePreviewStatus();
  };

  const getGamePreviewState = (item) => {
    if (!gamePreviewEnabled || !item?.id) return null;
    const game = normalizeGameAsset(item.game);
    if (!game.player) return null;
    if (!gamePreviewPositions.has(item.id)) {
      const initialPosition = getGamePreviewInitialPosition(item);
      gamePreviewPositions.set(item.id, {
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
    return gamePreviewPositions.get(item.id);
  };

  const setGamePreviewFacing = (item, directionX = 0) => {
    const game = normalizeGameAsset(item?.game);
    const input = getGameInputSettings();
    if (!input.mirrorHorizontal || !game.autoFlip || Math.abs(numeric(directionX)) <= 0.01) return;
    const state = getGamePreviewState(item);
    if (!state) return;
    state.facingX = numeric(directionX) < 0 ? -1 : 1;
  };

  const getGamePreviewFacingX = (item) => {
    const game = normalizeGameAsset(item?.game);
    const input = getGameInputSettings();
    if (!gamePreviewEnabled || !game.player || !game.autoFlip || !input.mirrorHorizontal) return 1;
    const sprite = normalizeSprite(item?.sprite, item?.src);
    if (sprite.directional.enabled && getSpriteFramesForState(sprite, "walk-left").length) return 1;
    const state = getGamePreviewState(item);
    return numeric(state?.facingX, 1) < 0 ? -1 : 1;
  };

  const getImageFullHeight = (item) => {
    const trim = getImageTrim(item);
    return trim.naturalHeight * (numeric(item?.width, 320) / Math.max(trim.naturalWidth, 1));
  };

  const getImageEffectiveZ = (item, renderOffsetY = 0) => {
    const baseZ = numeric(item?.z, 20);
    if (!normalizeGameAsset(item?.game).depthSort) return baseZ;
    const depthAnchorY = numeric(item?.y) + numeric(renderOffsetY) + getImageFullHeight(item);
    return Math.round(baseZ * 10000 + depthAnchorY);
  };

  const getImageEffectiveZAt = (item, index = 0, time = window.performance.now()) => {
    const renderState = getImageRenderState(item, index, time);
    return getImageEffectiveZ(item, renderState.y);
  };

  const getGamePreviewOffset = (item) => {
    const state = getGamePreviewState(item);
    if (!state) return { x: 0, y: 0 };
    return {
      x: numeric(state.x) - numeric(item.x),
      y: numeric(state.y) - numeric(item.y),
    };
  };

  const updateGamePreviewStatus = () => {
    if (gameControls.preview instanceof HTMLButtonElement) {
      gameControls.preview.textContent = gamePreviewEnabled ? "Stop anteprima" : "Anteprima cammina";
      gameControls.preview.setAttribute("aria-pressed", gamePreviewEnabled ? "true" : "false");
    }
    if (!(gameControls.status instanceof HTMLElement)) return;
    const player = getGamePreviewPlayer();
    if (!player) {
      gameControls.status.textContent = "Assegna un layer a Player principale per provare la camminata.";
      return;
    }
    const obstacleCount = getGameObstacleCount();
    const obstacleText = obstacleCount ? ` · ostacoli ${obstacleCount}` : "";
    const spawnText = getGameSpawn().enabled ? " · spawn attivo" : "";
    gameControls.status.textContent = gamePreviewEnabled
      ? `Clicca nel canvas per camminare, oppure usa input mappati: ${formatGameInputMovementSummary()}. Esc/Annulla ferma la preview${obstacleText}${spawnText}.`
      : `Player: ${gameRoleLabels[normalizeGameAsset(player.game).role]} · velocita ${formatGameSpeed(normalizeGameAsset(player.game).speed)}${obstacleText}${spawnText}.`;
  };

  const syncGamePreviewLoop = () => {
    if (!gamePreviewEnabled) {
      if (gamePreviewFrame) window.cancelAnimationFrame(gamePreviewFrame);
      gamePreviewFrame = 0;
      return;
    }
    if (gamePreviewFrame) return;
    const tick = (time) => {
      gamePreviewFrame = 0;
      let hasActiveMovement = false;
      const keyboardPlayer = getGamePreviewPlayer();
      const keyboardVector = getGamePreviewMoveVector();
      imageBoxes.forEach((item) => {
        const state = getGamePreviewState(item);
        if (!state) return;
        const game = normalizeGameAsset(item.game);
        const elapsed = clamp((time - numeric(state.lastTime, time)) / 1000, 0.001, 0.05);
        state.lastTime = time;
        if (keyboardPlayer?.id === item.id && (keyboardVector.x || keyboardVector.y)) {
          setGamePreviewFacing(item, keyboardVector.x);
          setGamePreviewMotionState(item, keyboardVector.x, keyboardVector.y, true);
          const nextPosition = constrainGamePreviewMovement(item, state.x + keyboardVector.x * game.speed * elapsed, state.y + keyboardVector.y * game.speed * elapsed, state, time);
          state.x = nextPosition.x;
          state.y = nextPosition.y;
          state.targetX = state.x;
          state.targetY = state.y;
          hasActiveMovement = true;
          return;
        }
        const dx = numeric(state.targetX) - numeric(state.x);
        const dy = numeric(state.targetY) - numeric(state.y);
        setGamePreviewFacing(item, dx);
        const distance = Math.hypot(dx, dy);
        if (distance <= 1) {
          state.x = state.targetX;
          state.y = state.targetY;
          if (advanceGamePreviewPathTarget(state)) {
            hasActiveMovement = true;
            return;
          }
          setGamePreviewMotionState(item, 0, 0, false);
          return;
        }
        setGamePreviewMotionState(item, dx, dy, true);
        const step = Math.min(distance, game.speed * elapsed);
        const previousX = state.x;
        const previousY = state.y;
        const nextPosition = constrainGamePreviewMovement(item, state.x + (dx / distance) * step, state.y + (dy / distance) * step, state, time);
        state.x = nextPosition.x;
        state.y = nextPosition.y;
        const didMove = Math.hypot(numeric(state.x) - numeric(previousX), numeric(state.y) - numeric(previousY)) > 0.1;
        if (!didMove || Math.hypot(numeric(state.x) - numeric(state.targetX), numeric(state.y) - numeric(state.targetY)) <= 1) {
          if (didMove && advanceGamePreviewPathTarget(state)) {
            hasActiveMovement = true;
          } else {
            clearGamePreviewPath(state);
            state.targetX = state.x;
            state.targetY = state.y;
            setGamePreviewMotionState(item, 0, 0, false);
          }
        }
        hasActiveMovement = hasActiveMovement || didMove;
      });
      applyImageTransforms(time);
      if (hasActiveMovement) gamePreviewFrame = window.requestAnimationFrame(tick);
    };
    gamePreviewFrame = window.requestAnimationFrame(tick);
  };

  const setGamePreviewEnabled = (enabled) => {
    gamePreviewEnabled = Boolean(enabled);
    root.classList.toggle("is-game-preview", gamePreviewEnabled);
    document.body.classList.toggle("image-board-game-preview", gamePreviewEnabled);
    if (gamePreviewEnabled) {
      hideImageContextMenu();
      setImagePathPicking(false);
      setGameWalkPicking(false);
      setGameSpawnPicking(false);
      setPublicMode(false);
    } else {
      gamePreviewPressedActions.clear();
    }
    clearImageShapeHover();
    updateGamePreviewStatus();
    applyCanvasBackground();
    renderImagePathOverlay();
    renderGameWalkOverlay();
    syncGamePreviewLoop();
    syncSpriteLoop();
    applyImageTransforms();
    syncInspectorDockState();
  };

  const resetGamePreview = () => {
    gamePreviewPositions.clear();
    updateGamePreviewStatus();
    syncSpriteLoop();
    applyImageTransforms();
  };

  const handleGamePreviewPointerDown = (event) => {
    if (!gamePreviewEnabled || event.button !== 0 || eventTargetsImageShapeUi(event)) return false;
    if (event.target instanceof Element && event.target.closest(".image-board-toolbar, .image-board-floating-panel, .image-board-layers-panel, .image-board-context-menu")) return false;
    const player = getGamePreviewPlayer();
    if (!player) {
      updateGamePreviewStatus();
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    const state = getGamePreviewState(player);
    if (!state) return true;
    const layerRect = imageLayer.getBoundingClientRect();
    const layerPageX = layerRect.left + window.scrollX;
    const layerPageY = layerRect.top + window.scrollY;
    const targetPosition = constrainGamePreviewPosition(
      player,
      event.pageX - layerPageX - numeric(player.width, 320) / 2,
      event.pageY - layerPageY - getImageFullHeight(player)
    );
    const path = findGamePreviewPath(
      player,
      { x: numeric(state.x), y: numeric(state.y) },
      targetPosition,
      window.performance.now()
    );
    if (!setGamePreviewPath(state, path)) {
      clearGamePreviewPath(state);
      state.targetX = state.x;
      state.targetY = state.y;
      state.lastTime = window.performance.now();
      stopGamePreviewMotionState(player);
      updateGamePreviewStatus();
      return true;
    }
    setGamePreviewFacing(player, numeric(state.targetX) - numeric(state.x));
    setGamePreviewMotionState(player, numeric(state.targetX) - numeric(state.x), numeric(state.targetY) - numeric(state.y), false);
    state.lastTime = window.performance.now();
    updateGamePreviewStatus();
    syncGamePreviewLoop();
    return true;
  };

  const handleGamePreviewKeyDown = (event) => {
    if (!gamePreviewEnabled || event.metaKey || event.ctrlKey || event.altKey || keyboardTargetsTextInput()) return false;
    const action = normalizeGamePreviewAction(event.key);
    if (event.key === "Escape" || action === "cancel") {
      event.preventDefault();
      setGamePreviewEnabled(false);
      return true;
    }
    if (!gameInputMovementActions.has(action)) {
      if (action === "action") {
        event.preventDefault();
        event.stopPropagation();
        updateGamePreviewStatus();
        return true;
      }
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    gamePreviewPressedActions.add(action);
    const player = getGamePreviewPlayer();
    const state = player ? getGamePreviewState(player) : null;
    if (state) {
      clearGamePreviewPath(state);
      state.targetX = state.x;
      state.targetY = state.y;
      state.lastTime = window.performance.now();
      stopGamePreviewMotionState(player);
    }
    nudgeGamePreviewPlayer();
    updateGamePreviewStatus();
    syncGamePreviewLoop();
    return true;
  };

  const handleGamePreviewKeyUp = (event) => {
    if (!gamePreviewEnabled) return false;
    const action = normalizeGamePreviewAction(event.key);
    if (!gameInputMovementActions.has(action) || !gamePreviewPressedActions.has(action)) return false;
    event.preventDefault();
    event.stopPropagation();
    gamePreviewPressedActions.delete(action);
    const player = getGamePreviewPlayer();
    const state = player ? getGamePreviewState(player) : null;
    if (state && !gamePreviewPressedActions.size) {
      state.targetX = state.x;
      state.targetY = state.y;
      state.lastTime = window.performance.now();
      stopGamePreviewMotionState(player);
    }
    updateGamePreviewStatus();
    syncGamePreviewLoop();
    return true;
  };

  const getImageRenderState = (item, index = 0, time = window.performance.now()) => {
    const game = normalizeGameAsset(item?.game);
    const gameRuntimePlayer = gamePreviewEnabled && game.player;
    const motion = gameRuntimePlayer ? { x: 0, y: 0, rotation: 0 } : getImageMotionState(item, index, time);
    const path = gameRuntimePlayer ? { x: 0, y: 0 } : getImagePathState(item, time);
    const parallax = normalizeImageParallax(item?.parallax);
    const parallaxX = parallaxIsActive(parallax) ? -parallaxCamera.x * parallax.depth : 0;
    const parallaxY = parallaxIsActive(parallax) ? -parallaxCamera.y * parallax.depth : 0;
    const publicDragOffset = gameRuntimePlayer ? { x: 0, y: 0 } : getPublicDragOffset(item?.id);
    const gamePreviewOffset = getGamePreviewOffset(item);
    return {
      x: motion.x + path.x + parallaxX + publicDragOffset.x + gamePreviewOffset.x,
      y: motion.y + path.y + parallaxY + publicDragOffset.y + gamePreviewOffset.y,
      rotation: motion.rotation,
    };
  };

  const applyImageBoxTransform = (box, item, index = 0, time = window.performance.now()) => {
    if (!(box instanceof HTMLElement)) return;
    const renderState = getImageRenderState(item, index, time);
    const x = numeric(item?.x) + renderState.x;
    const y = numeric(item?.y) + renderState.y;
    const rotation = numeric(item?.rotation) + renderState.rotation;
    box.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
    box.style.zIndex = String(getImageEffectiveZ(item, renderState.y));
    box.style.setProperty("--image-game-facing-x", String(getGamePreviewFacingX(item)));
  };

  const applyImageTransforms = (time = window.performance.now()) => {
    imageBoxes.forEach((item, index) => {
      applyImageBoxTransform(getImageBoxElement(item.id), item, index, time);
    });
  };

  const applySpriteFrame = (item, time = window.performance.now()) => {
    if (!spriteIsEnabled(item)) return;
    const box = getImageBoxElement(item.id);
    const image = box ? box.querySelector("img[data-sprite-frame-target]") : null;
    if (!(image instanceof HTMLImageElement)) return;
    const frame = getCurrentSpriteFrame(item, time);
    const frameSource = renderableImageSource(frame.src);
    if (frameSource && image.src !== frameSource) image.src = frameSource;
    const playback = getSpritePlayback(item, time);
    const sprite = playback.sprite;
    const frames = playback.frames;
    if (sprite.onion.enabled) {
      const frameIndex = getSpriteFrameIndex(item, time);
      const prev = box.querySelector(".uccelli-image-box__onion--prev");
      const next = box.querySelector(".uccelli-image-box__onion--next");
      const prevFrame = frames[(frameIndex - 1 + frames.length) % frames.length];
      const nextFrame = frames[(frameIndex + 1) % frames.length];
      if (prev instanceof HTMLImageElement && prevFrame?.src) prev.src = renderableImageSource(prevFrame.src);
      if (next instanceof HTMLImageElement && nextFrame?.src) next.src = renderableImageSource(nextFrame.src);
    }
    if (activeItem?.type === "image" && activeItem.id === item.id) {
      const index = getSpriteFrameIndex(item, time);
      setRangeValue("spriteFrame", `${index + 1}/${frames.length}`);
      if (spriteControls.frame instanceof HTMLInputElement) spriteControls.frame.value = String(index);
      if (spriteControls.strip instanceof HTMLElement) {
        spriteControls.strip.querySelectorAll(".image-board-sprite-frame-button").forEach((button, buttonIndex) => {
          button.classList.toggle("is-active", buttonIndex === index);
        });
      }
    }
  };

  const syncSpriteLoop = () => {
    const hasSpriteAnimation = imageBoxes.some(spriteIsAnimating);
    if (!hasSpriteAnimation) {
      if (spriteAnimationFrame) window.cancelAnimationFrame(spriteAnimationFrame);
      spriteAnimationFrame = 0;
      return;
    }
    if (spriteAnimationFrame) return;
    const tick = (time) => {
      spriteAnimationFrame = 0;
      imageBoxes.forEach((item) => applySpriteFrame(item, time));
      if (imageBoxes.some(spriteIsAnimating)) spriteAnimationFrame = window.requestAnimationFrame(tick);
    };
    spriteAnimationFrame = window.requestAnimationFrame(tick);
  };

  const syncImageMotionLoop = () => {
    const hasActiveMotion = imageBoxes.some((item) => motionIsActive(item.motion) || pathMotionIsActive(item));
    if (!hasActiveMotion) {
      if (imageMotionFrame) window.cancelAnimationFrame(imageMotionFrame);
      imageMotionFrame = 0;
      return;
    }
    if (imageMotionFrame) return;
    const tick = (time) => {
      imageMotionFrame = 0;
      applyImageTransforms(time);
      if (imageBoxes.some((item) => motionIsActive(item.motion) || pathMotionIsActive(item))) {
        imageMotionFrame = window.requestAnimationFrame(tick);
      }
    };
    imageMotionFrame = window.requestAnimationFrame(tick);
  };

  const stopPublicDragInertia = (id = "") => {
    if (id) publicDragInertiaItems.delete(String(id));
    if (!publicDragInertiaItems.size && publicDragInertiaFrame) {
      window.cancelAnimationFrame(publicDragInertiaFrame);
      publicDragInertiaFrame = 0;
    }
  };

  const markPublicDragClickSuppressed = (id = "") => {
    const now = Date.now();
    if (id) publicDragClickSuppressions.set(String(id), now);
    publicDragClickSuppressions.set("__global", now);
  };

  const publicDragClickIsSuppressed = (id = "") => {
    const now = Date.now();
    return (
      now - numeric(publicDragClickSuppressions.get(String(id)), 0) < 450 ||
      now - numeric(publicDragClickSuppressions.get("__global"), 0) < 280
    );
  };

  const syncPublicDragInertiaLoop = () => {
    if (!publicDragInertiaItems.size) {
      if (publicDragInertiaFrame) window.cancelAnimationFrame(publicDragInertiaFrame);
      publicDragInertiaFrame = 0;
      return;
    }
    if (publicDragInertiaFrame) return;
    const tick = (time) => {
      publicDragInertiaFrame = 0;
      publicDragInertiaItems.forEach((state, id) => {
        const item = imageBoxes.find((imageItem) => imageItem.id === id);
        if (!item || !publicDragIsActive(item)) {
          publicDragInertiaItems.delete(id);
          return;
        }
        const inertia = normalizePublicDrag(item.publicDrag).inertia;
        const elapsed = Math.max((time - numeric(state.time, time)) / 1000, 0);
        const dt = clamp(elapsed, 0.001, 0.032);
        const offset = getPublicDragOffset(id);
        const nextOffset = {
          x: offset.x + numeric(state.vx) * dt,
          y: offset.y + numeric(state.vy) * dt,
        };
        publicDragOffsets.set(id, nextOffset);
        const damping = Math.pow(inertia, Math.min(elapsed, 0.12) * 60);
        state.vx = numeric(state.vx) * damping;
        state.vy = numeric(state.vy) * damping;
        state.time = time;
        if (Math.hypot(state.vx, state.vy) < 8 || inertia <= 0.01) publicDragInertiaItems.delete(id);
      });
      applyImageTransforms(time);
      if (publicDragInertiaItems.size) publicDragInertiaFrame = window.requestAnimationFrame(tick);
    };
    publicDragInertiaFrame = window.requestAnimationFrame(tick);
  };

  const getImageStyleSnapshot = (item) => ({
    hoverEffect: normalizeHoverEffect(item.hoverEffect),
    clickEffect: normalizeClickEffect(item.clickEffect),
    linkUrl: normalizeImageLink(item.linkUrl),
    opacity: normalizeOpacity(item.opacity),
    blendMode: normalizeBlendMode(item.blendMode),
  });

  const getImageMotionSnapshot = (item) => ({
    motion: normalizeImageMotion(item.motion),
    pathMotion: normalizePathMotion(item.pathMotion),
  });

  const copySelectedImageStyle = () => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : getSelectedImages()[0];
    if (!item) return false;
    copiedImageStyle = getImageStyleSnapshot(item);
    return true;
  };

  const pasteImageStyleToSelection = () => {
    if (!copiedImageStyle) return false;
    return updateSelectedImages((item) => {
      Object.assign(item, copiedImageStyle);
    });
  };

  const copySelectedImageMotion = () => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : getSelectedImages()[0];
    if (!item) return false;
    copiedImageMotion = getImageMotionSnapshot(item);
    return true;
  };

  const pasteImageMotionToSelection = () => {
    if (!copiedImageMotion) return false;
    return updateSelectedImages((item) => {
      item.motion = normalizeImageMotion(copiedImageMotion.motion || copiedImageMotion);
      item.pathMotion = normalizePathMotion(copiedImageMotion.pathMotion);
    });
  };

  const stopSelectedImageMotion = () => updateSelectedImages((item) => {
    item.motion = { ...normalizeImageMotion(item.motion), preset: "none" };
    item.pathMotion = { ...normalizePathMotion(item.pathMotion), enabled: false };
  });

  const setSelectedParallaxEnabled = (enabled) => updateSelectedImages((item) => {
    item.parallax = { ...normalizeImageParallax(item.parallax), enabled };
  });

  const setSelectedPublicDragEnabled = (enabled) => updateSelectedImages((item) => {
    item.publicDrag = { ...normalizePublicDrag(item.publicDrag), enabled };
  });

  const setSelectedPathEnabled = (enabled) => updateSelectedImages((item) => {
    item.pathMotion = { ...normalizePathMotion(item.pathMotion), enabled };
  });

  const addPathPointToSelectedImages = () => updateSelectedImages((item) => {
    const pathMotion = normalizePathMotion(item.pathMotion);
    const points = pathMotion.points.slice();
    if (points.length >= 12) points.shift();
    points.push({
      x: Math.round(numeric(item.x)),
      y: Math.round(numeric(item.y)),
    });
    item.pathMotion = { ...pathMotion, points };
  });

  function syncImagePathPickButton() {
    const active = imagePathPicking && getSelectedImages().length > 0 && !publicMode;
    if (imagePathPicking !== active) imagePathPicking = active;
    root.classList.toggle("is-path-picking", imagePathPicking);
    if (imagePathAddPointButton instanceof HTMLButtonElement) {
      imagePathAddPointButton.textContent = imagePathPicking ? "Fine punti" : "Punto da canvas";
      imagePathAddPointButton.setAttribute("aria-pressed", imagePathPicking ? "true" : "false");
      imagePathAddPointButton.title = imagePathPicking
        ? "Clicca nel canvas per aggiungere punti al percorso"
        : "Attiva il posizionamento dei punti nel canvas";
    }
    if (imageStatus && imagePathPicking && !imageStatus.textContent.includes("punto canvas")) {
      imageStatus.textContent = `${imageStatus.textContent} · punto canvas`;
    }
  }

  function setImagePathPicking(enabled) {
    imagePathPicking = Boolean(enabled) && getSelectedImages().length > 0 && !publicMode;
    if (imagePathPicking) {
      hideImageContextMenu();
      clearImageShapeHover();
    }
    syncImagePathPickButton();
    updateImageToolState();
  }

  function addCanvasPathPointToSelectedImages(pageX, pageY) {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) {
      setImagePathPicking(false);
      return false;
    }
    const layerRect = imageLayer.getBoundingClientRect();
    const layerPageX = layerRect.left + window.scrollX;
    const layerPageY = layerRect.top + window.scrollY;
    const targetX = pageX - layerPageX;
    const targetY = pageY - layerPageY;
    selectedImages.forEach((item) => {
      const pathMotion = normalizePathMotion(item.pathMotion);
      const points = pathMotion.points.slice();
      if (!points.length) {
        points.push({ x: Math.round(numeric(item.x)), y: Math.round(numeric(item.y)) });
      }
      const anchor = getImagePathAnchorOffset(item);
      if (points.length >= 12) points.shift();
      points.push({
        x: Math.round(targetX - anchor.x),
        y: Math.round(targetY - anchor.y),
      });
      item.pathMotion = { ...pathMotion, enabled: true, points };
    });
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    syncImageMotionLoop();
    setImagePathPicking(true);
    return true;
  }

  const clearSelectedPathPoints = () => updateSelectedImages((item) => {
    item.pathMotion = { ...normalizePathMotion(item.pathMotion), enabled: false, points: [] };
  });

  const duplicateSelectedImages = () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return false;
    const maxZ = imageBoxes.length ? Math.max(...imageBoxes.map((item) => numeric(item.z, 20))) : 20;
    const nextIds = [];
    selectedImages.forEach((item, index) => {
      const clone = normalizeImageBox({
        ...item,
        id: `${namespace}-image-${Date.now()}-${imageCounter++}`,
        x: numeric(item.x) + 28 + index * 10,
        y: numeric(item.y) + 28 + index * 10,
        z: clamp(maxZ + index + 1, 0, 200),
      });
      imageBoxes.push(clone);
      nextIds.push(clone.id);
    });
    setSelectedImages(nextIds, nextIds.at(-1));
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const setSelectedHidden = (hidden) => updateSelectedImages((item) => {
    item.hidden = hidden;
  });

  const setSelectedLocked = (locked) => updateSelectedImages((item) => {
    item.locked = locked;
  });

  const moveSelectedToFront = () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return false;
    const maxZ = imageBoxes.length ? Math.max(...imageBoxes.map((item) => numeric(item.z, 20))) : 20;
    selectedImages
      .slice()
      .sort((first, second) => numeric(first.z, 20) - numeric(second.z, 20))
      .forEach((item, index) => {
        item.z = clamp(maxZ + index + 1, 0, 200);
      });
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const moveSelectedToBack = () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return false;
    const minZ = imageBoxes.length ? Math.min(...imageBoxes.map((item) => numeric(item.z, 20))) : 0;
    selectedImages
      .slice()
      .sort((first, second) => numeric(first.z, 20) - numeric(second.z, 20))
      .forEach((item, index) => {
        item.z = clamp(minZ - selectedImages.length + index, 0, 200);
      });
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
    return true;
  };

  const hideImageContextMenu = () => {
    if (imageContextMenu) imageContextMenu.hidden = true;
  };

  const openSpriteCutoutEditorForSelection = () => {
    const selection = getSelectedImages();
    if (!selection.length) return false;
    const preferredItem = selection.find(spriteIsEnabled) || selection[0];
    if (!preferredItem) return false;
    selectItem("image", preferredItem.id, { preserveSelection: selectedImageIds.has(preferredItem.id) });
    if (spriteIsEnabled(preferredItem)) setSpritePanelVisible(true);
    setCutoutPanelVisible(true);
    if (cutoutControls.apply instanceof HTMLButtonElement) cutoutControls.apply.focus({ preventScroll: true });
    return true;
  };

  const resetCutoutForSelectionFromContext = () => {
    const selection = getSelectedImages();
    if (!selection.some((item) => item.cutoutOriginalSrc || Array.isArray(item.cutoutOriginalSpriteFrames))) return false;
    resetCutoutForSelectedImages();
    return true;
  };

  const ensureImageContextMenu = () => {
    if (imageContextMenu) return imageContextMenu;
    const menu = document.createElement("div");
    menu.className = "image-board-context-menu";
    menu.hidden = true;
    menu.setAttribute("role", "menu");
    menu.addEventListener("pointerdown", (event) => event.stopPropagation());
    menu.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-image-context-action]") : null;
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      const action = button.dataset.imageContextAction || "";
      if (action === "duplicate") duplicateSelectedImages();
      if (action === "front") moveSelectedToFront();
      if (action === "back") moveSelectedToBack();
      if (action === "hide") setSelectedHidden(!getSelectedImages().every((item) => item.hidden));
      if (action === "lock") setSelectedLocked(!getSelectedImages().every((item) => item.locked));
      if (action === "copy-style") copySelectedImageStyle();
      if (action === "paste-style") pasteImageStyleToSelection();
      if (action === "copy-motion") copySelectedImageMotion();
      if (action === "paste-motion") pasteImageMotionToSelection();
      if (action === "stop-motion") stopSelectedImageMotion();
      if (action === "add-path-point") setImagePathPicking(true);
      if (action === "toggle-path") {
        setSelectedPathEnabled(!getSelectedImages().every((item) => normalizePathMotion(item.pathMotion).enabled));
      }
      if (action === "clear-path") clearSelectedPathPoints();
      if (action === "toggle-parallax") {
        setSelectedParallaxEnabled(!getSelectedImages().every((item) => parallaxIsActive(item.parallax)));
        applyImageTransforms();
      }
      if (action === "toggle-public-drag") {
        setSelectedPublicDragEnabled(!getSelectedImages().every((item) => normalizePublicDrag(item.publicDrag).enabled));
        applyImageTransforms();
      }
      if (action === "open-cutout-editor") openSpriteCutoutEditorForSelection();
      if (action === "reset-cutout") resetCutoutForSelectionFromContext();
      if (action === "select-all") {
        setSelectedImages(imageBoxes.map((item) => item.id), imageBoxes.at(-1)?.id);
        renderImageBoxes(false);
        renderLayersList();
        updateImageToolState();
      }
      if (action === "delete") deleteSelectedImages();
      hideImageContextMenu();
    });
    root.append(menu);
    imageContextMenu = menu;
    return menu;
  };

  const makeContextMenuButton = (action, label, options = {}) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `image-board-context-menu__item${options.danger ? " image-board-context-menu__item--danger" : ""}`;
    button.dataset.imageContextAction = action;
    button.textContent = label;
    button.disabled = Boolean(options.disabled);
    button.setAttribute("role", "menuitem");
    return button;
  };

  const makeContextMenuSeparator = () => {
    const separator = document.createElement("div");
    separator.className = "image-board-context-menu__separator";
    separator.setAttribute("role", "separator");
    return separator;
  };

  const showImageContextMenu = (event, hit = null) => {
    if (publicMode) return false;
    let selection = getSelectedImages();
    if (hit?.item) {
      if (!selectedImageIds.has(hit.item.id)) selectItem("image", hit.item.id);
      else selectItem("image", hit.item.id, { preserveSelection: true });
      selection = getSelectedImages();
    }
    if (!selection.length && !imageBoxes.length) return false;
    const menu = ensureImageContextMenu();
    const allHidden = selection.length > 0 && selection.every((item) => item.hidden);
    const allLocked = selection.length > 0 && selection.every((item) => item.locked);
    const allParallax = selection.length > 0 && selection.every((item) => parallaxIsActive(item.parallax));
    const allPublicDrag = selection.length > 0 && selection.every((item) => normalizePublicDrag(item.publicDrag).enabled);
    const allPath = selection.length > 0 && selection.every((item) => normalizePathMotion(item.pathMotion).enabled);
    const hasSprite = selection.some(spriteIsEnabled);
    const hasCutoutOriginal = selection.some((item) => item.cutoutOriginalSrc || Array.isArray(item.cutoutOriginalSpriteFrames));
    const countLabel = selection.length > 1 ? ` (${selection.length})` : "";
    menu.replaceChildren(
      makeContextMenuButton("duplicate", `Duplica${countLabel}`, { disabled: !selection.length }),
      makeContextMenuButton("front", "Porta davanti", { disabled: !selection.length }),
      makeContextMenuButton("back", "Porta dietro", { disabled: !selection.length }),
      makeContextMenuSeparator(),
      makeContextMenuButton("hide", allHidden ? "Mostra" : "Nascondi", { disabled: !selection.length }),
      makeContextMenuButton("lock", allLocked ? "Sblocca" : "Blocca", { disabled: !selection.length }),
      makeContextMenuSeparator(),
      makeContextMenuButton("open-cutout-editor", hasSprite ? "Scontorna sprite" : "Scontorna immagine", { disabled: !selection.length }),
      makeContextMenuButton("reset-cutout", "Ripristina scontorno", { disabled: !selection.length || !hasCutoutOriginal }),
      makeContextMenuSeparator(),
      makeContextMenuButton("copy-style", "Copia stile", { disabled: !selection.length }),
      makeContextMenuButton("paste-style", "Incolla stile", { disabled: !selection.length || !copiedImageStyle }),
      makeContextMenuSeparator(),
      makeContextMenuButton("copy-motion", "Copia movimento", { disabled: !selection.length }),
      makeContextMenuButton("paste-motion", "Incolla movimento", { disabled: !selection.length || !copiedImageMotion }),
      makeContextMenuButton("stop-motion", "Ferma movimento", { disabled: !selection.length || !selection.some((item) => motionIsActive(item.motion) || pathMotionIsActive(item)) }),
      makeContextMenuButton("add-path-point", "Punto da canvas", { disabled: !selection.length }),
      makeContextMenuButton("toggle-path", allPath ? "Disattiva percorso" : "Attiva percorso", { disabled: !selection.length }),
      makeContextMenuButton("clear-path", "Pulisci percorso", { disabled: !selection.length || !selection.some((item) => normalizePathMotion(item.pathMotion).points.length) }),
      makeContextMenuButton("toggle-parallax", allParallax ? "Disattiva parallasse" : "Attiva parallasse", { disabled: !selection.length }),
      makeContextMenuButton("toggle-public-drag", allPublicDrag ? "Disattiva drag pubblico" : "Attiva drag pubblico", { disabled: !selection.length }),
      makeContextMenuSeparator(),
      makeContextMenuButton("select-all", "Seleziona tutte", { disabled: !imageBoxes.length }),
      makeContextMenuButton("delete", `Elimina${countLabel}`, { disabled: !selection.length, danger: true }),
    );
    menu.hidden = false;
    const rect = menu.getBoundingClientRect();
    const x = clamp(event.clientX, 8, window.innerWidth - rect.width - 8);
    const y = clamp(event.clientY, 8, window.innerHeight - rect.height - 8);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    return true;
  };

  const computeImageTrim = (image, itemId = "") => {
    const naturalWidth = image.naturalWidth || 1;
    const naturalHeight = image.naturalHeight || 1;
    const canvas = document.createElement("canvas");
    canvas.width = naturalWidth;
    canvas.height = naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return { naturalWidth, naturalHeight, x: 0, y: 0, width: naturalWidth, height: naturalHeight };
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, naturalWidth, naturalHeight).data;
    let minX = naturalWidth;
    let minY = naturalHeight;
    let maxX = -1;
    let maxY = -1;
    const alphaMask = new Uint8Array(naturalWidth * naturalHeight);
    for (let y = 0; y < naturalHeight; y += 1) {
      for (let x = 0; x < naturalWidth; x += 1) {
        const pixelIndex = y * naturalWidth + x;
        const alpha = data[pixelIndex * 4 + 3];
        alphaMask[pixelIndex] = alpha;
        if (alpha <= 8) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (itemId) {
      imagePixelMasks.set(String(itemId), { naturalWidth, naturalHeight, alpha: alphaMask });
    }
    if (maxX < minX || maxY < minY) {
      return { naturalWidth, naturalHeight, x: 0, y: 0, width: naturalWidth, height: naturalHeight };
    }
    return {
      naturalWidth,
      naturalHeight,
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  };

  const scheduleImageTrim = (item, image) => {
    if (!item?.id || !(image instanceof HTMLImageElement) || pendingImageTrims.has(item.id)) return;
    pendingImageTrims.add(item.id);
    const clearPending = () => pendingImageTrims.delete(item.id);
    const applyTrim = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        clearPending();
        return;
      }
      window.requestAnimationFrame(() => {
        try {
          const nextTrim = computeImageTrim(image, item.id);
          const currentItem = imageBoxes.find((boxItem) => boxItem.id === item.id);
          if (!currentItem) return;
          const changed =
            !trimEquals(currentItem.trim, nextTrim) ||
            numeric(currentItem.naturalWidth, 0) !== nextTrim.naturalWidth ||
            numeric(currentItem.naturalHeight, 0) !== nextTrim.naturalHeight;
          if (!changed) return;
          currentItem.naturalWidth = nextTrim.naturalWidth;
          currentItem.naturalHeight = nextTrim.naturalHeight;
          currentItem.trim = nextTrim;
          saveImageBoxes({ history: false });
          renderImageBoxes(false);
          renderLayersList();
          if (activeItem?.type === "image" && activeItem.id === currentItem.id) {
            selectItem("image", currentItem.id, { preserveSelection: true });
          }
        } catch (error) {
          console.warn("Trim immagine non riuscito.", error);
        } finally {
          clearPending();
        }
      });
    };
    if (image.complete) applyTrim();
    else {
      image.addEventListener("load", applyTrim, { once: true });
      image.addEventListener("error", clearPending, { once: true });
    }
  };

  const setPublicMode = (enabled) => {
    publicMode = Boolean(enabled);
    if (publicMode) {
      hideImageContextMenu();
      setImagePathPicking(false);
      setGameWalkPicking(false);
      setGameSpawnPicking(false);
      closeEditorMenus();
      closeCommandPalette();
      setGamePreviewEnabled(false);
    }
    root.classList.toggle("is-public-mode", publicMode);
    document.body.classList.toggle("image-board-public-mode", publicMode);
    if (publicModeButton instanceof HTMLButtonElement) {
      publicModeButton.setAttribute("aria-pressed", publicMode ? "true" : "false");
    }
    resetLayerTriggers();
    applyCanvasBackground();
    renderImagePathOverlay();
    renderGameWalkOverlay();
    renderImageBoxes(false);
    updateGameSpawnStatus();
    updateImageToolState();
    syncInspectorDockState();
  };

  const cloneImageHistoryValue = (value) => JSON.parse(JSON.stringify(value));
  const queueImageHistoryAssetWrite = (key, value) => {
    if (imageHistoryAssetWriteKeys.has(key)) return;
    imageHistoryAssetWriteKeys.add(key);
    void writeImageAsset(key, value).catch(() => {
      imageHistoryAssetWriteKeys.delete(key);
    });
  };
  const replaceInlineImageAssetForHistory = (value) => {
    if (!isInlineImageSource(value)) return value;
    const key = imageAssetKeyFor(value);
    const reference = `${localImageAssetPrefix}${key}`;
    imageHistoryAssetCache.set(reference, value);
    queueImageHistoryAssetWrite(key, value);
    return reference;
  };
  const cloneImageForHistory = (item) => {
    const clone = cloneImageHistoryValue(item);
    clone.src = replaceInlineImageAssetForHistory(clone.src);
    if (clone.cutoutOriginalSrc) clone.cutoutOriginalSrc = replaceInlineImageAssetForHistory(clone.cutoutOriginalSrc);
    if (Array.isArray(clone.sprite?.frames)) {
      clone.sprite.frames = clone.sprite.frames.map((frame) => ({
        ...frame,
        src: replaceInlineImageAssetForHistory(frame.src),
      }));
    }
    if (clone.sprite?.states && typeof clone.sprite.states === "object") {
      Object.entries(clone.sprite.states).forEach(([stateId, frames]) => {
        if (!Array.isArray(frames)) return;
        clone.sprite.states[stateId] = frames.map((frame) => ({
          ...frame,
          src: replaceInlineImageAssetForHistory(frame.src),
        }));
      });
    }
    if (Array.isArray(clone.cutoutOriginalSpriteFrames)) {
      clone.cutoutOriginalSpriteFrames = clone.cutoutOriginalSpriteFrames.map((frame) => ({
        ...frame,
        src: replaceInlineImageAssetForHistory(frame.src),
      }));
    }
    return clone;
  };
  const resolveImageHistoryValue = async (value) => {
    if (imageHistoryAssetCache.has(value)) return imageHistoryAssetCache.get(value);
    if (isLocalImageAssetReference(value)) return await resolveLocalImageAsset(value) || value;
    return value;
  };
  const resolveImageHistoryItemAssets = async (item) => {
    const clone = cloneImageHistoryValue(item);
    clone.src = await resolveImageHistoryValue(clone.src);
    if (clone.cutoutOriginalSrc) clone.cutoutOriginalSrc = await resolveImageHistoryValue(clone.cutoutOriginalSrc);
    if (Array.isArray(clone.sprite?.frames)) {
      clone.sprite.frames = await Promise.all(clone.sprite.frames.map(async (frame) => ({
        ...frame,
        src: await resolveImageHistoryValue(frame.src),
      })));
      if (!clone.src && clone.sprite.frames[0]?.src) clone.src = clone.sprite.frames[0].src;
    }
    if (clone.sprite?.states && typeof clone.sprite.states === "object") {
      await Promise.all(Object.entries(clone.sprite.states).map(async ([stateId, frames]) => {
        if (!Array.isArray(frames)) return;
        clone.sprite.states[stateId] = await Promise.all(frames.map(async (frame) => ({
          ...frame,
          src: await resolveImageHistoryValue(frame.src),
        })));
      }));
    }
    if (Array.isArray(clone.cutoutOriginalSpriteFrames)) {
      clone.cutoutOriginalSpriteFrames = await Promise.all(clone.cutoutOriginalSpriteFrames.map(async (frame) => ({
        ...frame,
        src: await resolveImageHistoryValue(frame.src),
      })));
    }
    return clone;
  };
  const pruneImageHistoryAssetCache = () => {
    const snapshots = [lastImageHistorySnapshot, ...imageUndoStack, ...imageRedoStack].filter((snapshot) => typeof snapshot === "string");
    imageHistoryAssetCache.forEach((_, reference) => {
      if (!snapshots.some((snapshot) => snapshot.includes(reference))) imageHistoryAssetCache.delete(reference);
    });
  };
  const serializeImageHistoryState = () => JSON.stringify({
    images: imageBoxes.map(cloneImageForHistory),
    removedIds: removedImageIds.slice(-60),
    selectedIds: [...selectedImageIds],
    activeImageId: activeItem?.type === "image" ? activeItem.id : null,
    gameRoom: normalizeGameRoom(gameRoom),
  });
  const persistImageBoxes = () => {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      images: cloneImageHistoryValue(imageBoxes),
      removedIds: removedImageIds.slice(-60),
    };
    imagePersistQueue = imagePersistQueue
      .catch(() => {})
      .then(async () => {
        const preparedPayload = await prepareImagePayloadForLocalStorage(payload);
        try {
          writeJson(imageBoxesKey, preparedPayload);
          imagePersistWarningShown = false;
        } catch (error) {
          console.warn("Salvataggio immagini locale non riuscito.", error);
          if (!imagePersistWarningShown) {
            imagePersistWarningShown = true;
            if (imageStatus) imageStatus.textContent = "Salvataggio locale pieno: esporta pacchetto/HTML per sicurezza.";
          }
        }
      });
    return imagePersistQueue;
  };
  const updateImageHistoryButtons = () => {
    if (imageUndoButton instanceof HTMLButtonElement) imageUndoButton.disabled = imageUndoStack.length === 0;
    if (imageRedoButton instanceof HTMLButtonElement) imageRedoButton.disabled = imageRedoStack.length === 0;
  };
  const captureImageHistoryBaseline = () => {
    lastImageHistorySnapshot = serializeImageHistoryState();
    updateImageHistoryButtons();
  };
  const saveImageBoxes = ({ history = true } = {}) => {
    const nextSnapshot = serializeImageHistoryState();
    if (history && lastImageHistorySnapshot && nextSnapshot !== lastImageHistorySnapshot) {
      imageUndoStack.push(lastImageHistorySnapshot);
      if (imageUndoStack.length > imageHistoryLimit) imageUndoStack.shift();
      imageRedoStack = [];
    }
    persistImageBoxes();
    lastImageHistorySnapshot = nextSnapshot;
    pruneImageHistoryAssetCache();
    updateImageHistoryButtons();
  };
  const saveGameRoom = ({ history = true } = {}) => {
    gameRoom = normalizeGameRoom(gameRoom);
    const nextSnapshot = serializeImageHistoryState();
    if (history && lastImageHistorySnapshot && nextSnapshot !== lastImageHistorySnapshot) {
      imageUndoStack.push(lastImageHistorySnapshot);
      if (imageUndoStack.length > imageHistoryLimit) imageUndoStack.shift();
      imageRedoStack = [];
    }
    persistGameRoom();
    lastImageHistorySnapshot = nextSnapshot;
    updateImageHistoryButtons();
  };
  const pruneImageTransientState = () => {
    const availableIds = new Set(imageBoxes.map((item) => item.id));
    [publicDragOffsets, publicDragInertiaItems, publicDragClickSuppressions, clickEffectTimestamps, imagePixelMasks].forEach((map) => {
      map.forEach((_, id) => {
        if (!availableIds.has(id)) map.delete(id);
      });
    });
    [spriteRuntimeStarts, spriteMotionRuntime].forEach((map) => {
      map.forEach((_, key) => {
        const id = String(key).split(":")[0];
        if (!availableIds.has(id)) map.delete(key);
      });
    });
    [...pendingImageTrims].forEach((id) => {
      if (!availableIds.has(id)) pendingImageTrims.delete(id);
    });
    if (shapeHoverImageId && !availableIds.has(shapeHoverImageId)) shapeHoverImageId = null;
  };
  const hydrateImageBoxesFromLocalAssets = async () => {
    if (!imageBoxes.some(imageItemHasLocalAssetReferences)) return false;
    try {
      const activeImageId = activeItem?.type === "image" ? activeItem.id : null;
      const resolvedImages = await Promise.all(imageBoxes.map(resolveImageItemLocalAssets));
      imageBoxes = resolvedImages.map(normalizeImageBox).filter((item) => item.src);
      pruneImageTransientState();
      renderImageBoxes(false);
      renderLayersList();
      if (activeImageId && imageBoxes.some((item) => item.id === activeImageId)) {
        selectItem("image", activeImageId, { preserveSelection: true });
      } else if (imageBoardMode && !activeItem && imageBoxes[0]) {
        selectItem("image", imageBoxes[0].id);
      }
      updateImageToolState();
      captureImageHistoryBaseline();
      return true;
    } catch (error) {
      console.warn("Recupero asset immagini locali non riuscito.", error);
      return false;
    }
  };
  const hydrateGalleriesFromLocalAssets = async () => {
    if (!galleries.some(galleryHasLocalAssetReferences)) return false;
    try {
      const activeGalleryId = activeItem?.type === "gallery" ? activeItem.id : null;
      galleries = await Promise.all(galleries.map(resolveGalleryLocalAssets));
      galleries = galleries.map(normalizeGallery);
      renderGalleries(false);
      renderLayersList();
      if (activeGalleryId && galleries.some((gallery) => gallery.id === activeGalleryId)) {
        selectItem("gallery", activeGalleryId);
      }
      return true;
    } catch (error) {
      console.warn("Recupero asset gallerie locali non riuscito.", error);
      return false;
    }
  };
  const applyImageHistorySnapshot = async (snapshot) => {
    try {
      const state = JSON.parse(snapshot);
      const rawImages = Array.isArray(state.images) ? state.images : [];
      const resolvedImages = await Promise.all(rawImages.map(resolveImageHistoryItemAssets));
      imageBoxes = resolvedImages.map(normalizeImageBox).filter((item) => item.src);
      removedImageIds = normalizeRemovedIds(state.removedIds).slice(-60);
      gameRoom = normalizeGameRoom(state.gameRoom);
      const nextSelectedIds = Array.isArray(state.selectedIds) ? state.selectedIds : [];
      const nextActiveId = typeof state.activeImageId === "string" ? state.activeImageId : null;
      setSelectedImages(nextSelectedIds, nextActiveId);
      pruneImageTransientState();
      persistImageBoxes();
      persistGameRoom();
      lastImageHistorySnapshot = serializeImageHistoryState();
      hideImageContextMenu();
      setGameWalkPicking(false);
      setGameSpawnPicking(false);
      gameWalkSelectedPointIndex = -1;
      renderImageBoxes(false);
      renderLayersList();
      updateGameWalkStatus();
      updateGameSpawnStatus();
      renderGameWalkOverlay();
      updateImageToolState();
      pruneImageHistoryAssetCache();
    } catch (error) {
      console.warn("Cronologia immagini non applicabile.", error);
    } finally {
      updateImageHistoryButtons();
    }
  };
  const queueApplyImageHistorySnapshot = (snapshot) => {
    imageHistoryApplyQueue = imageHistoryApplyQueue.catch(() => {}).then(() => applyImageHistorySnapshot(snapshot));
    return imageHistoryApplyQueue;
  };
  const undoImageHistory = () => {
    if (!imageUndoStack.length) return false;
    imageRedoStack.push(serializeImageHistoryState());
    const previous = imageUndoStack.pop();
    updateImageHistoryButtons();
    void queueApplyImageHistorySnapshot(previous);
    return true;
  };
  const redoImageHistory = () => {
    if (!imageRedoStack.length) return false;
    imageUndoStack.push(serializeImageHistoryState());
    const next = imageRedoStack.pop();
    updateImageHistoryButtons();
    void queueApplyImageHistorySnapshot(next);
    return true;
  };
  const resetImageHistory = () => {
    imageUndoStack = [];
    imageRedoStack = [];
    captureImageHistoryBaseline();
    pruneImageHistoryAssetCache();
  };
  const persistGalleries = () => {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      galleries: cloneImageHistoryValue(galleries),
      removedIds: removedGalleryIds.slice(-60),
    };
    galleryPersistQueue = galleryPersistQueue
      .catch(() => {})
      .then(async () => {
        const preparedPayload = await prepareGalleryPayloadForLocalStorage(payload);
        try {
          writeJson(galleriesKey, preparedPayload);
        } catch (error) {
          console.warn("Salvataggio gallerie locale non riuscito.", error);
          if (imageStatus instanceof HTMLElement) imageStatus.textContent = "Salvataggio gallerie pieno: esporta pacchetto per sicurezza.";
        }
      });
    return galleryPersistQueue;
  };
  const saveGalleries = () => {
    persistGalleries();
  };

  const downloadJsonFile = (payload, filename) => {
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  };

  const packageAssetTypeFromDataUrl = (value) => {
    const match = String(value || "").match(/^data:([^;,]+)[;,]/);
    return match?.[1] || "image/png";
  };

  const packageAssetIdFor = (value) => `asset-${value.length}-${hashString(value)}`;

  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("Lettura asset non riuscita."));
    reader.readAsDataURL(blob);
  });

  const fetchPackableImageSource = async (value) => {
    if (typeof value !== "string" || !value || isInlineImageSource(value) || isLocalImageAssetReference(value)) return value;
    try {
      const sourceUrl = new URL(value, window.location.href);
      if (sourceUrl.origin !== window.location.origin) return value;
      const response = await fetch(sourceUrl.href, { cache: "no-store" });
      if (!response.ok) return value;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) return value;
      return await blobToDataUrl(await response.blob());
    } catch {
      return value;
    }
  };

  const createPackageAssetCollector = () => {
    const assets = [];
    const assetIdsByValue = new Map();
    const assetSources = new Map();
    const addAsset = async (value) => {
      if (assetSources.has(value)) return assetSources.get(value);
      const localResolvedValue = await resolveLocalImageAsset(value);
      const resolvedValue = await fetchPackableImageSource(localResolvedValue);
      if (!isInlineImageSource(resolvedValue)) return resolvedValue || value;
      if (assetIdsByValue.has(resolvedValue)) {
        const reference = `${packageImageAssetPrefix}${assetIdsByValue.get(resolvedValue)}`;
        assetSources.set(value, reference);
        return reference;
      }
      const id = packageAssetIdFor(resolvedValue);
      assetIdsByValue.set(resolvedValue, id);
      assets.push({
        id,
        type: packageAssetTypeFromDataUrl(resolvedValue),
        bytes: Math.round((resolvedValue.length * 3) / 4),
        data: resolvedValue,
      });
      const reference = `${packageImageAssetPrefix}${id}`;
      assetSources.set(value, reference);
      return reference;
    };
    return { assets, addAsset };
  };

  const replaceImageAssetFields = async (item, replacer) => {
    const clone = cloneImageHistoryValue(item);
    clone.src = await replacer(clone.src);
    if (clone.cutoutOriginalSrc) clone.cutoutOriginalSrc = await replacer(clone.cutoutOriginalSrc);
    if (Array.isArray(clone.sprite?.frames)) {
      clone.sprite.frames = await Promise.all(clone.sprite.frames.map(async (frame) => ({
        ...frame,
        src: await replacer(frame.src),
      })));
    }
    if (clone.sprite?.states && typeof clone.sprite.states === "object") {
      await Promise.all(Object.entries(clone.sprite.states).map(async ([stateId, frames]) => {
        if (!Array.isArray(frames)) return;
        clone.sprite.states[stateId] = await Promise.all(frames.map(async (frame) => ({
          ...frame,
          src: await replacer(frame.src),
        })));
      }));
    }
    if (Array.isArray(clone.cutoutOriginalSpriteFrames)) {
      clone.cutoutOriginalSpriteFrames = await Promise.all(clone.cutoutOriginalSpriteFrames.map(async (frame) => ({
        ...frame,
        src: await replacer(frame.src),
      })));
    }
    return clone;
  };

  const replaceGalleryAssetFields = async (gallery, replacer) => {
    const clone = cloneImageHistoryValue(gallery);
    if (Array.isArray(clone.images)) clone.images = await Promise.all(clone.images.map(replacer));
    return clone;
  };

  const createImageCanvasPackage = async () => {
    const collector = createPackageAssetCollector();
    const storedBackgroundImage = getBackgroundImageStorageValue();
    const backgroundImage = storedBackgroundImage ? await collector.addAsset(storedBackgroundImage) : "";
    const manifest = {
      version: 3,
      namespace,
      updatedAt: new Date().toISOString(),
      images: await Promise.all(imageBoxes.map((item) => replaceImageAssetFields(item, collector.addAsset))),
      removedIds: removedImageIds.slice(-60),
      galleries: await Promise.all(galleries.map((gallery) => replaceGalleryAssetFields(gallery, collector.addAsset))),
      removedGalleryIds: removedGalleryIds.slice(-60),
      background: normalizeCanvasBackground(canvasBackground),
      backgroundImage,
      gameRoom: normalizeGameRoom(gameRoom),
    };
    return {
      kind: "claudia-image-canvas-package",
      version: 3,
      exportedAt: new Date().toISOString(),
      assetStorage: "package",
      manifest,
      assets: collector.assets,
    };
  };

  const resolvePackageAssetValue = (value, assetMap) => {
    if (!isPackageImageAssetReference(value)) return value;
    const id = value.slice(packageImageAssetPrefix.length);
    return assetMap.get(id) || "";
  };

  const resolvePackageImageFields = async (item, assetMap) =>
    replaceImageAssetFields(item, (value) => Promise.resolve(resolvePackageAssetValue(value, assetMap)));

  const resolvePackageGalleryFields = async (gallery, assetMap) =>
    replaceGalleryAssetFields(gallery, (value) => Promise.resolve(resolvePackageAssetValue(value, assetMap)));

  const normalizeImportPackage = async (payload) => {
    const packagePayload = payload && typeof payload === "object" && payload.kind === "claudia-image-canvas-package";
    const assetMap = new Map();
    if (packagePayload && Array.isArray(payload.assets)) {
      payload.assets.forEach((asset) => {
        if (typeof asset?.id === "string" && typeof asset?.data === "string") assetMap.set(asset.id, asset.data);
      });
    }
    const manifest = packagePayload && payload.manifest && typeof payload.manifest === "object" ? payload.manifest : payload;
    const rawImages = Array.isArray(manifest)
      ? manifest
      : Array.isArray(manifest?.images)
        ? manifest.images
        : Array.isArray(manifest?.items)
          ? manifest.items
          : [];
    const rawGalleries = Array.isArray(manifest?.galleries) ? manifest.galleries : [];
    const images = packagePayload
      ? await Promise.all(rawImages.map((item) => resolvePackageImageFields(item, assetMap)))
      : rawImages;
    const nextGalleries = packagePayload
      ? await Promise.all(rawGalleries.map((gallery) => resolvePackageGalleryFields(gallery, assetMap)))
      : rawGalleries;
    const backgroundImage = packagePayload
      ? resolvePackageAssetValue(manifest?.backgroundImage, assetMap)
      : manifest?.backgroundImage || "";
    return {
      images,
      removedIds: normalizeRemovedIds(manifest?.removedIds),
      galleries: nextGalleries,
      removedGalleryIds: normalizeRemovedIds(manifest?.removedGalleryIds),
      background: normalizeCanvasBackground(Array.isArray(manifest) ? null : manifest?.background),
      backgroundImage,
      gameRoom: normalizeGameRoom(manifest?.gameRoom),
    };
  };

  const exportImageCanvasPackage = async () => {
    try {
      const payload = await createImageCanvasPackage();
      downloadJsonFile(payload, "canvas-immagini-package.json");
      if (imageStatus instanceof HTMLElement) {
        imageStatus.textContent = `Pacchetto esportato: ${payload.manifest.images.length} layer, ${payload.assets.length} asset.`;
      }
    } catch (error) {
      console.warn("Export pacchetto non riuscito.", error);
      alert(error.message || "Export pacchetto non riuscito.");
    }
  };

  const importImageCanvasPackage = async (file) => {
    const payload = JSON.parse(await file.text());
    const imported = await normalizeImportPackage(payload);
    if (!Array.isArray(imported.images)) throw new Error("JSON immagini non valido.");
    const nextImages = imported.images.map(normalizeImageBox).filter((item) => item.src);
    const nextGalleries = imported.galleries.map(normalizeGallery);
    imageBoxes = nextImages;
    galleries = nextGalleries;
    removedImageIds = imported.removedIds.slice(-60);
    removedGalleryIds = imported.removedGalleryIds.slice(-60);
    canvasBackground = normalizeCanvasBackground(imported.background);
    gameRoom = normalizeGameRoom(imported.gameRoom);
    await setBackgroundImageStorageValue(imported.backgroundImage || "");
    setSelectedImages(imageBoxes[0] ? [imageBoxes[0].id] : [], imageBoxes[0]?.id);
    pruneImageTransientState();
    resetImageHistory();
    saveImageBoxes();
    persistGameRoom();
    saveGalleries();
    applyCanvasBackground();
    applyBackgroundImage();
    syncCanvasBackgroundControls();
    gameWalkSelectedPointIndex = -1;
    hideImageContextMenu();
    renderImageBoxes(false);
    renderGalleries(false);
    renderLayersList();
    renderGameWalkOverlay();
    updateGameWalkStatus();
    updateGameSpawnStatus();
    updateImageToolState();
    if (imageStatus instanceof HTMLElement) {
      imageStatus.textContent = `Import completato: ${imageBoxes.length} layer immagine${imageBoxes.length === 1 ? "" : "i"}.`;
    }
  };

  const rememberRemovedImage = (id) => {
    if (typeof id !== "string" || !id) return;
    removedImageIds = normalizeRemovedIds([...removedImageIds, id]).slice(-60);
  };

  const rememberRemovedGallery = (id) => {
    if (typeof id !== "string" || !id) return;
    removedGalleryIds = normalizeRemovedIds([...removedGalleryIds, id]).slice(-60);
  };

  const defaultImageBox = (src) => ({
    id: `${namespace}-image-${Date.now()}-${imageCounter++}`,
    src,
    x: 120,
    y: window.scrollY + 140,
    width: 340,
    rotation: 0,
    z: 20,
    hoverEffect: imageBoardMode ? "lift" : "none",
    clickEffect: imageBoardMode ? "pulse" : "none",
    linkUrl: "",
    opacity: 1,
    blendMode: "normal",
    motion: { preset: "none", speed: 1, distance: 40 },
    parallax: { enabled: false, depth: 1 },
    publicDrag: { enabled: false, inertia: 0.88 },
    trigger: { action: "show", mode: "immediate", delay: 0, key: "Space", targetId: "" },
    pathMotion: { enabled: false, duration: 6, points: [] },
    hidden: false,
    locked: false,
  });

  const defaultSpriteBox = (frames) => {
    const normalizedFrames = frames.map(normalizeSpriteFrame).filter((frame) => frame.src);
    const firstFrame = normalizedFrames[0] || { src: "", name: "frame-1" };
    return {
      ...defaultImageBox(firstFrame.src),
      id: `${namespace}-sprite-${Date.now()}-${imageCounter++}`,
      width: 180,
      z: 48,
      hoverEffect: "glow",
      clickEffect: "pulse",
      linkUrl: "/sketches/",
      sprite: {
        enabled: normalizedFrames.length > 1,
        name: "idle",
        frames: normalizedFrames,
        fps: 8,
        loop: true,
        mode: "pingpong",
        playing: true,
        frameIndex: 0,
        anchor: "bottom-center",
        syncMotion: false,
        states: {},
        directional: {
          enabled: false,
          state: "idle-down",
        },
      },
    };
  };

  const makeSpriteFrames = (files, sources) => files.map((file, index) => ({
    src: sources[index] || "",
    name: String(file.name || `frame-${index + 1}`).replace(/\.[^.]+$/, "") || `frame-${index + 1}`,
  }));

  const defaultGallery = (images) => ({
    id: `${namespace}-gallery-${Date.now()}-${galleryCounter++}`,
    images,
    x: 130,
    y: window.scrollY + 160,
    width: 620,
    rotation: 0,
    z: 40,
    layout: "grid",
    columns: 3,
    gap: 10,
    fit: "cover",
    autoplay: false,
    interval: 4,
    click: "lightbox",
    activeIndex: 0,
  });

  const drawDemoImage = (index, mimeType) => {
    const canvas = document.createElement("canvas");
    canvas.width = 520;
    canvas.height = 380;
    const context = canvas.getContext("2d");
    if (!context) return "";

    const palettes = [
      ["#f7d7df", "#a7c7e7", "#1f1a17", "#ffffff"],
      ["#cce7c8", "#f6e6a8", "#21302d", "#ffffff"],
      ["#f2b6bf", "#cad3f2", "#171717", "#fbfaf7"],
      ["#fde2c8", "#b7dac4", "#4f3b32", "#ffffff"],
      ["#d9d2ee", "#f7c8c8", "#26212d", "#fbfaf7"],
      ["#d4ebe8", "#f1cf91", "#192726", "#ffffff"],
      ["#e7e2d6", "#a9bfd8", "#201b17", "#ffffff"],
      ["#f3c7a4", "#ccd9b8", "#2b211b", "#ffffff"],
    ];
    const palette = palettes[index % palettes.length];

    if (mimeType === "image/jpeg") {
      const background = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      background.addColorStop(0, palette[0]);
      background.addColorStop(1, palette[1]);
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(255, 255, 255, 0.72)";
      context.beginPath();
      context.roundRect(28, 28, 464, 324, 28);
      context.fill();
    }

    context.globalAlpha = 0.95;
    context.fillStyle = palette[3];
    for (let step = 0; step < 7; step += 1) {
      const x = 28 + ((step * 71 + index * 31) % 410);
      const y = 34 + ((step * 43 + index * 57) % 278);
      const width = 72 + ((step * 17 + index * 11) % 110);
      const height = 34 + ((step * 29 + index * 7) % 86);
      context.save();
      context.translate(x + width / 2, y + height / 2);
      context.rotate(((index + step) % 7 - 3) * 0.11);
      context.fillRect(-width / 2, -height / 2, width, height);
      context.restore();
    }

    context.globalAlpha = 0.9;
    const circleGradient = context.createRadialGradient(280, 180, 20, 280, 180, 210);
    circleGradient.addColorStop(0, palette[1]);
    circleGradient.addColorStop(1, palette[2]);
    context.fillStyle = circleGradient;
    context.beginPath();
    context.arc(260 + index * 6, 176 - index * 4, 82 + index * 3, 0, Math.PI * 2);
    context.fill();

    context.globalAlpha = 0.84;
    context.strokeStyle = palette[2];
    context.lineWidth = 5;
    context.beginPath();
    for (let point = 0; point < 9; point += 1) {
      const x = 52 + point * 52;
      const y = 256 + Math.sin(point * 0.9 + index) * 36;
      if (point === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();

    context.globalAlpha = 1;
    context.fillStyle = palette[2];
    context.font = "800 24px Inter, Arial, sans-serif";
    context.fillText(mimeType === "image/jpeg" ? "JPG" : "PNG", 32, 332);
    context.font = "700 15px Inter, Arial, sans-serif";
    context.fillText(`demo ${index + 1}`, 32, 354);

    return canvas.toDataURL(mimeType, 0.88);
  };

  const drawDemoSpriteFrame = (frameIndex) => {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 220;
    const context = canvas.getContext("2d");
    if (!context) return "";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(110, 116);
    const wobble = Math.sin(frameIndex * 0.9) * 7;
    const squash = 1 + Math.sin(frameIndex * 0.9) * 0.07;
    context.scale(1 / squash, squash);

    const body = context.createLinearGradient(-42, -48, 48, 50);
    body.addColorStop(0, "#f7d7df");
    body.addColorStop(1, "#315fce");
    context.fillStyle = body;
    context.beginPath();
    context.roundRect(-42 + wobble * 0.3, -48, 84, 96, 30);
    context.fill();

    context.fillStyle = "#fbfaf7";
    context.beginPath();
    context.arc(-14 + wobble * 0.2, -18, 9, 0, Math.PI * 2);
    context.arc(20 + wobble * 0.2, -18, 9, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#171717";
    context.beginPath();
    context.arc(-12 + wobble * 0.35, -17, 3.5, 0, Math.PI * 2);
    context.arc(22 + wobble * 0.35, -17, 3.5, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#171717";
    context.lineWidth = 6;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(-34, 42);
    context.lineTo(-50 - wobble, 78 + Math.cos(frameIndex) * 6);
    context.moveTo(34, 42);
    context.lineTo(54 + wobble, 76 - Math.cos(frameIndex) * 6);
    context.stroke();

    context.strokeStyle = "#bd4a5a";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(-28, 50);
    context.quadraticCurveTo(0, 68 + Math.sin(frameIndex) * 6, 30, 50);
    context.stroke();
    context.restore();
    return canvas.toDataURL("image/png");
  };

  const makeDemoSpriteBox = () => {
    const spriteFrames = Array.from({ length: 6 }, (_, frameIndex) => ({
      src: drawDemoSpriteFrame(frameIndex),
      name: `idle-${frameIndex + 1}`,
    }));
    return {
      ...defaultSpriteBox(spriteFrames),
      id: `${namespace}-demo-sprite-${Date.now()}-${imageCounter++}`,
      x: 760,
      y: 250,
      width: 190,
      rotation: 0,
      z: 52,
      linkUrl: "/sketches/",
      hoverEffect: "glow",
      clickEffect: "pulse",
      opacity: 1,
      blendMode: "normal",
      motion: { preset: "float", speed: 1.1, distance: 12 },
      parallax: { enabled: true, depth: 0.35 },
      publicDrag: { enabled: true, inertia: 0.9 },
      pathMotion: { enabled: true, duration: 8, points: [{ x: 760, y: 250 }, { x: 804, y: 224 }, { x: 848, y: 260 }] },
      sprite: {
        enabled: true,
        name: "idle",
        frames: spriteFrames,
        fps: 8,
        loop: true,
        mode: "pingpong",
        playing: true,
        frameIndex: 0,
        anchor: "bottom-center",
      },
      hidden: false,
      locked: false,
    };
  };

  const makeDemoImageBoxes = () => {
    const demoSiteLinks = [
      "/bio/",
      "/scritture/",
      "/collages/",
      "/sketches/",
      "/il-vizio-della-scrittura/",
      "/ispirazioni/",
      "/ricerche/",
      "/contatti/",
    ];
    const demos = [
      { mimeType: "image/jpeg", x: 88, y: 210, width: 270, rotation: -4, z: 24, hoverEffect: "lift", clickEffect: "pulse", opacity: 1, blendMode: "normal", motion: { preset: "float", speed: 0.8, distance: 16 }, parallax: { enabled: true, depth: 0.25 }, publicDrag: { enabled: true, inertia: 0.9 }, pathMotion: { enabled: true, duration: 7, points: [{ x: 88, y: 210 }, { x: 164, y: 258 }, { x: 112, y: 326 }] } },
      { mimeType: "image/png", x: 260, y: 226, width: 260, rotation: 3, z: 31, hoverEffect: "zoom", clickEffect: "pop", opacity: 0.86, blendMode: "multiply", motion: { preset: "drift-x", speed: 0.7, distance: 22 }, parallax: { enabled: true, depth: 0.55 }, publicDrag: { enabled: true, inertia: 0.86 }, pathMotion: { enabled: true, duration: 9, points: [{ x: 260, y: 226 }, { x: 372, y: 212 }, { x: 344, y: 328 }, { x: 250, y: 302 }] } },
      { mimeType: "image/jpeg", x: 448, y: 198, width: 280, rotation: -2, z: 28, hoverEffect: "tilt", clickEffect: "flash", opacity: 0.92, blendMode: "screen", motion: { preset: "orbit", speed: 0.45, distance: 18 }, parallax: { enabled: true, depth: 0.4 }, publicDrag: { enabled: false, inertia: 0.88 }, pathMotion: { enabled: false, duration: 6, points: [{ x: 448, y: 198 }, { x: 526, y: 246 }] } },
      { mimeType: "image/png", x: 170, y: 464, width: 288, rotation: 5, z: 36, hoverEffect: "glow", clickEffect: "spin", opacity: 0.78, blendMode: "overlay", motion: { preset: "sway", speed: 0.9, distance: 34 }, parallax: { enabled: true, depth: 0.9 }, publicDrag: { enabled: true, inertia: 0.94 }, pathMotion: { enabled: true, duration: 10, points: [{ x: 170, y: 464 }, { x: 94, y: 556 }, { x: 252, y: 624 }] } },
      { mimeType: "image/jpeg", x: 374, y: 438, width: 274, rotation: -6, z: 33, hoverEffect: "gray-color", clickEffect: "open-link", opacity: 0.9, blendMode: "darken", motion: { preset: "none", speed: 1, distance: 40 }, parallax: { enabled: true, depth: 0.7 }, publicDrag: { enabled: true, inertia: 0.82 }, pathMotion: { enabled: false, duration: 8, points: [] } },
      { mimeType: "image/png", x: 586, y: 468, width: 260, rotation: 4, z: 42, hoverEffect: "opacity", clickEffect: "bring-front", opacity: 0.74, blendMode: "lighten", motion: { preset: "scroll-left", speed: 0.35, distance: 28 }, parallax: { enabled: true, depth: 1.2 }, publicDrag: { enabled: true, inertia: 0.9 }, pathMotion: { enabled: true, duration: 12, points: [{ x: 586, y: 468 }, { x: 684, y: 520 }, { x: 618, y: 650 }] } },
      { mimeType: "image/jpeg", x: 280, y: 710, width: 300, rotation: -3, z: 22, hoverEffect: "paper", clickEffect: "lock-toggle", opacity: 0.84, blendMode: "difference", motion: { preset: "drift-y", speed: 0.55, distance: 18 }, parallax: { enabled: true, depth: 0.15 }, publicDrag: { enabled: false, inertia: 0.88 }, pathMotion: { enabled: false, duration: 6, points: [{ x: 280, y: 710 }, { x: 338, y: 776 }] } },
      { mimeType: "image/png", x: 520, y: 742, width: 280, rotation: 2, z: 26, hoverEffect: "none", clickEffect: "none", opacity: 0.88, blendMode: "luminosity", motion: { preset: "none", speed: 1, distance: 40 }, parallax: { enabled: false, depth: 1 }, publicDrag: { enabled: true, inertia: 0.96 }, pathMotion: { enabled: false, duration: 6, points: [] } },
    ];

    const imageDemos = demos.map((demo, index) => ({
      id: `${namespace}-demo-${Date.now()}-${index}-${imageCounter++}`,
      src: drawDemoImage(index, demo.mimeType),
      x: demo.x,
      y: demo.y,
      width: demo.width,
      rotation: demo.rotation,
      z: demo.z,
      hoverEffect: demo.hoverEffect,
      clickEffect: demo.clickEffect,
      linkUrl: demoSiteLinks[index] || "/",
      opacity: demo.opacity,
      blendMode: demo.blendMode,
      motion: demo.motion,
      parallax: demo.parallax,
      publicDrag: demo.publicDrag,
      pathMotion: demo.pathMotion,
      hidden: false,
      locked: false,
    }));

    imageDemos.push(makeDemoSpriteBox());

    return imageDemos;
  };

  const ensureDemoLinks = () => {
    if (!imageBoardMode || !imageBoxes.length) return false;
    const demoSiteLinks = [
      "/bio/",
      "/scritture/",
      "/collages/",
      "/sketches/",
      "/il-vizio-della-scrittura/",
      "/ispirazioni/",
      "/ricerche/",
      "/contatti/",
    ];
    const demoLayerStyles = [
      { opacity: 1, blendMode: "normal" },
      { opacity: 0.86, blendMode: "multiply" },
      { opacity: 0.92, blendMode: "screen" },
      { opacity: 0.78, blendMode: "overlay" },
      { opacity: 0.9, blendMode: "darken" },
      { opacity: 0.74, blendMode: "lighten" },
      { opacity: 0.84, blendMode: "difference" },
      { opacity: 0.88, blendMode: "luminosity" },
    ];
    const demoParallaxStyles = [
      { enabled: true, depth: 0.25 },
      { enabled: true, depth: 0.55 },
      { enabled: true, depth: 0.4 },
      { enabled: true, depth: 0.9 },
      { enabled: true, depth: 0.7 },
      { enabled: true, depth: 1.2 },
      { enabled: true, depth: 0.15 },
      { enabled: false, depth: 1 },
    ];
    const demoPublicDragStyles = [
      { enabled: true, inertia: 0.9 },
      { enabled: true, inertia: 0.86 },
      { enabled: false, inertia: 0.88 },
      { enabled: true, inertia: 0.94 },
      { enabled: true, inertia: 0.82 },
      { enabled: true, inertia: 0.9 },
      { enabled: false, inertia: 0.88 },
      { enabled: true, inertia: 0.96 },
    ];
    const demoPathStyles = [
      { enabled: true, duration: 7, points: [{ x: 88, y: 210 }, { x: 164, y: 258 }, { x: 112, y: 326 }] },
      { enabled: true, duration: 9, points: [{ x: 260, y: 226 }, { x: 372, y: 212 }, { x: 344, y: 328 }, { x: 250, y: 302 }] },
      { enabled: false, duration: 6, points: [{ x: 448, y: 198 }, { x: 526, y: 246 }] },
      { enabled: true, duration: 10, points: [{ x: 170, y: 464 }, { x: 94, y: 556 }, { x: 252, y: 624 }] },
      { enabled: false, duration: 8, points: [] },
      { enabled: true, duration: 12, points: [{ x: 586, y: 468 }, { x: 684, y: 520 }, { x: 618, y: 650 }] },
      { enabled: false, duration: 6, points: [{ x: 280, y: 710 }, { x: 338, y: 776 }] },
      { enabled: false, duration: 6, points: [] },
    ];
    const shouldApplyDemoLayerStyles = readStorageValue(demoLayerStyleKey, "") !== "1";
    const shouldApplyDemoParallaxStyles = readStorageValue(demoParallaxStyleKey, "") !== "1";
    const shouldApplyDemoPublicDragStyles = readStorageValue(demoPublicDragStyleKey, "") !== "1";
    const shouldApplyDemoPathStyles = readStorageValue(demoPathStyleKey, "") !== "1";
    let foundDemo = false;
    let changed = false;
    imageBoxes.forEach((item, index) => {
      if (!String(item.id || "").startsWith(`${namespace}-demo-`)) return;
      foundDemo = true;
      if (!normalizeImageLink(item.linkUrl)) {
        item.linkUrl = demoSiteLinks[index % demoSiteLinks.length];
        changed = true;
      }
      if (shouldApplyDemoLayerStyles) {
        const demoLayerStyle = demoLayerStyles[index % demoLayerStyles.length];
        item.opacity = demoLayerStyle.opacity;
        item.blendMode = demoLayerStyle.blendMode;
        item.hidden = false;
        changed = true;
      }
      if (shouldApplyDemoParallaxStyles) {
        item.parallax = demoParallaxStyles[index % demoParallaxStyles.length];
        changed = true;
      }
      if (shouldApplyDemoPublicDragStyles) {
        item.publicDrag = demoPublicDragStyles[index % demoPublicDragStyles.length];
        changed = true;
      }
      if (shouldApplyDemoPathStyles) {
        item.pathMotion = demoPathStyles[index % demoPathStyles.length];
        changed = true;
      }
      const normalizedClick = normalizeClickEffect(item.clickEffect);
      if (item.clickEffect !== normalizedClick) {
        item.clickEffect = normalizedClick;
        changed = true;
      }
    });
    if (foundDemo && shouldApplyDemoLayerStyles) tryWriteStorageValue(demoLayerStyleKey, "1", "Flag demo");
    if (foundDemo && shouldApplyDemoParallaxStyles) tryWriteStorageValue(demoParallaxStyleKey, "1", "Flag demo");
    if (foundDemo && shouldApplyDemoPublicDragStyles) tryWriteStorageValue(demoPublicDragStyleKey, "1", "Flag demo");
    if (foundDemo && shouldApplyDemoPathStyles) tryWriteStorageValue(demoPathStyleKey, "1", "Flag demo");
    const hasDemoSprite = imageBoxes.some((item) => {
      const itemId = String(item.id || "");
      return itemId.startsWith(`${namespace}-demo-sprite-`) || (itemId.startsWith(`${namespace}-demo-`) && spriteIsEnabled(item));
    });
    const shouldSeedDemoSprite = readStorageValue(demoSpriteSeedKey, "") !== "1";
    if (foundDemo && shouldSeedDemoSprite && !hasDemoSprite) {
      imageBoxes.push(makeDemoSpriteBox());
      changed = true;
    }
    if (foundDemo && shouldSeedDemoSprite) tryWriteStorageValue(demoSpriteSeedKey, "1", "Flag demo");
    if (changed) saveImageBoxes();
    return changed;
  };

  function seedDemoImages(force = false, renderNow = true) {
    if (!imageBoardMode) return false;
    if (!force && imageBoxes.length) return false;
    if (!force && readStorageValue(demoSeedKey, "") === "1") return false;

    imageBoxes = makeDemoImageBoxes();
    removedImageIds = [];
    selectedImageIds.clear();
    activeItem = null;
    tryWriteStorageValue(demoSeedKey, "1", "Flag demo");
    tryWriteStorageValue(demoLayerStyleKey, "1", "Flag demo");
    tryWriteStorageValue(demoParallaxStyleKey, "1", "Flag demo");
    tryWriteStorageValue(demoPublicDragStyleKey, "1", "Flag demo");
    tryWriteStorageValue(demoPathStyleKey, "1", "Flag demo");
    tryWriteStorageValue(demoSpriteSeedKey, "1", "Flag demo");
    if (!readStorageValue(canvasBackgroundKey, "")) applyDemoBackground();
    saveImageBoxes();

    if (renderNow) {
      renderImageBoxes(false);
      renderLayersList();
      if (imageBoxes[0]) selectItem("image", imageBoxes[0].id);
    }
    return true;
  }

  const updatePanelControl = (control, value) => {
    if (!control) return;
    if (control.type === "checkbox") {
      control.checked = Boolean(value);
    } else {
      control.value = String(value);
    }
  };

  const selectItem = (type, id, options = {}) => {
    if (type === "image") {
      const nextSelectedIds = new Set(selectedImageIds);
      if (options.toggle) {
        if (nextSelectedIds.has(id)) nextSelectedIds.delete(id);
        else nextSelectedIds.add(id);
        setSelectedImages(nextSelectedIds, nextSelectedIds.has(id) ? id : null);
      } else if (options.additive) {
        nextSelectedIds.add(id);
        setSelectedImages(nextSelectedIds, id);
      } else if (options.preserveSelection && selectedImageIds.has(id)) {
        setSelectedImages(selectedImageIds, id);
      } else {
        setSelectedImages([id], id);
      }
    } else {
      selectedImageIds.clear();
      activeItem = { type, id };
    }
    root.querySelectorAll(".uccelli-image-box, .uccelli-gallery-box").forEach((element) => {
      const selectedImage = element.dataset.itemType === "image" && selectedImageIds.has(element.dataset.itemId || "");
      const selectedOther = element.dataset.itemType === type && type !== "image" && element.dataset.itemId === id;
      element.classList.toggle("is-active", selectedImage || selectedOther);
    });
    renderImagePathOverlay();
    const imageBox = activeItem?.type === "image" ? imageBoxes.find((item) => item.id === activeItem.id) : null;
    const gallery = type === "gallery" ? galleries.find((item) => item.id === id) : null;
    if (imageBox) {
      const imageMotion = normalizeImageMotion(imageBox.motion);
      const imageParallax = normalizeImageParallax(imageBox.parallax);
      const imagePublicDrag = normalizePublicDrag(imageBox.publicDrag);
      const imagePath = normalizePathMotion(imageBox.pathMotion);
      const imageSprite = normalizeSprite(imageBox.sprite, imageBox.src);
      updatePanelControl(imageZInput, imageBox.z);
      updatePanelControl(imageHoverEffectInput, normalizeHoverEffect(imageBox.hoverEffect));
      updatePanelControl(imageClickEffectInput, normalizeClickEffect(imageBox.clickEffect));
      updatePanelControl(imageMotionPresetInput, imageMotion.preset);
      updatePanelControl(imageMotionSpeedInput, imageMotion.speed);
      updatePanelControl(imageMotionDistanceInput, imageMotion.distance);
      updatePanelControl(imageParallaxEnabledInput, imageParallax.enabled);
      updatePanelControl(imageParallaxDepthInput, imageParallax.depth);
      updatePanelControl(imagePublicDragEnabledInput, imagePublicDrag.enabled);
      updatePanelControl(imagePublicDragInertiaInput, imagePublicDrag.inertia);
      updatePanelControl(imagePathEnabledInput, imagePath.enabled);
      updatePanelControl(imagePathDurationInput, imagePath.duration);
      updatePanelControl(spriteControls.fps, imageSprite.fps);
      updatePanelControl(spriteControls.loop, imageSprite.loop);
      updatePanelControl(spriteControls.mode, imageSprite.mode);
      updatePanelControl(spriteControls.syncMotion, imageSprite.syncMotion);
      updatePanelControl(spriteControls.directionalEnabled, imageSprite.directional.enabled);
      updatePanelControl(spriteControls.directionState, imageSprite.directional.state);
      updatePanelControl(spriteControls.frame, imageSprite.frameIndex);
      if (spriteControls.frame instanceof HTMLInputElement) {
        const editorFrameCount = Math.max(getSpriteEditorFrames(imageSprite).length, 1);
        spriteControls.frame.max = String(Math.max(editorFrameCount - 1, 0));
        spriteControls.frame.value = String(clamp(imageSprite.frameIndex, 0, editorFrameCount - 1));
      }
      if (spriteControls.play instanceof HTMLButtonElement) spriteControls.play.textContent = imageSprite.playing ? "Pausa" : "Play";
      if (spriteControls.directionStatus instanceof HTMLElement) spriteControls.directionStatus.textContent = getSpriteDirectionStatusText(imageSprite);
      updatePanelControl(imageLinkInput, normalizeImageLink(imageBox.linkUrl));
      updatePanelControl(imageLinkPresetInput, normalizeImageLink(imageBox.linkUrl));
      updatePanelControl(imageOpacityInput, Math.round(normalizeOpacity(imageBox.opacity) * 100));
      updatePanelControl(imageBlendInput, normalizeBlendMode(imageBox.blendMode));
      setRangeValue("z", numeric(imageBox.z, 20));
      setRangeValue("opacity", Math.round(normalizeOpacity(imageBox.opacity) * 100), "%");
      setRangeValue("motionSpeed", formatMotionSpeed(imageMotion.speed));
      setRangeValue("motionDistance", imageMotion.distance, "px");
      setRangeValue("parallaxDepth", formatParallaxDepth(imageParallax.depth));
      setRangeValue("publicDragInertia", formatPublicDragInertia(imagePublicDrag.inertia));
      setRangeValue("pathDuration", formatPathDuration(imagePath.duration));
      setRangeValue("pathPoints", imagePath.points.length, imagePath.points.length === 1 ? " punto" : " punti");
      setRangeValue("spriteFps", imageSprite.enabled ? imageSprite.fps : 8);
      if (imageSprite.enabled) {
        const editorFrameCount = Math.max(getSpriteEditorFrames(imageSprite).length, 1);
        setRangeValue("spriteFrame", `${clamp(imageSprite.frameIndex, 0, editorFrameCount - 1) + 1}/${editorFrameCount}`);
      } else {
        setRangeValue("spriteFrame", "1/1");
      }
    }
    if (gallery) {
      updatePanelControl(galleryControls.layout, gallery.layout);
      updatePanelControl(galleryControls.columns, gallery.columns);
      updatePanelControl(galleryControls.gap, gallery.gap);
      updatePanelControl(galleryControls.fit, gallery.fit);
      updatePanelControl(galleryControls.autoplay, gallery.autoplay);
      updatePanelControl(galleryControls.interval, gallery.interval);
      updatePanelControl(galleryControls.click, gallery.click);
      updatePanelControl(galleryControls.z, gallery.z);
      setRangeValue("columns", gallery.columns);
      setRangeValue("gap", gallery.gap, "px");
      setRangeValue("interval", gallery.interval, "s");
      setRangeValue("z", gallery.z);
    }
    renderLayersList();
    updateImageToolState();
  };

  const ensurePageSpace = (item) => {
    const bottom = numeric(item.y) + Math.max(numeric(item.width) * 0.7, 240);
    const desiredSpace = Math.ceil(bottom - window.innerHeight + 260);
    const currentSpace = numeric(getSettings().bottomSpace, 1200);
    if (desiredSpace > currentSpace) {
      setSettings({ bottomSpace: desiredSpace });
      document.documentElement.style.setProperty("--uccelli-bottom-space", `${desiredSpace}px`);
      document.body.style.setProperty("--uccelli-bottom-space", `${desiredSpace}px`);
      const panelInput = root.querySelector('[data-style-control="bottomSpace"]');
      if (panelInput) {
        panelInput.value = String(clamp(desiredSpace, 0, 24000));
        panelInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  const makeHandle = (className, label, title) => {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = className;
    handle.textContent = label;
    handle.title = title;
    return handle;
  };

  const stopHandlePointer = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const startPointerTransform = (event, item, type, mode) => {
    if (publicMode) return;
    if (type === "image" && item.locked) {
      event.preventDefault();
      event.stopPropagation();
      selectItem(type, item.id, { preserveSelection: selectedImageIds.has(item.id) });
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const startX = event.pageX;
    const startY = event.pageY;
    const originX = numeric(item.x);
    const originY = numeric(item.y);
    const startWidth = numeric(item.width, 320);
    const centerX = originX + startWidth / 2;
    const centerY = originY + startWidth / 3;
    const moveGroup =
      type === "image" &&
      mode === "move" &&
      selectedImageIds.has(item.id) &&
      getSelectedImages().length > 1;
    const groupOrigins = moveGroup
      ? getSelectedImages()
          .filter((selectedItem) => !selectedItem.locked)
          .map((selectedItem) => ({
            item: selectedItem,
            x: numeric(selectedItem.x),
            y: numeric(selectedItem.y),
          }))
      : [];
    const saveItems = type === "image" ? saveImageBoxes : saveGalleries;
    const renderItems = type === "image" ? renderImageBoxes : renderGalleries;
    let hasMoved = false;

    const movePointer = (moveEvent) => {
      hasMoved = hasMoved || Math.hypot(moveEvent.pageX - startX, moveEvent.pageY - startY) > 5;
      if (mode === "move") {
        const snapSettings = readSnapSettings();
        const nextX = snapNumber(originX + moveEvent.pageX - startX, snapSettings, moveEvent);
        const nextY = snapNumber(originY + moveEvent.pageY - startY, snapSettings, moveEvent);
        if (moveGroup && groupOrigins.length) {
          const deltaX = nextX - originX;
          const deltaY = nextY - originY;
          groupOrigins.forEach((origin) => {
            origin.item.x = origin.x + deltaX;
            origin.item.y = origin.y + deltaY;
          });
        } else {
          item.x = nextX;
          item.y = nextY;
        }
      }
      if (mode === "resize") {
        item.width = snapClamped(startWidth + moveEvent.pageX - startX, 80, 2400, readSnapSettings(), moveEvent);
      }
      if (mode === "rotate") {
        const angle = Math.atan2(moveEvent.pageY - centerY, moveEvent.pageX - centerX) * (180 / Math.PI);
        item.rotation = Math.round(angle + 90);
      }
      if (moveGroup && groupOrigins.length) groupOrigins.forEach((origin) => ensurePageSpace(origin.item));
      else ensurePageSpace(item);
      renderItems(false);
      selectItem(type, item.id, { preserveSelection: moveGroup });
    };

    const stopPointer = () => {
      document.removeEventListener("pointermove", movePointer);
      document.removeEventListener("pointerup", stopPointer);
      saveItems();
      renderLayersList();
      if (type === "image" && mode === "move" && !hasMoved) runImageClickEffect(item);
    };

    document.addEventListener("pointermove", movePointer);
    document.addEventListener("pointerup", stopPointer, { once: true });
  };

  const clearClickAnimationClasses = (box) => {
    box.classList.remove("is-click-pulse", "is-click-pop", "is-click-flash", "is-click-spin");
  };

  const triggerImageAnimation = (box, effect) => {
    clearClickAnimationClasses(box);
    window.requestAnimationFrame(() => {
      void box.offsetWidth;
      box.classList.add(`is-click-${effect}`);
      box.addEventListener("animationend", () => clearClickAnimationClasses(box), { once: true });
    });
  };

  const getImageBoxElement = (id) =>
    imageLayer.querySelector(`.uccelli-image-box[data-item-id="${CSS.escape(id)}"]`);

  const getImagePathAnchorOffset = (item) => {
    const trim = getImageTrim(item);
    const imageWidth = numeric(item.width, 320);
    const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
    return {
      x: imageWidth / 2,
      y: (trim.naturalHeight * imageScale) / 2,
    };
  };

  const renderImagePathOverlay = () => {
    imageLayer.querySelectorAll(".image-board-path-overlay").forEach((overlay) => overlay.remove());
    if (publicMode || gamePreviewEnabled) return;
    const selectedPaths = getSelectedImages()
      .map((item, index) => ({ item, index, pathMotion: normalizePathMotion(item.pathMotion) }))
      .filter((entry) => entry.pathMotion.points.length);
    if (!selectedPaths.length) return;

    const svgNamespace = "http://www.w3.org/2000/svg";
    const overlay = document.createElementNS(svgNamespace, "svg");
    const width = Math.max(imageLayer.scrollWidth, document.documentElement.scrollWidth, window.innerWidth, 1);
    const height = Math.max(imageLayer.scrollHeight, document.documentElement.scrollHeight, window.innerHeight, 1);
    const colors = ["#315fce", "#bd4a5a", "#32735f", "#8c5b20"];
    overlay.classList.add("image-board-path-overlay");
    overlay.setAttribute("viewBox", `0 0 ${Math.ceil(width)} ${Math.ceil(height)}`);
    overlay.setAttribute("width", String(Math.ceil(width)));
    overlay.setAttribute("height", String(Math.ceil(height)));
    overlay.setAttribute("aria-hidden", "true");

    selectedPaths.forEach(({ item, pathMotion }, pathIndex) => {
      const anchor = getImagePathAnchorOffset(item);
      const points = pathMotion.points.map((point) => ({
        x: numeric(point.x) + anchor.x,
        y: numeric(point.y) + anchor.y,
      }));
      const color = colors[pathIndex % colors.length];
      if (points.length > 1) {
        const line = document.createElementNS(svgNamespace, "polyline");
        line.classList.add("image-board-path-overlay__line");
        line.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
        line.style.stroke = color;
        overlay.append(line);
      }
      points.forEach((point, pointIndex) => {
        const marker = document.createElementNS(svgNamespace, "circle");
        marker.classList.add("image-board-path-overlay__point");
        marker.setAttribute("cx", String(point.x));
        marker.setAttribute("cy", String(point.y));
        marker.setAttribute("r", pointIndex === 0 ? "6" : "5");
        marker.style.fill = color;
        overlay.append(marker);

        const label = document.createElementNS(svgNamespace, "text");
        label.classList.add("image-board-path-overlay__label");
        label.setAttribute("x", String(point.x + 9));
        label.setAttribute("y", String(point.y - 8));
        label.textContent = String(pointIndex + 1);
        overlay.append(label);
      });
    });

    imageLayer.append(overlay);
  };

  const openImageLink = (item) => {
    const href = resolveImageLink(item.linkUrl);
    if (!href) return false;
    window.location.href = href;
    return true;
  };

  const runPublicImageActivation = (item) => {
    const href = resolveImageLink(item.linkUrl);
    const effect = normalizeClickEffect(item.clickEffect);
    const visualEffect = ["pulse", "pop", "flash", "spin"].includes(effect);
    if (visualEffect || (!href && effect !== "open-link")) runImageClickEffect(item);
    if (!href) return false;
    window.setTimeout(() => {
      window.location.href = href;
    }, visualEffect ? 360 : 0);
    return true;
  };

  const imageShapeUiSelector = [
    ".image-board-toolbar",
    ".image-board-layers-panel",
    ".image-board-motion-panel",
    ".image-board-background-panel",
    ".image-board-sprite-panel",
    ".image-board-cutout-panel",
    ".image-board-context-menu",
    ".image-board-editor-return",
    ".image-board-lightbox",
    ".image-board-walkable-overlay__point",
    ".image-board-walkable-overlay__segment-hit",
    ".image-board-spawn-overlay__marker",
    ".image-board-spawn-overlay__ring",
    ".uccelli-image-box__handle",
    ".uccelli-gallery-box",
    "button",
    "input",
    "select",
    "textarea",
    "a",
    "label",
    "[contenteditable='true']",
  ].join(",");

  const eventTargetsImageShapeUi = (event) =>
    event.target instanceof Element && Boolean(event.target.closest(imageShapeUiSelector));

  const imageShapeHitForItem = (item, index, pageX, pageY, layerPageX, layerPageY) => {
    if (item.hidden || normalizeOpacity(item.opacity) <= 0.01) return null;
    const renderState = getImageRenderState(item, index);
    const trim = getImageTrim(item);
    const imageWidth = numeric(item.width, 320);
    const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
    const fullHeight = trim.naturalHeight * imageScale;
    const centerX = imageWidth / 2;
    const centerY = fullHeight / 2;
    const dx = pageX - layerPageX - numeric(item.x) - renderState.x;
    const dy = pageY - layerPageY - numeric(item.y) - renderState.y;
    const radians = -(numeric(item.rotation) + renderState.rotation) * Math.PI / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const relativeX = dx - centerX;
    const relativeY = dy - centerY;
    const localX = relativeX * cos - relativeY * sin + centerX;
    const localY = relativeX * sin + relativeY * cos + centerY;
    const trimLeft = trim.x * imageScale;
    const trimTop = trim.y * imageScale;
    const trimWidth = trim.width * imageScale;
    const trimHeight = trim.height * imageScale;

    if (
      localX < trimLeft ||
      localY < trimTop ||
      localX > trimLeft + trimWidth ||
      localY > trimTop + trimHeight
    ) {
      return null;
    }

    const naturalX = Math.floor(localX / Math.max(imageScale, 0.0001));
    const naturalY = Math.floor(localY / Math.max(imageScale, 0.0001));
    const mask = imagePixelMasks.get(item.id);
    if (
      mask &&
      mask.naturalWidth === trim.naturalWidth &&
      mask.naturalHeight === trim.naturalHeight &&
      naturalX >= 0 &&
      naturalY >= 0 &&
      naturalX < mask.naturalWidth &&
      naturalY < mask.naturalHeight &&
      mask.alpha[naturalY * mask.naturalWidth + naturalX] <= 8
    ) {
      return null;
    }

    return {
      item,
      index,
      localX,
      localY,
      trimLeft,
      trimTop,
      trimWidth,
      trimHeight,
    };
  };

  const getImageShapeHit = (event) => {
    const layerRect = imageLayer.getBoundingClientRect();
    const layerPageX = layerRect.left + window.scrollX;
    const layerPageY = layerRect.top + window.scrollY;
    const pageX = event.pageX ?? event.clientX + window.scrollX;
    const pageY = event.pageY ?? event.clientY + window.scrollY;
    const hitTime = window.performance.now();
    const orderedItems = imageBoxes
      .map((item, index) => ({ item, index }))
      .sort((first, second) => getImageEffectiveZAt(second.item, second.index, hitTime) - getImageEffectiveZAt(first.item, first.index, hitTime) || second.index - first.index);

    for (const entry of orderedItems) {
      const hit = imageShapeHitForItem(entry.item, entry.index, pageX, pageY, layerPageX, layerPageY);
      if (hit) return hit;
    }
    return null;
  };

  const clearImageShapeHover = () => {
    if (shapeHoverImageId) {
      const previousBox = getImageBoxElement(shapeHoverImageId);
      previousBox?.classList.remove("is-shape-hover");
      previousBox?.style.setProperty("--image-tilt-x", "0deg");
      previousBox?.style.setProperty("--image-tilt-y", "0deg");
    }
    shapeHoverImageId = null;
    root.style.cursor = "";
  };

  const setImageShapeHover = (hit) => {
    if (!hit) {
      clearImageShapeHover();
      return;
    }
    if (shapeHoverImageId && shapeHoverImageId !== hit.item.id) {
      const previousBox = getImageBoxElement(shapeHoverImageId);
      previousBox?.classList.remove("is-shape-hover");
      previousBox?.style.setProperty("--image-tilt-x", "0deg");
      previousBox?.style.setProperty("--image-tilt-y", "0deg");
    }

    const box = getImageBoxElement(hit.item.id);
    if (!box) {
      clearImageShapeHover();
      return;
    }

    shapeHoverImageId = hit.item.id;
    box.classList.add("is-shape-hover");
    root.style.cursor = publicMode
      ? publicDragIsActive(hit.item) ? "grab" : resolveImageLink(hit.item.linkUrl) ? "pointer" : ""
      : hit.item.locked ? "default" : "grab";

    if (normalizeHoverEffect(hit.item.hoverEffect) === "tilt") {
      const x = ((hit.localX - hit.trimLeft) / Math.max(hit.trimWidth, 1) - 0.5) * 2;
      const y = ((hit.localY - hit.trimTop) / Math.max(hit.trimHeight, 1) - 0.5) * 2;
      box.style.setProperty("--image-tilt-x", `${clamp(-y * 8, -8, 8)}deg`);
      box.style.setProperty("--image-tilt-y", `${clamp(x * 10, -10, 10)}deg`);
    } else {
      box.style.setProperty("--image-tilt-x", "0deg");
      box.style.setProperty("--image-tilt-y", "0deg");
    }
  };

  const handleImageShapePointerMove = (event) => {
    if (imagePathPicking) {
      clearImageShapeHover();
      return;
    }
    if (eventTargetsImageShapeUi(event)) {
      clearImageShapeHover();
      return;
    }
    setImageShapeHover(getImageShapeHit(event));
  };

  const handleImagePathPickPointerDown = (event) => {
    if (!imagePathPicking || event.button !== 0 || eventTargetsImageShapeUi(event)) return false;
    const target = event.target instanceof Element ? event.target : null;
    if (!target?.closest(".image-board-stage, .image-board-image-layer, .uccelli-image-box, .uccelli-image-box__surface")) return false;
    event.preventDefault();
    event.stopPropagation();
    const pageX = event.pageX ?? event.clientX + window.scrollX;
    const pageY = event.pageY ?? event.clientY + window.scrollY;
    return addCanvasPathPointToSelectedImages(pageX, pageY);
  };

  const startPublicImageDrag = (event, hit) => {
    if (!publicMode || !hit?.item || !publicDragIsActive(hit.item)) return false;
    event.preventDefault();
    event.stopPropagation();
    const item = hit.item;
    const id = String(item.id);
    stopPublicDragInertia(id);
    const startOffset = getPublicDragOffset(id);
    const startX = event.pageX;
    const startY = event.pageY;
    let lastX = event.pageX;
    let lastY = event.pageY;
    let lastTime = window.performance.now();
    let velocityX = 0;
    let velocityY = 0;
    let moved = false;
    root.style.cursor = "grabbing";

    const movePointer = (moveEvent) => {
      const now = window.performance.now();
      const deltaX = moveEvent.pageX - startX;
      const deltaY = moveEvent.pageY - startY;
      moved = moved || Math.hypot(deltaX, deltaY) > 5;
      const dt = clamp((now - lastTime) / 1000, 0.001, 0.08);
      const instantVelocityX = (moveEvent.pageX - lastX) / dt;
      const instantVelocityY = (moveEvent.pageY - lastY) / dt;
      velocityX = velocityX * 0.35 + instantVelocityX * 0.65;
      velocityY = velocityY * 0.35 + instantVelocityY * 0.65;
      publicDragOffsets.set(id, {
        x: startOffset.x + deltaX,
        y: startOffset.y + deltaY,
      });
      lastX = moveEvent.pageX;
      lastY = moveEvent.pageY;
      lastTime = now;
      applyImageTransforms(now);
    };

    const stopPointer = () => {
      document.removeEventListener("pointermove", movePointer);
      document.removeEventListener("pointerup", stopPointer);
      root.style.cursor = "";
      if (!moved) return;
      markPublicDragClickSuppressed(id);
      const releaseNow = window.performance.now();
      const releaseGap = Math.max(releaseNow - lastTime, 0);
      const staleFactor = releaseGap > 80 ? clamp(1 - (releaseGap - 80) / 180, 0, 1) : 1;
      const handoffVelocityX = clamp(velocityX * staleFactor, -2400, 2400);
      const handoffVelocityY = clamp(velocityY * staleFactor, -2400, 2400);
      if (Math.hypot(handoffVelocityX, handoffVelocityY) > 12 && normalizePublicDrag(item.publicDrag).inertia > 0.01) {
        const offset = getPublicDragOffset(id);
        const handoffDt = clamp(releaseGap / 1000, 0.008, 0.016);
        publicDragOffsets.set(id, {
          x: offset.x + handoffVelocityX * handoffDt,
          y: offset.y + handoffVelocityY * handoffDt,
        });
        applyImageTransforms(releaseNow);
        publicDragInertiaItems.set(id, {
          vx: handoffVelocityX,
          vy: handoffVelocityY,
          time: releaseNow - 16,
        });
        syncPublicDragInertiaLoop();
      }
    };

    document.addEventListener("pointermove", movePointer);
    document.addEventListener("pointerup", stopPointer, { once: true });
    return true;
  };

  const handleImageShapePointerDown = (event) => {
    if (addGameSpawnFromEvent(event)) return;
    if (addGameWalkPointFromEvent(event)) return;
    if (handleGamePreviewPointerDown(event)) return;
    if (handleImagePathPickPointerDown(event)) return;
    if (event.button !== 0 || eventTargetsImageShapeUi(event)) return;
    if (imagePathPicking) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (gameWalkPicking) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const hit = getImageShapeHit(event);
    if (!hit) {
      clearImageShapeHover();
      return;
    }
    setImageShapeHover(hit);
    if (publicMode) {
      startPublicImageDrag(event, hit);
      return;
    }
    if (isImageMultiSelectEvent(event)) {
      event.preventDefault();
      event.stopPropagation();
      selectItem("image", hit.item.id, { toggle: true });
      return;
    }
    selectItem("image", hit.item.id, { preserveSelection: selectedImageIds.has(hit.item.id) && selectedImageIds.size > 1 });
    startPointerTransform(event, hit.item, "image", "move");
  };

  const handleImageShapeClick = (event) => {
    if (eventTargetsImageShapeUi(event)) return;
    if (imagePathPicking) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    const hit = getImageShapeHit(event);
    if (!hit) return;
    event.preventDefault();
    event.stopPropagation();
    setImageShapeHover(hit);
    if (publicMode) {
      if (publicDragClickIsSuppressed(hit.item.id)) return;
      const trigger = normalizeLayerTrigger(hit.item.trigger);
      if (trigger.mode === "click") setLayerTriggered(hit.item.id, true);
      runPublicImageActivation(hit.item);
      return;
    }
    if (isImageMultiSelectEvent(event)) return;
    if (Date.now() - numeric(clickEffectTimestamps.get(hit.item.id), 0) < 250) return;
    if (hit.item.locked) runImageClickEffect(hit.item);
  };

  const handleImageShapeContextMenu = (event) => {
    if (eventTargetsImageShapeUi(event)) return;
    const hit = getImageShapeHit(event);
    if (!hit && !imageBoxes.length) return;
    event.preventDefault();
    event.stopPropagation();
    if (hit) setImageShapeHover(hit);
    showImageContextMenu(event, hit);
  };

  const handleImageContextMenuPointerDown = (event) => {
    if (event.target instanceof Element && event.target.closest(".image-board-context-menu")) return;
    hideImageContextMenu();
  };

  const openImageLightbox = (item) => {
    let lightbox = document.querySelector("[data-image-board-lightbox]");
    if (!(lightbox instanceof HTMLElement)) {
      lightbox = document.createElement("div");
      lightbox.className = "image-board-lightbox";
      lightbox.dataset.imageBoardLightbox = "true";
      lightbox.hidden = true;
      lightbox.innerHTML = `
        <button class="image-board-lightbox__close" type="button" aria-label="Chiudi immagine">×</button>
        <img class="image-board-lightbox__image" alt="Immagine ingrandita" draggable="false" />
      `;
      document.body.append(lightbox);
      lightbox.addEventListener("click", (clickEvent) => {
        if (
          clickEvent.target === lightbox ||
          (clickEvent.target instanceof Element && clickEvent.target.closest(".image-board-lightbox__close"))
        ) {
          lightbox.hidden = true;
        }
      });
      document.addEventListener("keydown", (keyboardEvent) => {
        if (keyboardEvent.key === "Escape") lightbox.hidden = true;
      });
    }
    const image = lightbox.querySelector("img");
    if (image instanceof HTMLImageElement) image.src = renderableImageSource(item.src);
    lightbox.hidden = false;
  };

  function runImageClickEffect(item) {
    const effect = normalizeClickEffect(item.clickEffect);
    if (effect === "none") return;
    clickEffectTimestamps.set(item.id, Date.now());
    const box = getImageBoxElement(item.id);
    if (["pulse", "pop", "flash", "spin"].includes(effect) && box) {
      triggerImageAnimation(box, effect);
      return;
    }
    if (effect === "open-link") {
      return;
    }
    if (effect === "bring-front") {
      const maxZ = imageBoxes.length ? Math.max(...imageBoxes.map((boxItem) => numeric(boxItem.z, 20))) : 20;
      item.z = clamp(maxZ + 5, 0, 200);
      if (imageZInput instanceof HTMLInputElement) {
        imageZInput.value = String(item.z);
        setRangeValue("z", item.z);
      }
      saveImageBoxes();
      renderImageBoxes(false);
      renderLayersList();
      selectItem("image", item.id);
      return;
    }
    if (effect === "lock-toggle") {
      item.locked = !item.locked;
      saveImageBoxes();
      renderImageBoxes(false);
      renderLayersList();
      selectItem("image", item.id);
    }
  }

  function renderImageBoxes(save = true) {
    imageLayer.innerHTML = "";
    imageBoxes.forEach((item, index) => {
      const box = document.createElement("figure");
      box.className = "uccelli-image-box";
      box.dataset.itemType = "image";
      box.dataset.itemId = item.id;
      box.dataset.hoverEffect = normalizeHoverEffect(item.hoverEffect);
      box.dataset.clickEffect = normalizeClickEffect(item.clickEffect);
      box.dataset.imageLocked = item.locked ? "true" : "false";
      box.dataset.imageHidden = item.hidden ? "true" : "false";
      box.dataset.imageOpacity = String(Math.round(normalizeOpacity(item.opacity) * 100));
      box.dataset.blendMode = normalizeBlendMode(item.blendMode);
      box.dataset.motionPreset = normalizeImageMotion(item.motion).preset;
      box.dataset.parallaxEnabled = parallaxIsActive(item.parallax) ? "true" : "false";
      box.dataset.publicDragEnabled = publicDragIsActive(item) ? "true" : "false";
      box.dataset.pathMotionEnabled = pathMotionIsActive(item) ? "true" : "false";
      box.dataset.gameRole = normalizeGameAsset(item.game).role;
      box.dataset.gamePlayer = normalizeGameAsset(item.game).player ? "true" : "false";
      box.dataset.gameAutoFlip = normalizeGameAsset(item.game).autoFlip ? "true" : "false";
      box.dataset.hasLink = resolveImageLink(item.linkUrl) ? "true" : "false";
      box.dataset.imageLink = normalizeImageLink(item.linkUrl);
      box.classList.toggle("is-trigger-hidden", !layerIsVisibleByTrigger(item));
      const imageWidth = numeric(item.width, 320);
      const trim = getImageTrim(item);
      const imageScale = imageWidth / Math.max(trim.naturalWidth, 1);
      const fullHeight = trim.naturalHeight * imageScale;
      const trimLeft = trim.x * imageScale;
      const trimTop = trim.y * imageScale;
      const trimWidth = trim.width * imageScale;
      const trimHeight = trim.height * imageScale;
      box.tabIndex = 0;
      if (resolveImageLink(item.linkUrl)) box.setAttribute("aria-label", `Apri ${normalizeImageLink(item.linkUrl)}`);
      applyImageBoxTransform(box, item, index);
      box.style.width = `${imageWidth}px`;
      box.style.height = `${fullHeight}px`;
      box.style.zIndex = String(getImageEffectiveZ(item));
      box.style.setProperty("--image-layer-opacity", String(normalizeOpacity(item.opacity)));
      box.style.setProperty("--image-blend-mode", normalizeBlendMode(item.blendMode));
      box.style.setProperty("--image-full-width", `${imageWidth}px`);
      box.style.setProperty("--image-full-height", `${fullHeight}px`);
      box.style.setProperty("--image-trim-left", `${trimLeft}px`);
      box.style.setProperty("--image-trim-top", `${trimTop}px`);
      box.style.setProperty("--image-trim-width", `${trimWidth}px`);
      box.style.setProperty("--image-trim-height", `${trimHeight}px`);
      box.style.setProperty("--image-game-origin-x", `${trimLeft + trimWidth / 2}px`);
      box.style.setProperty("--image-game-origin-y", `${trimTop + trimHeight / 2}px`);

      const surface = document.createElement("div");
      surface.className = "uccelli-image-box__surface";
      const image = document.createElement("img");
      const sprite = normalizeSprite(item.sprite, item.src);
      const spriteFrame = spriteIsEnabled(item) ? getCurrentSpriteFrame(item) : null;
      const spritePlayback = getSpritePlayback(item);
      const spritePlaybackFrames = spritePlayback.frames;
      if (spriteIsEnabled(item) && sprite.onion.enabled && layerAnimationAllowed(item)) {
        const frameIndex = getSpriteFrameIndex(item);
        const frameCount = spritePlaybackFrames.length;
        [
          { offset: -1, className: "uccelli-image-box__onion uccelli-image-box__onion--prev" },
          { offset: 1, className: "uccelli-image-box__onion uccelli-image-box__onion--next" },
        ].forEach((entry) => {
          const onionFrame = spritePlaybackFrames[(frameIndex + entry.offset + frameCount) % frameCount];
          if (!onionFrame?.src || onionFrame.src === spriteFrame?.src) return;
          const onionImage = document.createElement("img");
          onionImage.src = renderableImageSource(onionFrame.src);
          onionImage.alt = "";
          onionImage.className = entry.className;
          onionImage.style.setProperty("--sprite-onion-opacity", String(sprite.onion.opacity));
          onionImage.draggable = false;
          surface.append(onionImage);
        });
      }
      image.src = renderableImageSource(spriteFrame?.src || item.src);
      image.alt = spriteIsEnabled(item) ? "Sprite libero Bio" : "Immagine libera Bio";
      image.draggable = false;
      if (spriteIsEnabled(item)) image.dataset.spriteFrameTarget = item.id;
      scheduleImageTrim(item, image);
      surface.append(image);
      box.append(surface);

      const dragHandle = makeHandle("uccelli-image-box__handle uccelli-image-box__handle--drag", "↕", "Sposta");
      const deleteHandle = makeHandle("uccelli-image-box__handle uccelli-image-box__handle--delete", "×", "Elimina");
      const resizeHandle = makeHandle("uccelli-image-box__handle uccelli-image-box__handle--resize", "↘", "Ridimensiona");
      const rotateHandle = makeHandle("uccelli-image-box__handle uccelli-image-box__handle--rotate", "⟳", "Ruota");
      box.append(dragHandle, deleteHandle, resizeHandle, rotateHandle);

      box.addEventListener("pointerdown", (pointerEvent) => {
        if (pointerEvent.target instanceof Element && pointerEvent.target.closest(".uccelli-image-box__handle")) return;
        if (publicMode) return;
        if (isImageMultiSelectEvent(pointerEvent)) {
          selectItem("image", item.id, { toggle: true });
          return;
        }
        selectItem("image", item.id, { preserveSelection: selectedImageIds.has(item.id) && selectedImageIds.size > 1 });
        startPointerTransform(pointerEvent, item, "image", "move");
      });
      box.addEventListener("click", (clickEvent) => {
        if (clickEvent.target instanceof Element && clickEvent.target.closest(".uccelli-image-box__handle")) return;
        if (publicMode) {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          if (publicDragClickIsSuppressed(item.id)) return;
          runPublicImageActivation(item);
          return;
        }
        if (Date.now() - numeric(clickEffectTimestamps.get(item.id), 0) < 250) return;
        if (item.locked) runImageClickEffect(item);
      });
      box.addEventListener("keydown", (keyboardEvent) => {
        if (!publicMode || (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ")) return;
        keyboardEvent.preventDefault();
        runPublicImageActivation(item);
      });
      box.addEventListener("pointermove", (pointerEvent) => {
        if (normalizeHoverEffect(item.hoverEffect) !== "tilt") return;
        const rect = surface.getBoundingClientRect();
        const x = ((pointerEvent.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((pointerEvent.clientY - rect.top) / rect.height - 0.5) * 2;
        box.style.setProperty("--image-tilt-x", `${clamp(-y * 8, -8, 8)}deg`);
        box.style.setProperty("--image-tilt-y", `${clamp(x * 10, -10, 10)}deg`);
      });
      box.addEventListener("pointerleave", () => {
        box.style.setProperty("--image-tilt-x", "0deg");
        box.style.setProperty("--image-tilt-y", "0deg");
      });
      dragHandle.addEventListener("pointerdown", (pointerEvent) => {
        selectItem("image", item.id, { preserveSelection: selectedImageIds.has(item.id) && selectedImageIds.size > 1 });
        startPointerTransform(pointerEvent, item, "image", "move");
      });
      resizeHandle.addEventListener("pointerdown", (pointerEvent) => {
        selectItem("image", item.id, { preserveSelection: selectedImageIds.has(item.id) && selectedImageIds.size > 1 });
        startPointerTransform(pointerEvent, item, "image", "resize");
      });
      rotateHandle.addEventListener("pointerdown", (pointerEvent) => {
        selectItem("image", item.id, { preserveSelection: selectedImageIds.has(item.id) && selectedImageIds.size > 1 });
        startPointerTransform(pointerEvent, item, "image", "rotate");
      });
      deleteHandle.addEventListener("pointerdown", stopHandlePointer);
      deleteHandle.addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        if (selectedImageIds.has(item.id) && selectedImageIds.size > 1) deleteSelectedImages();
        else {
          rememberRemovedImage(item.id);
          imageBoxes = imageBoxes.filter((boxItem) => boxItem.id !== item.id);
          selectedImageIds.delete(item.id);
          gamePreviewPositions.delete(item.id);
          spriteRuntimeStarts.delete(item.id);
          activeItem = null;
          renderImageBoxes();
          renderLayersList();
        }
      });

      if (selectedImageIds.has(item.id)) box.classList.add("is-active");
      imageLayer.append(box);
    });
    renderImagePathOverlay();
    renderGameWalkOverlay();
    if (save) saveImageBoxes();
    updateImageToolState();
    syncImageMotionLoop();
    syncSpriteLoop();
  }

  function renderGalleries(save = true) {
    slideshowTimers.forEach((timer) => window.clearInterval(timer));
    slideshowTimers.clear();
    galleryLayer.innerHTML = "";

    galleries.forEach((gallery) => {
      const box = document.createElement("section");
      box.className = "uccelli-gallery-box";
      box.dataset.itemType = "gallery";
      box.dataset.itemId = gallery.id;
      box.dataset.galleryLayout = gallery.layout || "grid";
      box.style.transform = `translate(${numeric(gallery.x)}px, ${numeric(gallery.y)}px) rotate(${numeric(gallery.rotation)}deg)`;
      box.style.width = `${numeric(gallery.width, 620)}px`;
      box.style.zIndex = String(numeric(gallery.z, 40));
      box.style.setProperty("--gallery-columns", String(numeric(gallery.columns, 3)));
      box.style.setProperty("--gallery-gap", `${numeric(gallery.gap, 10)}px`);
      box.style.setProperty("--gallery-fit", gallery.fit || "cover");

      const track = document.createElement("div");
      track.className = "uccelli-gallery-box__track";
      const currentIndex = clamp(numeric(gallery.activeIndex, 0), 0, Math.max(gallery.images.length - 1, 0));
      gallery.images.forEach((src, imageIndex) => {
        const image = document.createElement("img");
        image.src = renderableImageSource(src);
        if (isLocalImageAssetReference(src)) {
          void resolveLocalImageAsset(src).then((resolvedSrc) => {
            if (resolvedSrc) image.src = resolvedSrc;
          });
        }
        image.alt = `Foto Bio ${imageIndex + 1}`;
        image.draggable = false;
        image.classList.toggle("is-active", gallery.layout !== "slideshow" || imageIndex === currentIndex);
        image.style.objectFit = gallery.fit || "cover";
        image.addEventListener("click", (clickEvent) => {
          clickEvent.stopPropagation();
          const actualIndex = gallery.layout === "slideshow" ? currentIndex : imageIndex;
          const openGalleryImage = async () => {
            const targetSrc = await resolveLocalImageAsset(gallery.images[actualIndex]);
            if (targetSrc) window.open(targetSrc, "_blank", "noopener,noreferrer");
          };
          if (gallery.click === "open") void openGalleryImage();
          if (gallery.click === "next") {
            gallery.activeIndex = (actualIndex + 1) % gallery.images.length;
            saveGalleries();
            renderGalleries(false);
            selectItem("gallery", gallery.id);
          }
          if (gallery.click === "lightbox") {
            void openGalleryImage();
          }
        });
        track.append(image);
      });
      box.append(track);

      const dragHandle = makeHandle("uccelli-gallery-box__handle uccelli-gallery-box__handle--drag", "↕", "Sposta");
      const deleteHandle = makeHandle("uccelli-gallery-box__handle uccelli-gallery-box__handle--delete", "×", "Elimina");
      const resizeHandle = makeHandle("uccelli-gallery-box__handle uccelli-gallery-box__handle--resize", "↘", "Ridimensiona");
      const rotateHandle = makeHandle("uccelli-gallery-box__handle uccelli-gallery-box__handle--rotate", "⟳", "Ruota");
      box.append(dragHandle, deleteHandle, resizeHandle, rotateHandle);

      box.addEventListener("pointerdown", (pointerEvent) => {
        if (pointerEvent.target instanceof Element && pointerEvent.target.closest(".uccelli-gallery-box__handle")) return;
        selectItem("gallery", gallery.id);
        startPointerTransform(pointerEvent, gallery, "gallery", "move");
      });
      dragHandle.addEventListener("pointerdown", (pointerEvent) => startPointerTransform(pointerEvent, gallery, "gallery", "move"));
      resizeHandle.addEventListener("pointerdown", (pointerEvent) => startPointerTransform(pointerEvent, gallery, "gallery", "resize"));
      rotateHandle.addEventListener("pointerdown", (pointerEvent) => startPointerTransform(pointerEvent, gallery, "gallery", "rotate"));
      deleteHandle.addEventListener("pointerdown", stopHandlePointer);
      deleteHandle.addEventListener("click", (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        rememberRemovedGallery(gallery.id);
        galleries = galleries.filter((galleryItem) => galleryItem.id !== gallery.id);
        activeItem = null;
        renderGalleries();
        renderLayersList();
      });

      if (gallery.autoplay && gallery.layout === "slideshow" && gallery.images.length > 1) {
        const timer = window.setInterval(() => {
          gallery.activeIndex = (numeric(gallery.activeIndex, 0) + 1) % gallery.images.length;
          saveGalleries();
          renderGalleries(false);
        }, Math.max(numeric(gallery.interval, 4), 1) * 1000);
        slideshowTimers.set(gallery.id, timer);
      }

      if (activeItem?.type === "gallery" && activeItem.id === gallery.id) box.classList.add("is-active");
      galleryLayer.append(box);
    });
    if (save) saveGalleries();
  }

  imageUploadButtons.forEach((button) => {
    button.addEventListener("click", () => imageUploadInput?.click());
  });
  spriteUploadButton?.addEventListener("click", () => {
    spriteUploadMode = { type: "new", state: "idle-down" };
    spriteUploadInput?.click();
  });
  imageDemoSeedButton?.addEventListener("click", () => {
    seedDemoImages(true, true);
  });
  imageSelectAllButton?.addEventListener("click", selectAllImageBoxes);
  imageCenterAllButton?.addEventListener("click", centerAllImageBoxes);
  panelsCloseButton?.addEventListener("click", closeEditorPanels);
  panelsResetButton?.addEventListener("click", resetEditorPanelLayout);
  inspectorDockToggleButton?.addEventListener("click", () => {
    setInspectorDockMode(!inspectorDocked, { openPreferred: true });
  });
  imageExportDataButton?.addEventListener("click", () => {
    void exportImageCanvasPackage();
  });
  imageImportDataButton?.addEventListener("click", () => imageImportDataInput?.click());
  imageImportDataInput?.addEventListener("change", async () => {
    const file = imageImportDataInput.files?.[0];
    if (!file) return;
    try {
      await importImageCanvasPackage(file);
    } catch (error) {
      console.warn("Import pacchetto immagini non riuscito.", error);
      alert(error.message || "Import pacchetto/JSON non riuscito.");
    } finally {
      imageImportDataInput.value = "";
    }
  });
  imageExportPageButton?.addEventListener("click", async () => {
    if (typeof window.downloadImageCanvasPublicHtml !== "function") return;
    try {
      const exportImages = await Promise.all(imageBoxes.map(resolveImageItemLocalAssets));
      window.downloadImageCanvasPublicHtml(exportImages, {
        title: "Immagini - Claudia D'Angelo",
        filename: "immagini-pubblica.html",
        background: canvasBackground,
        gameRoom: normalizeGameRoom(gameRoom),
      });
    } catch (error) {
      console.warn("Export HTML pubblico non riuscito.", error);
      alert(error.message || "Export HTML pubblico non riuscito.");
    }
  });
  publicModeButton?.addEventListener("click", () => setPublicMode(true));
  editorModeButton?.addEventListener("click", () => {
    if (gamePreviewEnabled) setGamePreviewEnabled(false);
    setPublicMode(false);
  });
  imageUploadInput?.addEventListener("change", async () => {
    const files = Array.from(imageUploadInput.files || []).filter(acceptedImageFile);
    if (!files.length) return;
    try {
      let imageSources = [];
      try {
        imageSources = await uploadGalleryFiles(files);
      } catch (error) {
        console.warn("Upload immagini non riuscito, uso anteprime locali.", error);
      }
      if (!imageSources.length) {
        imageSources = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      }
      const newImageIds = [];
      imageSources.forEach((imageSource, index) => {
        const nextImage = {
          ...defaultImageBox(imageSource),
          x: 120 + index * 28,
          y: window.scrollY + 140 + index * 28,
          z: 20 + imageBoxes.length + index,
        };
        removedImageIds = removedImageIds.filter((item) => item !== nextImage.id);
        imageBoxes.push(nextImage);
        newImageIds.push(nextImage.id);
      });
      setSelectedImages(newImageIds, newImageIds.at(-1));
      renderImageBoxes();
      renderLayersList();
      if (newImageIds.length) selectItem("image", newImageIds.at(-1), { preserveSelection: true });
    } catch (error) {
      alert(error.message || "Upload immagine non riuscito.");
    } finally {
      imageUploadInput.value = "";
    }
  });
  spriteUploadInput?.addEventListener("change", async () => {
    const files = Array.from(spriteUploadInput.files || [])
      .filter(acceptedImageFile)
      .sort((first, second) => String(first.name || "").localeCompare(String(second.name || ""), undefined, { numeric: true }));
    const currentUploadMode = spriteUploadMode || { type: "new", state: "idle-down" };
    if (currentUploadMode.type === "state") {
      const activeSpriteItem = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : null;
      const stateId = spriteDirectionStateIds.has(currentUploadMode.state) ? currentUploadMode.state : "idle-down";
      if (!activeSpriteItem || !spriteIsEnabled(activeSpriteItem)) {
        alert("Seleziona uno sprite prima di importare uno stato direzionale.");
        spriteUploadInput.value = "";
        spriteUploadMode = { type: "new", state: "idle-down" };
        return;
      }
      if (!files.length) {
        spriteUploadInput.value = "";
        spriteUploadMode = { type: "new", state: "idle-down" };
        return;
      }
      try {
        const sources = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
        const frames = makeSpriteFrames(files, sources);
        updateSelectedImages((item) => {
          if (item.id !== activeSpriteItem.id || !spriteIsEnabled(item)) return;
          const sprite = normalizeSprite(item.sprite, item.src);
          item.sprite = {
            ...sprite,
            states: {
              ...sprite.states,
              [stateId]: frames,
            },
            directional: {
              ...sprite.directional,
              enabled: true,
              state: stateId,
            },
            syncMotion: true,
            playing: true,
            frameIndex: 0,
          };
          resetSpriteRuntime(item.id);
        });
        renderImageBoxes(false);
        renderLayersList();
        selectItem("image", activeSpriteItem.id, { preserveSelection: true });
        setSpritePanelVisible(true);
        syncSpriteLoop();
      } catch (error) {
        alert(error.message || "Import stato sprite non riuscito.");
      } finally {
        spriteUploadInput.value = "";
        spriteUploadMode = { type: "new", state: "idle-down" };
      }
      return;
    }
    if (files.length < 2) {
      alert("Scegli almeno 2 immagini PNG/JPG per creare uno sprite animato.");
      spriteUploadInput.value = "";
      spriteUploadMode = { type: "new", state: "idle-down" };
      return;
    }
    try {
      const sources = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
      const nextSprite = {
        ...defaultSpriteBox(makeSpriteFrames(files, sources)),
        x: 150 + imageBoxes.length * 22,
        y: window.scrollY + 180 + imageBoxes.length * 18,
        z: 45 + imageBoxes.length,
      };
      removedImageIds = removedImageIds.filter((item) => item !== nextSprite.id);
      imageBoxes.push(nextSprite);
      setSelectedImages([nextSprite.id], nextSprite.id);
      resetSpriteRuntime(nextSprite.id);
      renderImageBoxes();
      renderLayersList();
      selectItem("image", nextSprite.id);
      setSpritePanelVisible(true);
    } catch (error) {
      alert(error.message || "Import sprite non riuscito.");
    } finally {
      spriteUploadInput.value = "";
      spriteUploadMode = { type: "new", state: "idle-down" };
    }
  });
  imageClearButton?.addEventListener("click", () => {
    deleteSelectedImages();
  });

  const updateActiveImageEffect = (field, control) => {
    if (field === "hoverEffect") {
      const nextEffect = normalizeHoverEffect(control.value);
      updateSelectedImages((item) => {
        item.hoverEffect = nextEffect;
      });
    }
    if (field === "clickEffect") {
      const nextEffect = normalizeClickEffect(control.value);
      updateSelectedImages((item) => {
        item.clickEffect = nextEffect;
      });
    }
  };

  imageHoverEffectInput?.addEventListener("input", () => updateActiveImageEffect("hoverEffect", imageHoverEffectInput));
  imageClickEffectInput?.addEventListener("input", () => updateActiveImageEffect("clickEffect", imageClickEffectInput));

  imageMotionPresetInput?.addEventListener("input", () => {
    const nextPreset = normalizeMotionPreset(imageMotionPresetInput.value);
    updateSelectedImages((item) => {
      item.motion = { ...normalizeImageMotion(item.motion), preset: nextPreset };
    });
  });

  imageMotionSpeedInput?.addEventListener("input", () => {
    const nextSpeed = clamp(numeric(imageMotionSpeedInput.value, 1), 0.1, 4);
    setRangeValue("motionSpeed", formatMotionSpeed(nextSpeed));
    updateSelectedImages((item) => {
      item.motion = { ...normalizeImageMotion(item.motion), speed: nextSpeed };
    });
  });

  imageMotionDistanceInput?.addEventListener("input", () => {
    const nextDistance = clamp(Math.round(numeric(imageMotionDistanceInput.value, 40)), 0, 320);
    setRangeValue("motionDistance", nextDistance, "px");
    updateSelectedImages((item) => {
      item.motion = { ...normalizeImageMotion(item.motion), distance: nextDistance };
    });
  });

  imageParallaxEnabledInput?.addEventListener("change", () => {
    const enabled = imageParallaxEnabledInput.checked;
    updateSelectedImages((item) => {
      item.parallax = { ...normalizeImageParallax(item.parallax), enabled };
    });
    applyImageTransforms();
  });

  imageParallaxDepthInput?.addEventListener("input", () => {
    const nextDepth = clamp(numeric(imageParallaxDepthInput.value, 1), 0, 2.5);
    setRangeValue("parallaxDepth", formatParallaxDepth(nextDepth));
    updateSelectedImages((item) => {
      item.parallax = { ...normalizeImageParallax(item.parallax), depth: nextDepth };
    });
    applyImageTransforms();
  });

  imagePublicDragEnabledInput?.addEventListener("change", () => {
    const enabled = imagePublicDragEnabledInput.checked;
    updateSelectedImages((item) => {
      item.publicDrag = { ...normalizePublicDrag(item.publicDrag), enabled };
    });
    applyImageTransforms();
  });

  imagePublicDragInertiaInput?.addEventListener("input", () => {
    const nextInertia = clamp(numeric(imagePublicDragInertiaInput.value, 0.88), 0, 0.98);
    setRangeValue("publicDragInertia", formatPublicDragInertia(nextInertia));
    updateSelectedImages((item) => {
      item.publicDrag = { ...normalizePublicDrag(item.publicDrag), inertia: nextInertia };
    });
  });

  gameControls.role?.addEventListener("input", () => {
    const role = allowedGameRoles.has(gameControls.role.value) ? gameControls.role.value : "web";
    if (role === "player") {
      const selectedImages = getSelectedImages();
      if (!selectedImages.length) return;
      const primaryId = activeItem?.type === "image" ? activeItem.id : selectedImages[0].id;
      imageBoxes.forEach((item) => {
        const game = normalizeGameAsset(item.game);
        item.game = item.id === primaryId
          ? { ...game, role: "player", player: true }
          : { ...game, role: game.role === "player" ? "prop" : game.role, player: false };
      });
      gamePreviewPositions.clear();
      saveImageBoxes();
      renderImageBoxes(false);
      renderLayersList();
      updateImageToolState();
      return;
    }
    if (updateSelectedImages((item) => {
      const game = normalizeGameAsset(item.game);
      item.game = {
        ...game,
        role,
        player: false,
      };
    })) {
      gamePreviewPositions.clear();
      applyImageTransforms();
    }
    updateGamePreviewStatus();
  });

  gameControls.player?.addEventListener("change", () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    const primaryId = activeItem?.type === "image" ? activeItem.id : selectedImages[0].id;
    const enabled = gameControls.player.checked;
    imageBoxes.forEach((item) => {
      const game = normalizeGameAsset(item.game);
      if (enabled && item.id === primaryId) {
        item.game = { ...game, role: "player", player: true };
      } else if (selectedImages.some((selected) => selected.id === item.id) || game.player) {
        item.game = { ...game, role: game.role === "player" ? "prop" : game.role, player: false };
      }
    });
    gamePreviewPositions.clear();
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
  });

  gameControls.depthSort?.addEventListener("change", () => {
    const depthSort = gameControls.depthSort.checked;
    updateSelectedImages((item) => {
      item.game = { ...normalizeGameAsset(item.game), depthSort };
    });
  });

  gameControls.autoFlip?.addEventListener("change", () => {
    const autoFlip = gameControls.autoFlip.checked;
    updateSelectedImages((item) => {
      item.game = { ...normalizeGameAsset(item.game), autoFlip };
    });
    applyImageTransforms();
  });

  gameControls.speed?.addEventListener("input", () => {
    const speed = clamp(numeric(gameControls.speed.value, 180), 40, 640);
    setRangeValue("gameSpeed", formatGameSpeed(speed));
    updateSelectedImages((item) => {
      item.game = { ...normalizeGameAsset(item.game), speed };
    });
    updateGamePreviewStatus();
  });

  gameControls.inputKeyButtons.forEach((button) => {
    button?.addEventListener("click", () => {
      const { actionId, slot } = parseGameInputButton(button);
      if (!actionId) return;
      gameInputCapture = { actionId, slot };
      syncGameInputControls();
      button.focus();
    });
  });

  gameControls.inputMirror?.addEventListener("change", () => {
    setGameInputSettings({
      mirrorHorizontal: gameControls.inputMirror.checked,
    });
    applyImageTransforms();
  });

  gameControls.inputReset?.addEventListener("click", () => {
    gameInputCapture = null;
    setGameInputSettings({
      bindings: defaultGameInputBindings,
      mirrorHorizontal: true,
    });
  });

  gameControls.preview?.addEventListener("click", () => {
    setGamePreviewEnabled(!gamePreviewEnabled);
  });

  gameControls.reset?.addEventListener("click", resetGamePreview);

  gameControls.spawnPick?.addEventListener("click", () => {
    setGameSpawnPicking(!gameSpawnPicking);
    renderGameWalkOverlay();
  });

  gameControls.spawnFromPlayer?.addEventListener("click", () => {
    const player = getGamePreviewPlayer();
    if (!player) return;
    setGameSpawnPicking(false);
    setGameSpawnPoint(getGamePlayerFootPoint(player));
  });

  gameControls.spawnClear?.addEventListener("click", () => {
    setGameSpawnPicking(false);
    setGameSpawnPoint(null);
  });

  gameControls.walkEnabled?.addEventListener("change", () => {
    setGameWalkArea({
      enabled: gameControls.walkEnabled.checked,
    });
  });

  gameControls.walkDraw?.addEventListener("click", () => {
    setGameWalkPicking(!gameWalkPicking);
    renderGameWalkOverlay();
  });

  gameControls.walkClose?.addEventListener("click", () => {
    const walkArea = getGameWalkArea();
    if (walkArea.points.length < 3) return;
    setGameWalkPicking(false);
    setGameWalkArea({
      enabled: true,
      closed: !walkArea.closed,
    });
  });

  gameControls.walkDeletePoint?.addEventListener("click", () => {
    deleteSelectedGameWalkPoint();
  });

  gameControls.walkClear?.addEventListener("click", () => {
    gameWalkSelectedPointIndex = -1;
    setGameWalkPicking(false);
    setGameWalkArea({
      enabled: false,
      closed: false,
      points: [],
    });
  });

  const updateSelectedLayerTrigger = (patch) => {
    updateSelectedImages((item) => {
      item.trigger = normalizeLayerTriggerForEditor({ ...normalizeLayerTrigger(item.trigger), ...patch });
    });
    syncImageMotionLoop();
  };

  layerTriggerControls.action?.addEventListener("input", () => {
    updateSelectedLayerTrigger({ action: allowedLayerTriggerActions.has(layerTriggerControls.action.value) ? layerTriggerControls.action.value : "show" });
  });
  layerTriggerControls.mode?.addEventListener("input", () => {
    updateSelectedLayerTrigger({ mode: allowedLayerTriggerModes.has(layerTriggerControls.mode.value) ? layerTriggerControls.mode.value : "immediate" });
  });
  layerTriggerControls.delay?.addEventListener("input", () => {
    const delay = clamp(numeric(layerTriggerControls.delay.value, 0), 0, 30);
    setRangeValue("triggerDelay", formatTriggerDelay(delay));
    updateSelectedLayerTrigger({ delay });
  });
  layerTriggerControls.key?.addEventListener("input", () => {
    updateSelectedLayerTrigger({ key: String(layerTriggerControls.key.value || "Space").trim() || "Space" });
  });
  layerTriggerControls.target?.addEventListener("input", () => {
    updateSelectedLayerTrigger({ targetId: String(layerTriggerControls.target.value || "") });
  });

  imagePathEnabledInput?.addEventListener("change", () => {
    const enabled = imagePathEnabledInput.checked;
    setSelectedPathEnabled(enabled);
    syncImageMotionLoop();
  });

  imagePathDurationInput?.addEventListener("input", () => {
    const nextDuration = clamp(numeric(imagePathDurationInput.value, 6), 1, 30);
    setRangeValue("pathDuration", formatPathDuration(nextDuration));
    updateSelectedImages((item) => {
      item.pathMotion = { ...normalizePathMotion(item.pathMotion), duration: nextDuration };
    });
    syncImageMotionLoop();
  });

  imagePathAddPointButton?.addEventListener("click", () => {
    setImagePathPicking(!imagePathPicking);
  });

  imagePathToggleButton?.addEventListener("click", () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    setSelectedPathEnabled(!selectedImages.every((item) => normalizePathMotion(item.pathMotion).enabled));
    syncImageMotionLoop();
  });

  imagePathClearButton?.addEventListener("click", () => {
    setImagePathPicking(false);
    clearSelectedPathPoints();
    syncImageMotionLoop();
  });

  imageLinkInput?.addEventListener("input", () => {
    const nextLink = normalizeImageLink(imageLinkInput.value);
    updateSelectedImages((item) => {
      item.linkUrl = nextLink;
    });
    if (imageLinkPresetInput instanceof HTMLSelectElement) {
      imageLinkPresetInput.value = Array.from(imageLinkPresetInput.options).some((option) => option.value === nextLink) ? nextLink : "";
    }
  });

  imageLinkPresetInput?.addEventListener("input", () => {
    if (!(imageLinkPresetInput instanceof HTMLSelectElement) || !imageLinkPresetInput.value) return;
    const nextLink = normalizeImageLink(imageLinkPresetInput.value);
    updateSelectedImages((item) => {
      item.linkUrl = nextLink;
    });
    if (imageLinkInput instanceof HTMLInputElement) imageLinkInput.value = nextLink;
  });

  imageOpacityInput?.addEventListener("input", () => {
    const nextOpacity = normalizeOpacity(numeric(imageOpacityInput.value, 100) / 100, 1);
    setRangeValue("opacity", Math.round(nextOpacity * 100), "%");
    updateSelectedImages((item) => {
      item.opacity = nextOpacity;
    });
  });

  imageBlendInput?.addEventListener("input", () => {
    const nextBlendMode = normalizeBlendMode(imageBlendInput.value);
    updateSelectedImages((item) => {
      item.blendMode = nextBlendMode;
    });
  });

  imageVisibilityButton?.addEventListener("click", () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    const nextHidden = !selectedImages.every((item) => item.hidden);
    updateSelectedImages((item) => {
      item.hidden = nextHidden;
    });
  });

  imageLockButton?.addEventListener("click", () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    const nextLocked = !selectedImages.every((item) => item.locked);
    updateSelectedImages((item) => {
      item.locked = nextLocked;
    });
  });

  imageZInput?.addEventListener("input", () => {
    const nextZ = numeric(imageZInput.value, 20);
    updateSelectedImages((item) => {
      item.z = nextZ;
    });
    setRangeValue("z", nextZ);
  });

  const updateActiveImageLayer = (mode) => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    const zValues = imageBoxes.map((box) => numeric(box.z, 20));
    const minZ = zValues.length ? Math.min(...zValues) : 0;
    const maxZ = zValues.length ? Math.max(...zValues) : 20;
    selectedImages
      .slice()
      .sort((first, second) => numeric(first.z, 20) - numeric(second.z, 20))
      .forEach((item, index) => {
        if (mode === "down") item.z = clamp(numeric(item.z, 20) - 5, 0, 200);
        if (mode === "up") item.z = clamp(numeric(item.z, 20) + 5, 0, 200);
        if (mode === "bottom") item.z = clamp(minZ - 5 + index, 0, 200);
        if (mode === "top") item.z = clamp(maxZ + 5 + index, 0, 200);
      });
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) || selectedImages[0] : selectedImages[0];
    if (imageZInput instanceof HTMLInputElement) {
      imageZInput.value = String(item.z);
      setRangeValue("z", item.z);
    }
    saveImageBoxes();
    renderImageBoxes();
    renderLayersList();
    selectItem("image", item.id, { preserveSelection: true });
  };

  imageLayerDownButton?.addEventListener("click", () => updateActiveImageLayer("down"));
  imageLayerUpButton?.addEventListener("click", () => updateActiveImageLayer("up"));
  imageLayerBottomButton?.addEventListener("click", () => updateActiveImageLayer("bottom"));
  imageLayerTopButton?.addEventListener("click", () => updateActiveImageLayer("top"));
  imageUndoButton?.addEventListener("click", undoImageHistory);
  imageRedoButton?.addEventListener("click", redoImageHistory);

  const applyCutoutToSelectedImages = async () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    const settings = readCutoutSettings();
    if (cutoutControls.apply instanceof HTMLButtonElement) cutoutControls.apply.disabled = true;
    const previousStatus = imageStatus?.textContent || "";
    if (imageStatus) imageStatus.textContent = `Scontorno ${selectedImages.length} immagine${selectedImages.length === 1 ? "" : "i"}...`;
    try {
      for (const item of selectedImages) {
        const originalGeometry = item.cutoutOriginalGeometry || {
          x: numeric(item.x),
          y: numeric(item.y),
          width: numeric(item.width, 320),
        };
        if (!item.cutoutOriginalGeometry) item.cutoutOriginalGeometry = originalGeometry;
        item.x = originalGeometry.x;
        item.y = originalGeometry.y;
        item.width = originalGeometry.width;
        if (spriteIsEnabled(item)) {
          const sprite = normalizeSprite(item.sprite, item.src);
          const originalFrames = Array.isArray(item.cutoutOriginalSpriteFrames)
            ? item.cutoutOriginalSpriteFrames
            : sprite.frames.map((frame) => ({ ...frame }));
          if (!Array.isArray(item.cutoutOriginalSpriteFrames)) item.cutoutOriginalSpriteFrames = originalFrames;
          const result = await createSpriteCutoutFrames(originalFrames, settings);
          item.sprite = { ...sprite, frames: result.frames };
          item.src = result.frames[0]?.src || item.src;
          applyCutoutPlacement(item, result);
        } else {
          const source = item.cutoutOriginalSrc || item.src;
          if (!item.cutoutOriginalSrc) item.cutoutOriginalSrc = source;
          const result = await createCheckerCutout(source, settings);
          item.src = result.src;
          applyCutoutPlacement(item, result);
        }
        item.cutoutSettings = settings;
        resetImageBoxTrim(item);
        resetSpriteRuntime(item.id);
      }
      saveImageBoxes();
      renderImageBoxes(false);
      renderLayersList();
      updateImageToolState();
    } catch (error) {
      alert(error.message || "Scontorno non riuscito.");
      if (imageStatus) imageStatus.textContent = previousStatus;
    } finally {
      if (cutoutControls.apply instanceof HTMLButtonElement) cutoutControls.apply.disabled = false;
    }
  };

  const resetCutoutForSelectedImages = () => {
    const selectedImages = getSelectedImages();
    if (!selectedImages.length) return;
    selectedImages.forEach((item) => {
      if (item.cutoutOriginalGeometry) {
        item.x = numeric(item.cutoutOriginalGeometry.x, item.x);
        item.y = numeric(item.cutoutOriginalGeometry.y, item.y);
        item.width = numeric(item.cutoutOriginalGeometry.width, item.width);
        delete item.cutoutOriginalGeometry;
      }
      if (item.cutoutOriginalSrc) {
        item.src = item.cutoutOriginalSrc;
        delete item.cutoutOriginalSrc;
      }
      if (Array.isArray(item.cutoutOriginalSpriteFrames)) {
        const sprite = normalizeSprite(item.sprite, item.src);
        item.sprite = { ...sprite, frames: item.cutoutOriginalSpriteFrames.map((frame) => ({ ...frame })) };
        item.src = item.sprite.frames[0]?.src || item.src;
        delete item.cutoutOriginalSpriteFrames;
      }
      delete item.cutoutSettings;
      resetImageBoxTrim(item);
      resetSpriteRuntime(item.id);
    });
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    updateImageToolState();
  };

  ["tolerance", "feather", "edge", "margin"].forEach((name) => {
    cutoutControls[name]?.addEventListener("input", () => {
      const settings = readCutoutSettings();
      setRangeValue("cutoutTolerance", settings.tolerance);
      setRangeValue("cutoutFeather", settings.feather, "px");
      setRangeValue("cutoutEdge", settings.edge, "px");
      setRangeValue("cutoutMargin", settings.margin, "px");
    });
  });
  cutoutControls.apply?.addEventListener("click", applyCutoutToSelectedImages);
  cutoutControls.reset?.addEventListener("click", resetCutoutForSelectedImages);

  spriteControls.play?.addEventListener("click", () => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : null;
    if (!item || !spriteIsEnabled(item)) return;
    const sprite = normalizeSprite(item.sprite, item.src);
    item.sprite = { ...sprite, playing: !sprite.playing, frameIndex: getSpriteFrameIndex(item) };
    resetSpriteRuntime(item.id);
    saveImageBoxes();
    updateImageToolState();
    syncSpriteLoop();
  });

  spriteControls.fps?.addEventListener("input", () => {
    const nextFps = clamp(numeric(spriteControls.fps.value, 8), 1, 30);
    setRangeValue("spriteFps", nextFps);
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      item.sprite = { ...normalizeSprite(item.sprite, item.src), fps: nextFps };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.loop?.addEventListener("change", () => {
    const nextLoop = Boolean(spriteControls.loop.checked);
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      item.sprite = { ...normalizeSprite(item.sprite, item.src), loop: nextLoop };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.mode?.addEventListener("input", () => {
    const nextMode = allowedSpriteModes.has(spriteControls.mode.value) ? spriteControls.mode.value : "forward";
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      item.sprite = { ...normalizeSprite(item.sprite, item.src), mode: nextMode };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.syncMotion?.addEventListener("change", () => {
    const enabled = Boolean(spriteControls.syncMotion.checked);
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      item.sprite = { ...normalizeSprite(item.sprite, item.src), syncMotion: enabled, playing: true };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  const getSelectedSpriteDirectionState = () =>
    spriteDirectionStateIds.has(String(spriteControls.directionState?.value || ""))
      ? String(spriteControls.directionState.value)
      : "idle-down";

  spriteControls.directionalEnabled?.addEventListener("change", () => {
    const enabled = Boolean(spriteControls.directionalEnabled.checked);
    const stateId = getSelectedSpriteDirectionState();
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      item.sprite = {
        ...sprite,
        directional: {
          ...sprite.directional,
          enabled,
          state: stateId,
        },
        syncMotion: enabled ? true : sprite.syncMotion,
        playing: true,
      };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.directionState?.addEventListener("input", () => {
    const stateId = getSelectedSpriteDirectionState();
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      const frameCount = getSpriteFramesForState(sprite, stateId).length || sprite.frames.length;
      item.sprite = {
        ...sprite,
        directional: {
          ...sprite.directional,
          state: stateId,
        },
        frameIndex: clamp(sprite.frameIndex, 0, Math.max(frameCount - 1, 0)),
      };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.directionImport?.addEventListener("click", () => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : null;
    if (!item || !spriteIsEnabled(item)) return;
    spriteUploadMode = { type: "state", state: getSelectedSpriteDirectionState() };
    spriteUploadInput?.click();
  });

  spriteControls.directionCopyBase?.addEventListener("click", () => {
    const stateId = getSelectedSpriteDirectionState();
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      item.sprite = {
        ...sprite,
        states: {
          ...sprite.states,
          [stateId]: sprite.frames.map((frame) => ({ ...frame })),
        },
        directional: {
          ...sprite.directional,
          enabled: true,
          state: stateId,
        },
        syncMotion: true,
        playing: true,
        frameIndex: 0,
      };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.directionClear?.addEventListener("click", () => {
    const stateId = getSelectedSpriteDirectionState();
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      const states = { ...sprite.states };
      delete states[stateId];
      item.sprite = {
        ...sprite,
        states,
        frameIndex: 0,
      };
      resetSpriteRuntime(item.id);
    });
    syncSpriteLoop();
  });

  spriteControls.onionEnabled?.addEventListener("change", () => {
    const enabled = Boolean(spriteControls.onionEnabled.checked);
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      item.sprite = { ...sprite, onion: { ...sprite.onion, enabled } };
    });
  });

  spriteControls.onionOpacity?.addEventListener("input", () => {
    const opacity = clamp(numeric(spriteControls.onionOpacity.value, 35), 5, 80) / 100;
    setRangeValue("spriteOnionOpacity", Math.round(opacity * 100), "%");
    updateSelectedImages((item) => {
      if (!spriteIsEnabled(item)) return;
      const sprite = normalizeSprite(item.sprite, item.src);
      item.sprite = { ...sprite, onion: { ...sprite.onion, opacity } };
    });
  });

  const stepActiveSpriteFrame = (delta) => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : null;
    if (!item || !spriteIsEnabled(item)) return;
    const sprite = normalizeSprite(item.sprite, item.src);
    const frames = getSpriteEditorFrames(sprite);
    if (!frames.length) return;
    const frameIndex = (sprite.frameIndex + delta + frames.length) % frames.length;
    item.sprite = { ...sprite, playing: false, frameIndex };
    resetSpriteRuntime(item.id);
    saveImageBoxes();
    renderImageBoxes(false);
    renderLayersList();
    selectItem("image", item.id, { preserveSelection: true });
    updateImageToolState();
  };
  spriteControls.prev?.addEventListener("click", () => stepActiveSpriteFrame(-1));
  spriteControls.next?.addEventListener("click", () => stepActiveSpriteFrame(1));

  const fitSelectedSpriteFrames = async () => {
    const selectedImages = getSelectedImages().filter(spriteIsEnabled);
    if (!selectedImages.length) return;
    if (spriteControls.fitFrames instanceof HTMLButtonElement) spriteControls.fitFrames.disabled = true;
    const previousStatus = imageStatus?.textContent || "";
    if (imageStatus) imageStatus.textContent = `Uniformo ${selectedImages.length} sprite...`;
    try {
      for (const item of selectedImages) {
        const sprite = normalizeSprite(item.sprite, item.src);
        const normalizeFrameList = async (frames) => {
          const canvases = [];
          for (const frame of frames) {
            const image = await loadCanvasImage(frame.src);
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth || image.width || 1;
            canvas.height = image.naturalHeight || image.height || 1;
            canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
            canvases.push(canvas);
          }
          const width = Math.max(...canvases.map((canvas) => canvas.width), 1);
          const height = Math.max(...canvases.map((canvas) => canvas.height), 1);
          return canvases.map((canvas, index) => ({
            ...frames[index],
            src: placeCanvasOnFrame(canvas, width, height).toDataURL("image/png"),
          }));
        };
        const frames = await normalizeFrameList(sprite.frames);
        const states = { ...sprite.states };
        for (const [stateId, stateFrames] of Object.entries(sprite.states || {})) {
          if (Array.isArray(stateFrames) && stateFrames.length) states[stateId] = await normalizeFrameList(stateFrames);
        }
        item.sprite = { ...sprite, frames, states };
        item.src = frames[0]?.src || item.src;
        resetImageBoxTrim(item);
        resetSpriteRuntime(item.id);
      }
      saveImageBoxes();
      renderImageBoxes(false);
      renderLayersList();
      updateImageToolState();
    } catch (error) {
      alert(error.message || "Uniforma frame non riuscito.");
      if (imageStatus) imageStatus.textContent = previousStatus;
    } finally {
      if (spriteControls.fitFrames instanceof HTMLButtonElement) spriteControls.fitFrames.disabled = false;
    }
  };
  spriteControls.fitFrames?.addEventListener("click", fitSelectedSpriteFrames);

  spriteControls.frame?.addEventListener("input", () => {
    const item = activeItem?.type === "image" ? imageBoxes.find((box) => box.id === activeItem.id) : null;
    if (!item || !spriteIsEnabled(item)) return;
    const sprite = normalizeSprite(item.sprite, item.src);
    const frames = getSpriteEditorFrames(sprite);
    const nextFrame = clamp(Math.round(numeric(spriteControls.frame.value, 0)), 0, Math.max(frames.length - 1, 0));
    item.sprite = { ...sprite, playing: false, frameIndex: nextFrame };
    resetSpriteRuntime(item.id);
    saveImageBoxes();
    renderImageBoxes(false);
    updateImageToolState();
  });

  galleryUploadButton?.addEventListener("click", () => galleryUploadInput?.click());
  galleryUploadInput?.addEventListener("change", async () => {
    const files = Array.from(galleryUploadInput.files || []);
    if (!files.length) return;
    try {
      const uploadedUrls = await uploadGalleryFiles(files);
      if (!uploadedUrls.length) {
        alert("Non ho caricato nessuna immagine: controlla formato e dimensione dei file.");
        return;
      }
      const nextGallery = defaultGallery(uploadedUrls);
      removedGalleryIds = removedGalleryIds.filter((item) => item !== nextGallery.id);
      galleries.push(nextGallery);
      renderGalleries();
      renderLayersList();
      selectItem("gallery", galleries.at(-1).id);
    } catch (error) {
      alert(error.message || "Upload galleria non riuscito.");
    } finally {
      galleryUploadInput.value = "";
    }
  });
  galleryClearButton?.addEventListener("click", () => {
    if (activeItem?.type !== "gallery") return;
    rememberRemovedGallery(activeItem.id);
    galleries = galleries.filter((gallery) => gallery.id !== activeItem.id);
    activeItem = null;
    renderGalleries();
    renderLayersList();
  });

  Object.entries(galleryControls).forEach(([name, control]) => {
    control?.addEventListener("input", () => {
      if (activeItem?.type !== "gallery") return;
      const gallery = galleries.find((item) => item.id === activeItem.id);
      if (!gallery) return;
      gallery[name] = control.type === "checkbox" ? control.checked : control.value;
      if (["columns", "gap", "interval", "z"].includes(name)) gallery[name] = numeric(control.value, gallery[name]);
      setRangeValue(name, gallery[name], name === "gap" ? "px" : name === "interval" ? "s" : "");
      renderGalleries();
      renderLayersList();
    });
  });

  document.addEventListener("keydown", (keyboardEvent) => {
    if (handleGameInputCaptureKeyDown(keyboardEvent)) return;
    if (handleGamePreviewKeyDown(keyboardEvent)) return;
    if (!publicMode && (keyboardEvent.metaKey || keyboardEvent.ctrlKey) && keyboardEvent.key.toLowerCase() === "k") {
      keyboardEvent.preventDefault();
      if (commandPaletteOpen) closeCommandPalette();
      else openCommandPalette();
      return;
    }
    if (commandPaletteOpen) {
      if (keyboardEvent.key === "Escape") {
        keyboardEvent.preventDefault();
        closeCommandPalette();
      }
      return;
    }
    if (keyboardEvent.key === "Escape" && gameSpawnPicking) {
      setGameSpawnPicking(false);
      return;
    }
    if (keyboardEvent.key === "Escape" && gameWalkPicking) {
      setGameWalkPicking(false);
      return;
    }
    if (keyboardEvent.key === "Escape" && imagePathPicking) {
      setImagePathPicking(false);
      return;
    }
    if (keyboardEvent.key === "Escape" && imageContextMenu && !imageContextMenu.hidden) {
      hideImageContextMenu();
      return;
    }
    if (keyboardEvent.key === "Escape" && publicMode) {
      setPublicMode(false);
      return;
    }
    const activeElement = document.activeElement;
    const activeTag = activeElement?.tagName;
    const editingText = activeElement instanceof HTMLElement && (
      activeElement.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)
    );
    if (!publicMode && (keyboardEvent.metaKey || keyboardEvent.ctrlKey) && keyboardEvent.key.toLowerCase() === "z") {
      if (editingText) return;
      keyboardEvent.preventDefault();
      if (keyboardEvent.shiftKey) redoImageHistory();
      else undoImageHistory();
      return;
    }
    if (["INPUT", "TEXTAREA", "SELECT"].includes(activeTag)) return;
    if (publicMode) {
      const pressedTriggerKey = keyboardEvent.key === " " ? "Space" : keyboardEvent.key;
      const matchingTriggerItems = imageBoxes.filter((item) => {
        const trigger = normalizeLayerTrigger(item.trigger);
        return trigger.mode === "key" && trigger.key.toLowerCase() === pressedTriggerKey.toLowerCase();
      });
      if (matchingTriggerItems.length) {
        keyboardEvent.preventDefault();
        matchingTriggerItems.forEach((item) => setLayerTriggered(item.id, true));
        return;
      }
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(keyboardEvent.key) && imageBoxes.some((item) => parallaxIsActive(item.parallax))) {
      keyboardEvent.preventDefault();
      const step = keyboardEvent.shiftKey ? 80 : 32;
      if (keyboardEvent.key === "ArrowRight") parallaxCamera.x += step;
      if (keyboardEvent.key === "ArrowLeft") parallaxCamera.x -= step;
      if (keyboardEvent.key === "ArrowDown") parallaxCamera.y += step;
      if (keyboardEvent.key === "ArrowUp") parallaxCamera.y -= step;
      updateCameraReadout();
      applyImageTransforms();
      return;
    }
    if ((keyboardEvent.metaKey || keyboardEvent.ctrlKey) && keyboardEvent.key.toLowerCase() === "a") {
      if (!imageBoardMode || publicMode || !imageBoxes.length) return;
      keyboardEvent.preventDefault();
      setSelectedImages(imageBoxes.map((item) => item.id), imageBoxes.at(-1)?.id);
      renderImageBoxes(false);
      renderLayersList();
      updateImageToolState();
      return;
    }
    if (keyboardEvent.key !== "Delete" && keyboardEvent.key !== "Backspace") return;
    if (!publicMode && !gamePreviewEnabled && gamePanel && !gamePanel.hidden && gameWalkSelectedPointIndex >= 0) {
      keyboardEvent.preventDefault();
      deleteSelectedGameWalkPoint();
      return;
    }
    if (activeItem?.type === "image") {
      deleteSelectedImages();
      return;
    }
    if (activeItem?.type === "gallery") {
      rememberRemovedGallery(activeItem.id);
      galleries = galleries.filter((item) => item.id !== activeItem.id);
      activeItem = null;
      renderGalleries();
      renderLayersList();
    }
  });

	  const getContentLayers = () =>
	    [
	      ...Array.from(root.querySelectorAll("[data-content-block]")),
	      ...Array.from(document.querySelectorAll(`[data-content-dynamic-layer="${CSS.escape(namespace)}"] [data-content-block-id]`)),
    ].map((element) => ({
      type: "content",
      id: element.dataset.contentBlock || "",
      label: element.dataset.contentBlock || "Testo",
      z: numeric(getComputedStyle(element).zIndex, 0),
	      element,
	    }));

	  const persistLayersPanelListState = () => {
	    tryWriteJson(layersPanelKey, {
	      ...readJson(layersPanelKey, {}),
	      search: layersSearchQuery,
	      filter: layersActiveFilter,
	      collapsedGroups: Array.from(collapsedLayerGroupIds),
	    }, "Preferenze livelli");
	  };

	  const syncLayersPanelControls = () => {
	    if (layersSearchInput instanceof HTMLInputElement && layersSearchInput.value !== layersSearchQuery) {
	      layersSearchInput.value = layersSearchQuery;
	    }
	    layersFilterButtons.forEach((button) => {
	      if (!(button instanceof HTMLButtonElement)) return;
	      const active = button.dataset.uccelliLayersFilter === layersActiveFilter;
	      button.classList.toggle("is-active", active);
	      button.setAttribute("aria-pressed", active ? "true" : "false");
	    });
	  };

	  const setLayersActiveFilter = (nextFilter, { openPanel = false } = {}) => {
	    layersActiveFilter = allowedLayerListFilters.has(nextFilter) ? nextFilter : "all";
	    if (openPanel) setLayersPanelCollapsed(false);
	    persistLayersPanelListState();
	    renderLayersList();
	    return true;
	  };

	  const getLayerItemGroupId = (item) => {
	    if (item.type === "content") return "content";
	    if (item.type === "gallery") return "gallery";
	    if (item.type !== "image") return "other";
	    if (item.hidden) return "hidden";
	    const game = normalizeGameAsset(item.game);
	    const sprite = normalizeSprite(item.sprite, item.src);
	    if (game.player) return "player";
	    if (game.role === "obstacle") return "obstacle";
	    if (sprite.enabled) return "sprite";
	    if (game.role !== "web") return "game";
	    return "web";
	  };

	  const layerItemMatchesFilter = (item) => {
	    if (layersActiveFilter === "all") return true;
	    if (item.type !== "image") return false;
	    const game = normalizeGameAsset(item.game);
	    const sprite = normalizeSprite(item.sprite, item.src);
	    if (layersActiveFilter === "player") return game.player;
	    if (layersActiveFilter === "obstacle") return game.role === "obstacle";
	    if (layersActiveFilter === "sprite") return sprite.enabled;
	    if (layersActiveFilter === "web") return game.role === "web";
	    if (layersActiveFilter === "hidden") return Boolean(item.hidden);
	    return true;
	  };

	  const getLayerItemMetaText = (item) => item.type === "image"
	    ? [
	        "image",
	        `z ${item.z}`,
	        `${Math.round(normalizeOpacity(item.opacity) * 100)}%`,
	        blendModeLabels[normalizeBlendMode(item.blendMode)],
	        item.sprite?.enabled ? `sprite ${item.sprite.frames.length} frame${spriteStateFrameCount(item.sprite) ? ` + direzioni ${spriteStateFrameCount(item.sprite)}` : ""}${item.sprite.syncMotion ? " sync" : ""}` : "",
	        item.game?.role && item.game.role !== "web" ? `game ${gameRoleLabels[item.game.role] || item.game.role}` : "",
	        item.game?.role === "obstacle" ? "collisione box" : "",
	        item.game?.depthSort ? "profondita Y" : "",
	        motionIsActive(item.motion) ? motionPresetLabels[normalizeImageMotion(item.motion).preset] : "",
	        parallaxIsActive(item.parallax) ? `parallasse ${formatParallaxDepth(normalizeImageParallax(item.parallax).depth)}` : "",
	        normalizePublicDrag(item.publicDrag).enabled ? `drag pubblico ${formatPublicDragInertia(normalizePublicDrag(item.publicDrag).inertia)}` : "",
	        normalizeLayerTrigger(item.trigger).mode !== "immediate" || normalizeLayerTrigger(item.trigger).action !== "show" ? `trigger ${normalizeLayerTrigger(item.trigger).mode}` : "",
	        normalizePathMotion(item.pathMotion).points.length ? `percorso ${normalizePathMotion(item.pathMotion).points.length}pt` : "",
	        item.hidden ? "nascosta" : "",
	        item.locked ? "bloccata" : "",
	      ].filter(Boolean).join(" · ")
	    : `${item.type} · z ${item.z}`;

	  const layerItemMatchesSearch = (item) => {
	    const query = normalizeCommandText(layersSearchQuery);
	    if (!query) return true;
	    const haystack = normalizeCommandText([
	      item.label,
	      item.id,
	      item.type,
	      item.metaText,
	      layerGroupLabels[item.groupId] || "",
	    ].filter(Boolean).join(" "));
	    return query.split(/\s+/).filter(Boolean).every((token) => haystack.includes(token));
	  };

	  const createLayerListButton = (item) => {
	    const button = document.createElement("button");
	    button.type = "button";
	    button.className = "uccelli-layers-item";
	    button.dataset.layerItemType = item.type;
	    button.dataset.layerItemId = item.id;
	    const active =
	      item.type === "image"
	        ? selectedImageIds.has(item.id)
	        : activeItem?.type === item.type && activeItem.id === item.id;
	    button.classList.toggle("is-active", active);
	    button.classList.toggle("is-hidden", item.type === "image" && item.hidden);
	    button.classList.toggle("is-locked", item.type === "image" && item.locked);
	    const name = document.createElement("span");
	    name.className = "uccelli-layers-item__name";
	    name.textContent = item.label;
	    const meta = document.createElement("span");
	    meta.className = "uccelli-layers-item__meta";
	    meta.textContent = item.metaText;
	    button.setAttribute("aria-label", `${item.label} ${item.metaText}`);
	    button.append(name, meta);
	    button.addEventListener("click", (clickEvent) => {
	      if (item.type === "content") {
	        item.element?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
	        item.element?.scrollIntoView({ block: "center", behavior: "smooth" });
	        return;
	      }
	      if (item.type === "image") {
	        selectItem("image", item.id, { toggle: isImageMultiSelectEvent(clickEvent) });
	        return;
	      }
	      selectItem(item.type, item.id);
	    });
	    return button;
	  };

	  function renderLayersList() {
	    if (!layersList) return;
	    const layerItems = [
	      ...getContentLayers(),
      ...imageBoxes.map((item, index) => ({
        type: "image",
        id: item.id,
	        label: `Immagine ${index + 1}`,
	        z: numeric(item.z, 20),
	        src: item.src,
	        opacity: normalizeOpacity(item.opacity),
	        blendMode: normalizeBlendMode(item.blendMode),
	        motion: normalizeImageMotion(item.motion),
	        parallax: normalizeImageParallax(item.parallax),
	        publicDrag: normalizePublicDrag(item.publicDrag),
	        pathMotion: normalizePathMotion(item.pathMotion),
	        sprite: normalizeSprite(item.sprite, item.src),
	        game: normalizeGameAsset(item.game),
	        trigger: normalizeLayerTrigger(item.trigger),
	        hidden: Boolean(item.hidden),
	        locked: Boolean(item.locked),
	      })),
	      ...galleries.map((item, index) => ({ type: "gallery", id: item.id, label: `Galleria ${index + 1}`, z: numeric(item.z, 40) })),
	    ].sort((first, second) => second.z - first.z);
	    layersList.innerHTML = "";
	    syncLayersPanelControls();
	    if (!layerItems.length) {
	      const empty = document.createElement("p");
	      empty.className = "uccelli-layers-empty";
	      empty.textContent = "Nessun box ancora.";
	      layersList.append(empty);
	      updateTriggerTargetOptions(activeItem?.type === "image" ? activeItem.id : "");
	      return;
	    }
	    const filteredItems = layerItems
	      .map((item) => {
	        const groupId = getLayerItemGroupId(item);
	        const enriched = { ...item, groupId };
	        return { ...enriched, metaText: getLayerItemMetaText(enriched) };
	      })
	      .filter((item) => layerItemMatchesFilter(item) && layerItemMatchesSearch(item));

	    if (!filteredItems.length) {
	      const empty = document.createElement("p");
	      empty.className = "uccelli-layers-empty";
	      empty.textContent = "Nessun livello corrisponde ai filtri.";
	      layersList.append(empty);
	      updateTriggerTargetOptions(activeItem?.type === "image" ? activeItem.id : "");
	      return;
	    }

	    const groupedItems = new Map();
	    filteredItems.forEach((item) => {
	      if (!groupedItems.has(item.groupId)) groupedItems.set(item.groupId, []);
	      groupedItems.get(item.groupId).push(item);
	    });
	    const groupIds = [
	      ...layerGroupOrder.filter((groupId) => groupedItems.has(groupId)),
	      ...Array.from(groupedItems.keys()).filter((groupId) => !layerGroupOrder.includes(groupId)),
	    ];
	    const forceGroupsOpen = Boolean(normalizeCommandText(layersSearchQuery) || layersActiveFilter !== "all");

	    groupIds.forEach((groupId) => {
	      const items = groupedItems.get(groupId) || [];
	      const collapsed = !forceGroupsOpen && collapsedLayerGroupIds.has(groupId);
	      const group = document.createElement("section");
	      group.className = "image-board-layer-group";
	      group.dataset.layerGroupId = groupId;
	      group.classList.toggle("is-collapsed", collapsed);

	      const header = document.createElement("button");
	      header.type = "button";
	      header.className = "image-board-layer-group__header";
	      header.setAttribute("aria-expanded", collapsed ? "false" : "true");
	      const title = document.createElement("span");
	      title.className = "image-board-layer-group__title";
	      title.textContent = layerGroupLabels[groupId] || groupId;
	      const count = document.createElement("span");
	      count.className = "image-board-layer-group__count";
	      count.textContent = String(items.length);
	      header.append(title, count);
	      header.addEventListener("click", () => {
	        if (collapsedLayerGroupIds.has(groupId)) collapsedLayerGroupIds.delete(groupId);
	        else collapsedLayerGroupIds.add(groupId);
	        persistLayersPanelListState();
	        renderLayersList();
	      });

	      const groupItems = document.createElement("div");
	      groupItems.className = "image-board-layer-group__items";
	      groupItems.hidden = collapsed;
	      items.forEach((item) => groupItems.append(createLayerListButton(item)));
	      group.append(header, groupItems);
	      layersList.append(group);
	    });
	    updateTriggerTargetOptions(activeItem?.type === "image" ? activeItem.id : "");
	  }

  const normalizePanelState = (state = {}, fallback = {}) => {
    const width = Number.isFinite(state.width) ? clamp(state.width, 180, window.innerWidth - 24) : fallback.width;
    const height = Number.isFinite(state.height) ? clamp(state.height, 48, window.innerHeight - 24) : fallback.height;
    const panelWidth = numeric(width, 300);
    const panelHeight = numeric(height, 160);
    const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
    const maxY = Math.max(8, window.innerHeight - panelHeight - 8);
    return {
      x: Number.isFinite(state.x) ? clamp(state.x, 8, maxX) : fallback.x,
      y: Number.isFinite(state.y) ? clamp(state.y, 8, maxY) : fallback.y,
      width,
      height,
      opacity: clamp(numeric(state.opacity, fallback.opacity ?? 92), 35, 100),
      scale: clamp(numeric(state.scale, fallback.scale ?? 100), 60, 130),
      collapsed: Boolean(state.collapsed ?? fallback.collapsed),
    };
  };

  const readFloatingPanelStates = () => readJson(floatingPanelsKey, {});

  const saveFloatingPanelState = (id, patch) => {
    const states = readFloatingPanelStates();
    tryWriteJson(floatingPanelsKey, {
      ...states,
      [id]: {
        ...(states[id] || {}),
        ...patch,
      },
    }, "Preferenze pannelli");
  };

  const applyFloatingPanelState = (panel, state) => {
    panel.style.setProperty("--panel-bg-opacity", String(state.opacity / 100));
    panel.style.setProperty("--panel-scale", String(state.scale / 100));
    panel.dataset.panelCollapsed = state.collapsed ? "true" : "false";
    if (Number.isFinite(state.x) && Number.isFinite(state.y)) {
      panel.style.left = `${state.x}px`;
      panel.style.top = `${state.y}px`;
      panel.style.right = "auto";
    }
    if (Number.isFinite(state.width)) panel.style.width = `${state.width}px`;
    if (Number.isFinite(state.height)) panel.style.height = `${state.height}px`;
  };

  const setupFloatingPanel = (panel, id, fallback = {}) => {
    if (!(panel instanceof HTMLElement) || panel.dataset.floatingPanelBound === "true") return;
    panel.dataset.floatingPanelBound = "true";
    panel.dataset.panelId = id;
    panel.classList.add("image-board-floating-panel");

    const savedState = readFloatingPanelStates()[id] || {};
    const state = normalizePanelState(savedState, fallback);
    applyFloatingPanelState(panel, state);

    const controls = document.createElement("div");
    controls.className = "image-board-panel-controls";
    controls.innerHTML = `
      <button class="image-board-panel-control-button" type="button" data-panel-drag title="Sposta pannello" aria-label="Sposta pannello">↕</button>
      <button class="image-board-panel-control-button" type="button" data-panel-collapse title="Collassa pannello" aria-label="Collassa pannello" aria-expanded="${state.collapsed ? "false" : "true"}">${state.collapsed ? "+" : "−"}</button>
      <label class="image-board-panel-control" title="Trasparenza pannello">Op
        <input type="range" min="35" max="100" step="1" value="${state.opacity}" data-panel-opacity />
      </label>
      <label class="image-board-panel-control" title="Scala pannello">Size
        <input type="range" min="60" max="130" step="5" value="${state.scale}" data-panel-scale />
      </label>
    `;
    const resizeHandle = document.createElement("button");
    resizeHandle.type = "button";
    resizeHandle.className = "image-board-panel-resize";
    resizeHandle.title = "Ridimensiona pannello";
    resizeHandle.setAttribute("aria-label", "Ridimensiona pannello");
    const resizeYHandle = document.createElement("button");
    resizeYHandle.type = "button";
    resizeYHandle.className = "image-board-panel-resize-y";
    resizeYHandle.title = "Ridimensiona altezza pannello";
    resizeYHandle.setAttribute("aria-label", "Ridimensiona altezza pannello");
    panel.prepend(controls);
    panel.append(resizeYHandle, resizeHandle);

    const clampPanelIntoViewport = (persist = false) => {
      if (panel.hidden) return;
      const rect = panel.getBoundingClientRect();
      const maxX = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      const maxY = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
      const x = clamp(rect.left, 8, maxX);
      const y = clamp(rect.top, 8, maxY);
      if (Math.abs(x - rect.left) < 0.5 && Math.abs(y - rect.top) < 0.5) return;
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      if (persist) saveFloatingPanelState(id, { x, y });
    };
    clampPanelIntoViewport(true);
    requestAnimationFrame(() => clampPanelIntoViewport(true));
    if ("ResizeObserver" in window) {
      const panelResizeObserver = new ResizeObserver(() => clampPanelIntoViewport(true));
      panelResizeObserver.observe(panel);
    }

    const opacityInput = controls.querySelector("[data-panel-opacity]");
    opacityInput?.addEventListener("input", () => {
      const opacity = clamp(numeric(opacityInput.value, 92), 35, 100);
      panel.style.setProperty("--panel-bg-opacity", String(opacity / 100));
      saveFloatingPanelState(id, { opacity });
    });

    const scaleInput = controls.querySelector("[data-panel-scale]");
    scaleInput?.addEventListener("input", () => {
      const scale = clamp(numeric(scaleInput.value, 100), 60, 130);
      panel.style.setProperty("--panel-scale", String(scale / 100));
      clampPanelIntoViewport(true);
      saveFloatingPanelState(id, { scale });
    });

	    controls.querySelector("[data-panel-collapse]")?.addEventListener("click", (event) => {
	      const button = event.currentTarget;
	      const collapsed = panel.dataset.panelCollapsed !== "true";
	      if (id === "layers") {
	        setLayersPanelCollapsed(collapsed);
	        return;
	      }
	      panel.dataset.panelCollapsed = collapsed ? "true" : "false";
	      button.textContent = collapsed ? "+" : "−";
	      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
	      saveFloatingPanelState(id, { collapsed });
	    });

    controls.querySelector("[data-panel-drag]")?.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = panel.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.right = "auto";
      panel.classList.add("is-panel-dragging");
      document.body.classList.add("is-panel-interacting");
      const movePanel = (moveEvent) => {
        const maxX = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
        const maxY = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
        const x = clamp(rect.left + moveEvent.clientX - startX, 8, maxX);
        const y = clamp(rect.top + moveEvent.clientY - startY, 8, maxY);
        panel.style.left = `${x}px`;
        panel.style.top = `${y}px`;
      };
      const stopPanel = () => {
        document.removeEventListener("pointermove", movePanel);
        document.removeEventListener("pointerup", stopPanel);
        document.removeEventListener("pointercancel", stopPanel);
        panel.classList.remove("is-panel-dragging");
        document.body.classList.remove("is-panel-interacting");
        saveFloatingPanelState(id, {
          x: parseFloat(panel.style.left || String(rect.left)),
          y: parseFloat(panel.style.top || String(rect.top)),
        });
      };
      document.addEventListener("pointermove", movePanel);
      document.addEventListener("pointerup", stopPanel, { once: true });
      document.addEventListener("pointercancel", stopPanel, { once: true });
    });

    const startPanelResize = (event, axis = "both") => {
      event.preventDefault();
      event.stopPropagation();
      if (panel.dataset.panelCollapsed === "true") return;
      const rect = panel.getBoundingClientRect();
      const styles = getComputedStyle(panel);
      const minWidth = Math.max(180, parseFloat(styles.minWidth) || 0);
      const minHeight = Math.max(64, parseFloat(styles.minHeight) || 0);
      const maxWidth = Math.max(minWidth, window.innerWidth - rect.left - 8);
      const maxHeight = Math.max(minHeight, window.innerHeight - rect.top - 8);
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = rect.width;
      const startHeight = rect.height;
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.top}px`;
      panel.style.width = `${startWidth}px`;
      panel.style.height = `${startHeight}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.classList.add("is-panel-resizing");
      document.body.classList.add("is-panel-interacting");
      const resizePanel = (moveEvent) => {
        moveEvent.preventDefault();
        const width = clamp(startWidth + moveEvent.clientX - startX, minWidth, maxWidth);
        const height = clamp(startHeight + moveEvent.clientY - startY, minHeight, maxHeight);
        if (axis !== "y") panel.style.width = `${width}px`;
        if (axis !== "x") panel.style.height = `${height}px`;
      };
      const stopResize = () => {
        document.removeEventListener("pointermove", resizePanel);
        document.removeEventListener("pointerup", stopResize);
        document.removeEventListener("pointercancel", stopResize);
        panel.classList.remove("is-panel-resizing");
        document.body.classList.remove("is-panel-interacting");
        clampPanelIntoViewport(true);
        saveFloatingPanelState(id, {
          width: parseFloat(panel.style.width || String(startWidth)),
          height: parseFloat(panel.style.height || String(startHeight)),
        });
      };
      document.addEventListener("pointermove", resizePanel);
      document.addEventListener("pointerup", stopResize, { once: true });
      document.addEventListener("pointercancel", stopResize, { once: true });
    };
    resizeHandle.addEventListener("pointerdown", (event) => startPanelResize(event, "both"));
    resizeYHandle.addEventListener("pointerdown", (event) => startPanelResize(event, "y"));
  };

  function closeEditorMenus(exceptMenu = null) {
    editorMenus.forEach((menu) => {
      if (menu !== exceptMenu) menu.open = false;
    });
  }

  const fitEditorMenuPanel = (menu) => {
    if (!(menu instanceof HTMLDetailsElement) || !menu.open) return;
    const panel = menu.querySelector(".image-board-menu__panel");
    if (!(panel instanceof HTMLElement)) return;
    const toolbarRect = imageToolbar instanceof HTMLElement ? imageToolbar.getBoundingClientRect() : null;
    const menuRect = menu.getBoundingClientRect();
    panel.style.left = "0";
    panel.style.right = "auto";
    panel.style.top = toolbarRect ? `${Math.max(40, toolbarRect.bottom - menuRect.top + 6)}px` : "";
    requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.right > window.innerWidth - 8) {
        panel.style.left = "auto";
        panel.style.right = "0";
      }
      requestAnimationFrame(() => {
        const nextRect = panel.getBoundingClientRect();
        if (nextRect.left < 8) {
          panel.style.left = `${8 - menuRect.left}px`;
          panel.style.right = "auto";
        }
      });
    });
  };

  const setupEditorMenuBar = () => {
    if (!editorMenus.length || !(imageToolbar instanceof HTMLElement)) return;
    editorMenus.forEach((menu) => {
      if (!(menu instanceof HTMLDetailsElement) || menu.dataset.editorMenuBound === "true") return;
      menu.dataset.editorMenuBound = "true";
      const summary = menu.querySelector("summary");
      menu.addEventListener("toggle", () => {
        if (!menu.open) return;
        closeEditorMenus(menu);
        fitEditorMenuPanel(menu);
      });
      summary?.addEventListener("pointerenter", () => {
        if (!editorMenus.some((entry) => entry !== menu && entry.open)) return;
        closeEditorMenus(menu);
        menu.open = true;
        fitEditorMenuPanel(menu);
      });
      menu.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (target.closest("summary, input, select, textarea, label")) return;
        if (target.closest("button")) requestAnimationFrame(() => closeEditorMenus());
      });
    });
    document.addEventListener("pointerdown", (event) => {
      const target = event.target;
      if (target instanceof Node && imageToolbar.contains(target)) return;
      closeEditorMenus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeEditorMenus();
    });
    window.addEventListener("resize", () => closeEditorMenus());
  };

  const advancedPanelLabels = {
    motion: "Movimento",
    sprite: "Sprite",
    cutout: "Scontorna",
    background: "Sfondo",
    game: "Gioco 2D",
  };

  const advancedPanelEntries = () => [
    { id: "motion", panel: motionPanel, toggle: motionPanelToggle, toggles: motionPanelToggles },
    { id: "sprite", panel: spritePanel, toggle: spritePanelToggle, toggles: spritePanelToggles },
    { id: "cutout", panel: cutoutPanel, toggle: cutoutPanelToggle, toggles: cutoutPanelToggles },
    { id: "background", panel: backgroundPanel, toggle: backgroundPanelToggle, toggles: backgroundPanelToggles },
    { id: "game", panel: gamePanel, toggle: gamePanelToggle, toggles: gamePanelToggles },
  ].filter((entry) => entry.panel instanceof HTMLElement);

  const syncAdvancedPanelTabs = (activePanelId = "") => {
    root.querySelectorAll("[data-image-board-inspector-tab]").forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
      const selected = button.dataset.imageBoardInspectorTab === activePanelId;
      button.setAttribute("aria-selected", selected ? "true" : "false");
      button.tabIndex = selected ? 0 : -1;
    });
  };

  const focusAdvancedPanelTab = (panelId) => {
    const activeEntry = advancedPanelEntries().find((entry) => entry.id === panelId);
    const button = activeEntry?.panel?.querySelector(`[data-image-board-inspector-tab="${CSS.escape(panelId)}"]`);
    if (button instanceof HTMLButtonElement) button.focus();
  };

  const ensureAdvancedPanelTabs = () => {
    advancedPanelEntries().forEach((entry) => {
      if (!(entry.panel instanceof HTMLElement) || entry.panel.querySelector("[data-image-board-inspector-tabs]")) return;
      const tabs = document.createElement("nav");
      tabs.className = "image-board-inspector-tabs";
      tabs.dataset.imageBoardInspectorTabs = "";
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "Sezioni inspector immagine");
      advancedPanelEntries().forEach((tabEntry) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "image-board-inspector-tab";
        button.dataset.imageBoardInspectorTab = tabEntry.id;
        button.setAttribute("role", "tab");
        button.setAttribute("aria-selected", tabEntry.id === entry.id ? "true" : "false");
        button.textContent = advancedPanelLabels[tabEntry.id] || tabEntry.id;
        button.addEventListener("click", () => setAdvancedPanelVisible(tabEntry.id, true));
        button.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const entries = advancedPanelEntries();
          const currentIndex = entries.findIndex((item) => item.id === tabEntry.id);
          if (currentIndex < 0) return;
          let nextIndex = currentIndex;
          if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + entries.length) % entries.length;
          if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % entries.length;
          if (event.key === "Home") nextIndex = 0;
          if (event.key === "End") nextIndex = entries.length - 1;
          const nextId = entries[nextIndex]?.id;
          if (!nextId) return;
          setAdvancedPanelVisible(nextId, true);
          requestAnimationFrame(() => focusAdvancedPanelTab(nextId));
        });
        tabs.append(button);
      });
      const controls = entry.panel.querySelector(".image-board-panel-controls");
      if (controls) controls.insertAdjacentElement("afterend", tabs);
      else entry.panel.prepend(tabs);
    });
    const activeEntry = advancedPanelEntries().find((entry) => !entry.panel.hidden);
    syncAdvancedPanelTabs(activeEntry?.id || "");
  };

  const setPanelCollapseControl = (panel, collapsed) => {
    if (!(panel instanceof HTMLElement)) return;
    panel.dataset.panelCollapsed = collapsed ? "true" : "false";
    const button = panel.querySelector("[data-panel-collapse]");
    if (button instanceof HTMLButtonElement) {
      button.textContent = collapsed ? "+" : "−";
      button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    }
  };

  const makePanelReadable = (entry, persist = true) => {
    const panel = entry?.panel;
    if (!(panel instanceof HTMLElement) || panel.hidden || panel.dataset.panelCollapsed === "true") return;
    const rect = panel.getBoundingClientRect();
    const toolbarRect = imageToolbar instanceof HTMLElement ? imageToolbar.getBoundingClientRect() : null;
    const overlapsToolbar = toolbarRect
      && rect.left < toolbarRect.right
      && rect.right > toolbarRect.left
      && rect.top < toolbarRect.bottom
      && rect.bottom > toolbarRect.top;
    const offscreen = rect.left < 8 || rect.top < 8 || rect.right > window.innerWidth - 8 || rect.bottom > window.innerHeight - 8;
    if (!overlapsToolbar && !offscreen) return;

    const width = clamp(rect.width || panel.offsetWidth || 500, 260, Math.max(260, window.innerWidth - 16));
    const safeTop = toolbarRect ? Math.min(toolbarRect.bottom + 12, window.innerHeight - 180) : 16;
    const availableBelowToolbar = window.innerHeight - safeTop - 8;
    const x = clamp(window.innerWidth - width - 16, 8, Math.max(8, window.innerWidth - width - 8));
    const y = availableBelowToolbar >= 220 ? safeTop : 8;
    const heightLimit = Math.max(180, window.innerHeight - y - 8);
    const height = Math.min(rect.height || panel.offsetHeight || 440, heightLimit);
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.width = `${width}px`;
    panel.style.height = `${height}px`;
    if (persist) saveFloatingPanelState(entry.id, { x, y, width, height });
  };

  const inspectorDockUsable = () => inspectorDocked && window.innerWidth >= 760;

  const getActiveAdvancedPanelEntry = () =>
    advancedPanelEntries().find((entry) => entry.panel instanceof HTMLElement && !entry.panel.hidden) || null;

  const getPreferredAdvancedPanelId = () => {
    const selectedImages = getSelectedImages();
    const activeImage =
      activeItem?.type === "image"
        ? imageBoxes.find((item) => item.id === activeItem.id) || selectedImages[0] || null
        : selectedImages[0] || null;
    if (activeImage) {
      const game = normalizeGameAsset(activeImage.game);
      const sprite = normalizeSprite(activeImage.sprite, activeImage.src);
      if (game.role !== "web" || game.player) return "game";
      if (sprite.enabled) return "sprite";
      return "motion";
    }
    return "background";
  };

  const syncInspectorDockState = () => {
    const activeEntry = getActiveAdvancedPanelEntry();
    const hasDockedInspector = !publicMode && !gamePreviewEnabled && inspectorDockUsable() && Boolean(activeEntry);
    root.classList.toggle("is-inspector-docked", inspectorDocked);
    root.classList.toggle("has-docked-inspector", hasDockedInspector);
    root.dataset.inspectorMode = inspectorDocked ? "dock" : "float";
    if (inspectorDockToggleButton instanceof HTMLButtonElement) {
      inspectorDockToggleButton.textContent = inspectorDocked ? "Inspector: Dock a destra" : "Inspector: Flottante";
      inspectorDockToggleButton.setAttribute("aria-pressed", inspectorDocked ? "true" : "false");
      inspectorDockToggleButton.title = inspectorDocked
        ? "Gli inspector restano fissi a destra"
        : "Gli inspector sono pannelli flottanti";
    }
    if (hasDockedInspector && activeEntry?.panel instanceof HTMLElement) {
      activeEntry.panel.style.right = "";
      activeEntry.panel.style.bottom = "";
    }
  };

  const setInspectorDockMode = (docked, { openPreferred = false } = {}) => {
    inspectorDocked = Boolean(docked);
    tryWriteJson(inspectorDockKey, { docked: inspectorDocked }, "Preferenze inspector");
    if (inspectorDocked && openPreferred && !getActiveAdvancedPanelEntry()) {
      setAdvancedPanelVisible(getPreferredAdvancedPanelId(), true);
      return true;
    }
    syncInspectorDockState();
    const activeEntry = getActiveAdvancedPanelEntry();
    if (!inspectorDockUsable() && activeEntry) requestAnimationFrame(() => positionAdvancedPanelFromMenu(activeEntry, false));
    if (imageStatus instanceof HTMLElement) {
      imageStatus.textContent = inspectorDocked
        ? "Inspector agganciato a destra."
        : "Inspector in modalita flottante.";
    }
    return true;
  };

  const positionAdvancedPanelFromMenu = (entry, persist = true) => {
    const panel = entry?.panel;
    if (!(panel instanceof HTMLElement) || panel.hidden) return;
    syncInspectorDockState();
    if (inspectorDockUsable()) return;
    const toolbarRect = imageToolbar instanceof HTMLElement ? imageToolbar.getBoundingClientRect() : null;
    const toggleRect = entry?.toggle instanceof HTMLElement ? entry.toggle.getBoundingClientRect() : null;
    const menuSummary = entry?.toggle instanceof HTMLElement
      ? entry.toggle.closest("[data-image-board-menu]")?.querySelector("summary")
      : null;
    const summaryRect = menuSummary instanceof HTMLElement ? menuSummary.getBoundingClientRect() : null;
    const anchorRect = toggleRect && toggleRect.width > 0 && toggleRect.height > 0 ? toggleRect : summaryRect || toolbarRect;
    const rect = panel.getBoundingClientRect();
    const availableWidth = Math.max(280, window.innerWidth - 16);
    const desiredWidth = clamp(rect.width || panel.offsetWidth || 520, Math.min(340, availableWidth), availableWidth);
    const top = toolbarRect ? Math.min(toolbarRect.bottom + 8, window.innerHeight - 180) : 8;
    const leftSource = anchorRect ? anchorRect.left : 8;
    const left = clamp(leftSource, 8, Math.max(8, window.innerWidth - desiredWidth - 8));
    const maxHeight = Math.max(220, window.innerHeight - top - 8);
    const desiredHeight = Math.min(rect.height || panel.offsetHeight || 440, maxHeight);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    panel.style.width = `${desiredWidth}px`;
    panel.style.height = `${desiredHeight}px`;
    if (persist) saveFloatingPanelState(entry.id, { x: left, y: top, width: desiredWidth, height: desiredHeight });
  };

	  const setAdvancedPanelVisible = (panelId, visible) => {
	    closeEditorMenus();
	    advancedPanelEntries().forEach((entry) => {
      const shouldShow = visible && entry.id === panelId;
      entry.panel.hidden = !shouldShow;
      entry.toggle?.setAttribute("aria-expanded", shouldShow ? "true" : "false");
      entry.toggles?.forEach((toggle) => {
        if (toggle instanceof HTMLElement) toggle.setAttribute("aria-expanded", shouldShow ? "true" : "false");
      });
      if (shouldShow) {
        setPanelCollapseControl(entry.panel, false);
        saveFloatingPanelState(entry.id, { collapsed: false });
        requestAnimationFrame(() => {
          syncInspectorDockState();
          positionAdvancedPanelFromMenu(entry);
          syncInspectorDockState();
        });
      }
    });
    syncInspectorDockState();
	    syncAdvancedPanelTabs(visible ? panelId : "");
	  };

	  const getLayersPanelSafeTop = () => {
	    const toolbarRect = imageToolbar instanceof HTMLElement ? imageToolbar.getBoundingClientRect() : null;
	    const desiredTop = toolbarRect ? toolbarRect.bottom + 8 : 8;
	    return clamp(desiredTop, 8, Math.max(8, window.innerHeight - 96));
	  };

	  const placeLayersPanelSafely = (persist = false) => {
	    if (!(layersPanel instanceof HTMLElement)) return;
	    const rect = layersPanel.getBoundingClientRect();
	    const panelWidth = layersPanel.offsetWidth || rect.width || 300;
	    const panelHeight = layersPanel.offsetHeight || rect.height || 160;
	    const maxX = Math.max(8, window.innerWidth - panelWidth - 8);
	    const minY = getLayersPanelSafeTop();
	    const maxY = Math.max(minY, window.innerHeight - panelHeight - 8);
	    const x = clamp(rect.left, 8, maxX);
	    const y = clamp(rect.top, minY, maxY);
	    if (Math.abs(x - rect.left) >= 0.5 || Math.abs(y - rect.top) >= 0.5) {
	      layersPanel.style.left = `${x}px`;
	      layersPanel.style.top = `${y}px`;
	      layersPanel.style.right = "auto";
	      layersPanel.style.bottom = "auto";
	      if (persist) {
	        tryWriteJson(layersPanelKey, { ...readJson(layersPanelKey, {}), x, y }, "Preferenze livelli");
	        saveFloatingPanelState("layers", { x, y });
	      }
	    }
	  };

	  const setLayersPanelCollapsed = (collapsed) => {
	    if (!(layersPanel instanceof HTMLElement)) return;
	    layersPanel.classList.toggle("is-collapsed", collapsed);
	    setPanelCollapseControl(layersPanel, collapsed);
	    if (layersPanelToggle instanceof HTMLButtonElement) layersPanelToggle.textContent = collapsed ? "Mostra" : "Nascondi";
	    if (layersMenuToggleButton instanceof HTMLButtonElement) layersMenuToggleButton.textContent = collapsed ? "Mostra livelli" : "Nascondi livelli";
	    tryWriteJson(layersPanelKey, { ...readJson(layersPanelKey, {}), collapsed }, "Preferenze livelli");
	    saveFloatingPanelState("layers", { collapsed });
	    requestAnimationFrame(() => placeLayersPanelSafely(true));
	  };

  function closeEditorPanels() {
    setAdvancedPanelVisible("", false);
    setLayersPanelCollapsed(true);
  }

  function resetEditorPanelLayout() {
    tryRemoveStorageValue(floatingPanelsKey, "Preferenze pannelli");
    tryRemoveStorageValue(layersPanelKey, "Preferenze livelli");
    tryRemoveStorageValue(inspectorDockKey, "Preferenze inspector");
    inspectorDocked = false;
    layersSearchQuery = "";
    layersActiveFilter = "all";
    collapsedLayerGroupIds = new Set();
    [imageToolbar, layersPanel, motionPanel, backgroundPanel, spritePanel, cutoutPanel, gamePanel].forEach((panel) => {
      if (!(panel instanceof HTMLElement)) return;
      panel.style.left = "";
      panel.style.top = "";
      panel.style.right = "";
      panel.style.bottom = "";
      panel.style.width = "";
      panel.style.height = "";
      panel.style.removeProperty("--panel-bg-opacity");
      panel.style.removeProperty("--panel-scale");
      setPanelCollapseControl(panel, false);
    });
    advancedPanelEntries().forEach((entry) => {
      entry.panel.hidden = true;
      entry.toggle?.setAttribute("aria-expanded", "false");
      entry.toggles?.forEach((toggle) => {
        if (toggle instanceof HTMLElement) toggle.setAttribute("aria-expanded", "false");
      });
    });
    if (layersPanel instanceof HTMLElement) {
      setLayersPanelCollapsed(false);
    }
    syncLayersPanelControls();
    renderLayersList();
    syncInspectorDockState();
    if (imageStatus instanceof HTMLElement) imageStatus.textContent = "Pannelli rimessi in ordine.";
  }

	  const loadLayersPanel = () => {
	    if (!layersPanel) return;
	    const state = readJson(layersPanelKey, {});
	    const floatingState = readFloatingPanelStates().layers || {};
	    const x = Number.isFinite(state.x) ? state.x : floatingState.x;
	    const y = Number.isFinite(state.y) ? state.y : floatingState.y;
	    if (Number.isFinite(x) && Number.isFinite(y)) {
	      layersPanel.style.left = `${x}px`;
	      layersPanel.style.top = `${y}px`;
	      layersPanel.style.right = "auto";
	    }
	    setLayersPanelCollapsed(Boolean(state.collapsed ?? floatingState.collapsed));
	    requestAnimationFrame(() => placeLayersPanelSafely(true));
	  };

  const setMotionPanelVisible = (visible) => {
    setAdvancedPanelVisible("motion", visible);
  };

  motionPanelToggles.forEach((toggle) => toggle?.addEventListener("click", () => {
    setMotionPanelVisible(Boolean(motionPanel?.hidden));
  }));

  motionPanelHide?.addEventListener("click", () => {
    setMotionPanelVisible(false);
  });

  const setBackgroundPanelVisible = (visible) => {
    setAdvancedPanelVisible("background", visible);
  };

  backgroundPanelToggles.forEach((toggle) => toggle?.addEventListener("click", () => {
    setBackgroundPanelVisible(Boolean(backgroundPanel?.hidden));
  }));

  backgroundPanelHide?.addEventListener("click", () => {
    setBackgroundPanelVisible(false);
  });

  const setGamePanelVisible = (visible) => {
    setAdvancedPanelVisible("game", visible);
  };

  gamePanelToggles.forEach((toggle) => toggle?.addEventListener("click", () => {
    setGamePanelVisible(Boolean(gamePanel?.hidden));
  }));

  gamePanelHide?.addEventListener("click", () => {
    setGamePanelVisible(false);
  });

  const setSpritePanelVisible = (visible) => {
    setAdvancedPanelVisible("sprite", visible);
  };

  spritePanelToggles.forEach((toggle) => toggle?.addEventListener("click", () => {
    setSpritePanelVisible(Boolean(spritePanel?.hidden));
  }));

  spritePanelHide?.addEventListener("click", () => {
    setSpritePanelVisible(false);
  });

  const setCutoutPanelVisible = (visible) => {
    setAdvancedPanelVisible("cutout", visible);
  };

  cutoutPanelToggles.forEach((toggle) => toggle?.addEventListener("click", () => {
    setCutoutPanelVisible(Boolean(cutoutPanel?.hidden));
  }));

  cutoutPanelHide?.addEventListener("click", () => {
    setCutoutPanelVisible(false);
  });

  const dispatchControlEvent = (control, type = "input") => {
    if (!(control instanceof HTMLElement)) return false;
    control.dispatchEvent(new Event(type, { bubbles: true }));
    return true;
  };

  const setSelectOrInputValue = (control, value, type = "input") => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return false;
    control.value = String(value);
    return dispatchControlEvent(control, type);
  };

  const toggleCheckboxControl = (control) => {
    if (!(control instanceof HTMLInputElement)) return false;
    control.checked = !control.checked;
    return dispatchControlEvent(control, "change");
  };

  const clickControl = (control) => {
    if (!(control instanceof HTMLButtonElement) || control.disabled) return false;
    control.click();
    return true;
  };

  const runMenuAction = (action) => {
    switch (action) {
      case "motion-none":
        return setSelectOrInputValue(imageMotionPresetInput, "none");
      case "motion-float":
        return setSelectOrInputValue(imageMotionPresetInput, "float");
      case "motion-orbit":
        return setSelectOrInputValue(imageMotionPresetInput, "orbit");
      case "motion-scroll-left":
        return setSelectOrInputValue(imageMotionPresetInput, "scroll-left");
      case "path-toggle":
        return clickControl(imagePathToggleButton);
      case "path-point":
        return clickControl(imagePathAddPointButton);
      case "path-clear":
        return clickControl(imagePathClearButton);
      case "sprite-import":
        spriteUploadInput?.click();
        return true;
      case "sprite-play":
        return clickControl(spriteControls.play);
      case "sprite-prev":
        return clickControl(spriteControls.prev);
      case "sprite-next":
        return clickControl(spriteControls.next);
      case "sprite-fit":
        return clickControl(spriteControls.fitFrames);
      case "sprite-directional":
        return toggleCheckboxControl(spriteControls.directionalEnabled);
      case "sprite-sync":
        return toggleCheckboxControl(spriteControls.syncMotion);
      case "cutout-apply":
        return clickControl(cutoutControls.apply);
      case "cutout-reset":
        return clickControl(cutoutControls.reset);
      case "background-gradient":
        return toggleCheckboxControl(backgroundControls.gradientEnabled);
      case "background-paper":
        return toggleCheckboxControl(backgroundControls.paperEnabled);
      case "background-grid":
        return toggleCheckboxControl(backgroundControls.editorGrid);
      case "background-reset":
        return clickControl(backgroundControls.reset);
      case "game-preview":
        return clickControl(gameControls.preview);
      case "game-reset":
        return clickControl(gameControls.reset);
      case "game-spawn":
        return clickControl(gameControls.spawnPick);
      case "game-walk":
        return clickControl(gameControls.walkDraw);
      case "game-role-player":
        return setSelectOrInputValue(gameControls.role, "player");
      case "game-role-obstacle":
        return setSelectOrInputValue(gameControls.role, "obstacle");
      case "game-depth":
        return toggleCheckboxControl(gameControls.depthSort);
      default:
        return false;
    }
  };

  const commandDefinitions = [
    { id: "import-image", title: "Importa PNG/JPG", group: "File", detail: "Nuove immagini nel canvas", keywords: ["carica", "jpeg", "jpg", "png", "immagine"], priority: 90, run: () => { imageUploadInput?.click(); return true; } },
    { id: "import-sprite", title: "Importa sprite", group: "File", detail: "Crea sprite da piu frame", keywords: ["sprite", "frame", "animazione"], priority: 88, contexts: ["sprite"], action: "sprite-import" },
    { id: "demo", title: "Popola demo", group: "File", detail: "Asset di prova", keywords: ["test", "esempi"], priority: 35, run: () => clickControl(imageDemoSeedButton) },
    { id: "export-package", title: "Esporta pacchetto", group: "File", detail: "JSON e asset", keywords: ["salva", "download", "json"], priority: 84, run: () => clickControl(imageExportDataButton) },
    { id: "export-page", title: "Esporta HTML pubblico", group: "File", detail: "Pagina senza editor", keywords: ["pubblica", "web", "html", "sito"], priority: 82, run: () => clickControl(imageExportPageButton) },
    { id: "import-package", title: "Importa pacchetto/JSON", group: "File", detail: "Carica un progetto esportato", keywords: ["json", "package"], priority: 50, run: () => { imageImportDataInput?.click(); return true; } },

    { id: "select-all", title: "Seleziona tutto", group: "Modifica", detail: "Tutti i layer immagine", keywords: ["multi", "selezione"], priority: 44, disabled: () => imageBoxes.length ? "" : "Nessun layer immagine", run: () => clickControl(imageSelectAllButton) },
    { id: "center-all", title: "Centra tutti i layer", group: "Modifica", detail: "Allinea il gruppo al canvas", keywords: ["centra", "sposta", "allinea"], priority: 40, disabled: () => imageBoxes.length ? "" : "Nessun layer immagine", run: () => clickControl(imageCenterAllButton) },
    { id: "delete-selection", title: "Elimina selezione", group: "Modifica", detail: "Rimuove i layer selezionati", keywords: ["cancella", "rimuovi"], priority: 34, requiresImage: true, contexts: ["image"], run: () => clickControl(imageClearButton) },
    { id: "undo", title: "Annulla", group: "Modifica", detail: "Undo editor immagini", keywords: ["undo", "indietro"], priority: 32, disabled: () => imageUndoButton?.disabled ? "Niente da annullare" : "", run: () => clickControl(imageUndoButton) },
    { id: "redo", title: "Ripeti", group: "Modifica", detail: "Redo editor immagini", keywords: ["redo", "avanti"], priority: 31, disabled: () => imageRedoButton?.disabled ? "Niente da ripetere" : "", run: () => clickControl(imageRedoButton) },

    { id: "public-view", title: "Vista pubblica", group: "Vista", detail: "Nasconde strumenti editor", keywords: ["preview", "pubblica", "pulita"], priority: 72, run: () => clickControl(publicModeButton) },
    { id: "toggle-inspector-dock", title: "Flottante / Dock inspector", group: "Vista", detail: "Aggancia o libera l'inspector", keywords: ["dock", "destra", "pannello", "inspector", "flottante"], priority: 76, run: () => setInspectorDockMode(!inspectorDocked, { openPreferred: true }) },
    { id: "show-layers", title: "Mostra livelli", group: "Vista", detail: "Apre il pannello layer", keywords: ["layers", "livelli"], priority: 52, run: () => { setLayersPanelCollapsed(false); return true; } },
    { id: "close-panels", title: "Chiudi pannelli", group: "Vista", detail: "Libera il canvas", keywords: ["nascondi", "pannelli"], priority: 30, run: () => clickControl(panelsCloseButton) },
    { id: "reset-ui", title: "Reset UI pannelli", group: "Vista", detail: "Ripristina layout pannelli", keywords: ["layout", "interfaccia"], priority: 24, run: () => clickControl(panelsResetButton) },

    { id: "layers-filter-all", title: "Filtra livelli: tutti", group: "Livelli", detail: "Mostra tutti i gruppi", keywords: ["layer", "livelli", "filtro"], priority: 57, run: () => setLayersActiveFilter("all", { openPanel: true }) },
    { id: "layers-filter-player", title: "Filtra livelli: player", group: "Livelli", detail: "Mostra personaggi player", keywords: ["layer", "livelli", "filtro", "personaggio"], priority: 56, run: () => setLayersActiveFilter("player", { openPanel: true }) },
    { id: "layers-filter-obstacles", title: "Filtra livelli: ostacoli", group: "Livelli", detail: "Mostra collider e ostacoli", keywords: ["layer", "livelli", "filtro", "collisione"], priority: 55, run: () => setLayersActiveFilter("obstacle", { openPanel: true }) },
    { id: "layers-filter-sprites", title: "Filtra livelli: sprite", group: "Livelli", detail: "Mostra sprite animati", keywords: ["layer", "livelli", "filtro", "animazione"], priority: 54, run: () => setLayersActiveFilter("sprite", { openPanel: true }) },
    { id: "layers-filter-web", title: "Filtra livelli: web", group: "Livelli", detail: "Mostra layer per pagina web", keywords: ["layer", "livelli", "filtro", "pagina"], priority: 53, run: () => setLayersActiveFilter("web", { openPanel: true }) },
    { id: "layers-filter-hidden", title: "Filtra livelli: nascosti", group: "Livelli", detail: "Mostra layer nascosti", keywords: ["layer", "livelli", "filtro", "visibilita"], priority: 52, run: () => setLayersActiveFilter("hidden", { openPanel: true }) },

    { id: "open-motion", title: "Apri movimento", group: "Inspector", detail: "Movimento, trigger e parallasse", keywords: ["animazione", "parallasse", "trigger"], priority: 58, contexts: ["image"], run: () => { setAdvancedPanelVisible("motion", true); return true; } },
    { id: "open-sprite", title: "Apri sprite", group: "Inspector", detail: "Frame e direzioni", keywords: ["sprite", "animazione", "frame"], priority: 74, contexts: ["sprite"], run: () => { setAdvancedPanelVisible("sprite", true); return true; } },
    { id: "open-cutout", title: "Apri scontorna", group: "Inspector", detail: "Maschera e ritaglio", keywords: ["scontorna", "sfondo", "maschera", "ritaglia"], priority: 70, contexts: ["image"], run: () => { setAdvancedPanelVisible("cutout", true); return true; } },
    { id: "open-background", title: "Apri sfondo", group: "Inspector", detail: "Colori, gradienti e carta", keywords: ["sfondo", "gradiente", "carta"], priority: 48, run: () => { setAdvancedPanelVisible("background", true); return true; } },
    { id: "open-game", title: "Apri Gioco 2D", group: "Inspector", detail: "Player, spawn e zona", keywords: ["gioco", "player", "stanza"], priority: 64, contexts: ["game", "player", "obstacle"], run: () => { setAdvancedPanelVisible("game", true); return true; } },

    { id: "motion-none", title: "Movimento fermo", group: "Animazione", detail: "Rimuove il preset movimento", keywords: ["stop", "fermo"], priority: 28, requiresImage: true, contexts: ["image"], action: "motion-none" },
    { id: "motion-float", title: "Movimento fluttua", group: "Animazione", detail: "Preset fluttuante", keywords: ["float", "oscilla"], priority: 27, requiresImage: true, contexts: ["image"], action: "motion-float" },
    { id: "motion-orbit", title: "Movimento orbita", group: "Animazione", detail: "Preset orbitale", keywords: ["gira"], priority: 26, requiresImage: true, contexts: ["image"], action: "motion-orbit" },
    { id: "path-point", title: "Punto percorso da canvas", group: "Animazione", detail: "Aggiunge un punto animazione", keywords: ["path", "traiettoria", "punto"], priority: 54, requiresImage: true, contexts: ["image"], action: "path-point" },
    { id: "path-toggle", title: "Play/Pausa percorso", group: "Animazione", detail: "Attiva il percorso", keywords: ["path", "traiettoria"], priority: 36, requiresImage: true, contexts: ["image"], action: "path-toggle" },
    { id: "path-clear", title: "Pulisci percorso", group: "Animazione", detail: "Rimuove punti movimento", keywords: ["path", "cancella"], priority: 25, requiresImage: true, contexts: ["image"], action: "path-clear" },

    { id: "sprite-play", title: "Play/Pausa sprite", group: "Sprite", detail: "Avvia o ferma la sprite", keywords: ["sprite", "animazione"], priority: 78, requiresSprite: true, contexts: ["sprite"], action: "sprite-play" },
    { id: "sprite-prev", title: "Sprite frame precedente", group: "Sprite", detail: "Scorre i frame", keywords: ["sprite", "frame"], priority: 45, requiresSprite: true, contexts: ["sprite"], action: "sprite-prev" },
    { id: "sprite-next", title: "Sprite frame successivo", group: "Sprite", detail: "Scorre i frame", keywords: ["sprite", "frame"], priority: 46, requiresSprite: true, contexts: ["sprite"], action: "sprite-next" },
    { id: "sprite-directional", title: "Sprite direzionale", group: "Sprite", detail: "Abilita stati direzionali", keywords: ["idle", "walk", "sinistra", "destra", "direzioni"], priority: 76, requiresSprite: true, contexts: ["sprite"], action: "sprite-directional" },
    { id: "sprite-sync", title: "Sync sprite con movimento", group: "Sprite", detail: "Frame in ritmo col movimento", keywords: ["cammino", "walk", "sync"], priority: 80, requiresSprite: true, contexts: ["sprite", "player"], action: "sprite-sync" },
    { id: "sprite-fit", title: "Uniforma frame sprite", group: "Sprite", detail: "Stessa area per tutti i frame", keywords: ["frame", "uniforma", "dimensione"], priority: 47, requiresSprite: true, contexts: ["sprite"], action: "sprite-fit" },

    { id: "cutout-apply", title: "Scontorna selezione", group: "Scontorna", detail: "Applica la maschera", keywords: ["scontorna", "maschera", "ritaglia", "trasparenza"], priority: 86, requiresImage: true, contexts: ["image", "sprite"], action: "cutout-apply" },
    { id: "cutout-reset", title: "Ripristina scontorno", group: "Scontorna", detail: "Torna all'originale", keywords: ["scontorna", "reset", "originale"], priority: 38, requiresImage: true, contexts: ["image", "sprite"], action: "cutout-reset" },

    { id: "background-gradient", title: "Gradiente sfondo on/off", group: "Sfondo", detail: "Attiva gradiente canvas", keywords: ["sfondo", "gradiente"], priority: 42, action: "background-gradient" },
    { id: "background-paper", title: "Carta ruvida on/off", group: "Sfondo", detail: "Texture carta", keywords: ["sfondo", "carta", "ruvida", "texture"], priority: 41, action: "background-paper" },
    { id: "background-grid", title: "Griglia editor on/off", group: "Sfondo", detail: "Solo editor", keywords: ["sfondo", "griglia"], priority: 24, action: "background-grid" },
    { id: "background-reset", title: "Reset sfondo", group: "Sfondo", detail: "Ripristina canvas", keywords: ["sfondo", "reset"], priority: 22, action: "background-reset" },

    { id: "game-preview", title: "Preview gioco", group: "Gioco 2D", detail: "Prova player e input", keywords: ["game", "stanza", "player"], priority: 82, contexts: ["game", "player"], action: "game-preview" },
    { id: "game-spawn", title: "Piazza spawn", group: "Gioco 2D", detail: "Scegli dove appare il player", keywords: ["spawn", "punto iniziale", "player"], priority: 88, contexts: ["game", "player"], action: "game-spawn" },
    { id: "game-walk", title: "Disegna zona camminabile", group: "Gioco 2D", detail: "Poligono pavimento", keywords: ["walkable", "zona", "camminabile", "pavimento"], priority: 66, contexts: ["game"], action: "game-walk" },
    { id: "game-role-player", title: "Imposta player", group: "Gioco 2D", detail: "Il layer diventa personaggio", keywords: ["player", "personaggio", "giocatore"], priority: 90, requiresImage: true, contexts: ["image", "game", "player"], action: "game-role-player" },
    { id: "game-role-obstacle", title: "Imposta ostacolo", group: "Gioco 2D", detail: "Il layer blocca il player", keywords: ["ostacolo", "collisione", "collider"], priority: 72, requiresImage: true, contexts: ["image", "game", "obstacle"], action: "game-role-obstacle" },
    { id: "game-depth", title: "Profondita Y on/off", group: "Gioco 2D", detail: "Ordine visivo da posizione", keywords: ["depth", "profondita", "layer"], priority: 55, requiresImage: true, contexts: ["game", "player", "obstacle"], action: "game-depth" },
    { id: "game-auto-flip", title: "Specchia sprite sinistra/destra", group: "Gioco 2D", detail: "Auto-flip sul movimento", keywords: ["flip", "specchia", "sinistra", "destra"], priority: 62, requiresImage: true, contexts: ["sprite", "player"], run: () => toggleCheckboxControl(gameControls.autoFlip) },
    { id: "game-reset", title: "Reset player", group: "Gioco 2D", detail: "Riparte da spawn", keywords: ["reset", "spawn", "player"], priority: 44, contexts: ["game", "player"], action: "game-reset" },
  ];

  function normalizeCommandText(value = "") {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function getCommandContext() {
    const selectedImages = getSelectedImages();
    const activeImage =
      activeItem?.type === "image"
        ? imageBoxes.find((item) => item.id === activeItem.id) || selectedImages[0] || null
        : selectedImages[0] || null;
    const activeSprite = activeImage ? normalizeSprite(activeImage.sprite, activeImage.src) : null;
    const activeGame = activeImage ? normalizeGameAsset(activeImage.game) : normalizeGameAsset(null);
    return {
      selectedImages,
      activeImage,
      activeSprite,
      activeGame,
      hasActiveImage: selectedImages.length > 0,
      hasActiveSprite: Boolean(activeImage && activeSprite?.enabled),
      isPlayer: Boolean(activeImage && activeGame.player),
      isObstacle: Boolean(activeImage && activeGame.role === "obstacle"),
      hasGameRole: Boolean(activeImage && activeGame.role !== "web"),
    };
  }

  function getCommandDisabledReason(command, context = getCommandContext()) {
    if (command.requiresImage && !context.hasActiveImage) return "Seleziona un layer";
    if (command.requiresSprite && !context.hasActiveSprite) return "Seleziona uno sprite";
    if (typeof command.disabled === "function") return String(command.disabled(context) || "");
    return "";
  }

  function getCommandSearchText(command) {
    return normalizeCommandText([
      command.title,
      command.group,
      command.detail,
      ...(command.keywords || []),
    ].filter(Boolean).join(" "));
  }

  function getCommandContextScore(command, context) {
    const commandContexts = new Set(command.contexts || []);
    let score = 0;
    if (commandContexts.has("image") && context.hasActiveImage) score += 24;
    if (commandContexts.has("sprite") && context.hasActiveSprite) score += 70;
    if (commandContexts.has("game") && context.hasGameRole) score += 28;
    if (commandContexts.has("player") && context.isPlayer) score += 58;
    if (commandContexts.has("obstacle") && context.isObstacle) score += 58;
    if (!context.hasActiveImage && command.group === "File") score += 18;
    return score;
  }

  function scoreCommand(command, query, context) {
    let score = numeric(command.priority, 0) + getCommandContextScore(command, context);
    const reason = getCommandDisabledReason(command, context);
    if (reason) score -= 26;
    if (!query) return score;

    const titleText = normalizeCommandText(command.title);
    const haystack = getCommandSearchText(command);
    const tokens = query.split(/\s+/).filter(Boolean);
    if (!tokens.every((token) => haystack.includes(token))) return -Infinity;
    if (titleText === query) score += 220;
    else if (titleText.startsWith(query)) score += 160;
    else if (titleText.includes(query)) score += 95;
    score += tokens.reduce((total, token) => total + (titleText.includes(token) ? 34 : 14), 0);
    return score;
  }

  function renderCommandPalette() {
    if (!(commandPaletteList instanceof HTMLElement)) return;
    const context = getCommandContext();
    const query = normalizeCommandText(commandPaletteInput instanceof HTMLInputElement ? commandPaletteInput.value : "");
    commandPaletteMatches = commandDefinitions
      .map((command) => ({
        command,
        score: scoreCommand(command, query, context),
        disabledReason: getCommandDisabledReason(command, context),
      }))
      .filter((entry) => entry.score > -Infinity)
      .sort((first, second) => second.score - first.score || first.command.title.localeCompare(second.command.title))
      .slice(0, 16);

    commandPaletteSelectedIndex = clamp(commandPaletteSelectedIndex, 0, Math.max(commandPaletteMatches.length - 1, 0));
    commandPaletteList.innerHTML = "";
    commandPaletteMatches.forEach((entry, index) => {
      const button = document.createElement("button");
      const itemId = `${namespace}-command-${entry.command.id}`;
      button.type = "button";
      button.id = itemId;
      button.className = "image-board-command-palette__item";
      button.dataset.commandIndex = String(index);
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", index === commandPaletteSelectedIndex ? "true" : "false");
      if (entry.disabledReason) button.setAttribute("aria-disabled", "true");

      const text = document.createElement("span");
      text.className = "image-board-command-palette__item-copy";
      const title = document.createElement("span");
      title.className = "image-board-command-palette__item-title";
      title.textContent = entry.command.title;
      const meta = document.createElement("span");
      meta.className = "image-board-command-palette__item-meta";
      meta.textContent = entry.disabledReason || entry.command.detail || "";
      text.append(title, meta);

      const group = document.createElement("span");
      group.className = "image-board-command-palette__item-group";
      group.textContent = entry.command.group || "Comando";
      button.append(text, group);
      commandPaletteList.append(button);
    });

    if (commandPaletteEmpty instanceof HTMLElement) commandPaletteEmpty.hidden = commandPaletteMatches.length > 0;
    if (commandPaletteInput instanceof HTMLInputElement) {
      const activeEntry = commandPaletteMatches[commandPaletteSelectedIndex];
      if (activeEntry) commandPaletteInput.setAttribute("aria-activedescendant", `${namespace}-command-${activeEntry.command.id}`);
      else commandPaletteInput.removeAttribute("aria-activedescendant");
    }
    commandPaletteList
      .querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }

  function openCommandPalette() {
    if (!(commandPalette instanceof HTMLElement) || publicMode) return;
    closeEditorMenus();
    commandPaletteOpen = true;
    root.classList.add("is-command-palette-open");
    commandPalette.hidden = false;
    commandPaletteSelectedIndex = 0;
    if (commandPaletteInput instanceof HTMLInputElement) commandPaletteInput.value = "";
    renderCommandPalette();
    requestAnimationFrame(() => {
      if (commandPaletteInput instanceof HTMLInputElement) commandPaletteInput.focus({ preventScroll: true });
    });
  }

  function closeCommandPalette() {
    if (!(commandPalette instanceof HTMLElement)) return;
    commandPaletteOpen = false;
    root.classList.remove("is-command-palette-open");
    commandPalette.hidden = true;
    commandPaletteMatches = [];
    if (commandPaletteInput instanceof HTMLInputElement) {
      commandPaletteInput.value = "";
      commandPaletteInput.removeAttribute("aria-activedescendant");
    }
  }

  function moveCommandPaletteSelection(delta) {
    if (!commandPaletteMatches.length) return;
    commandPaletteSelectedIndex = (commandPaletteSelectedIndex + delta + commandPaletteMatches.length) % commandPaletteMatches.length;
    renderCommandPalette();
  }

  function executeCommandPaletteSelection(index = commandPaletteSelectedIndex) {
    const entry = commandPaletteMatches[index];
    if (!entry) return false;
    const context = getCommandContext();
    const disabledReason = getCommandDisabledReason(entry.command, context);
    if (disabledReason) {
      if (imageStatus instanceof HTMLElement) imageStatus.textContent = disabledReason;
      renderCommandPalette();
      return false;
    }
    const didRun = entry.command.action
      ? runMenuAction(entry.command.action)
      : typeof entry.command.run === "function" ? entry.command.run(context) : false;
    if (!didRun) {
      if (imageStatus instanceof HTMLElement) imageStatus.textContent = "Comando non disponibile.";
      renderCommandPalette();
      return false;
    }
    closeCommandPalette();
    updateImageToolState();
    renderLayersList();
    return true;
  }

  commandPaletteOpenButton?.addEventListener("click", openCommandPalette);
  commandPaletteCloseButtons.forEach((button) => button?.addEventListener("click", closeCommandPalette));
  commandPaletteInput?.addEventListener("input", () => {
    commandPaletteSelectedIndex = 0;
    renderCommandPalette();
  });
  commandPaletteInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveCommandPaletteSelection(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveCommandPaletteSelection(-1);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      commandPaletteSelectedIndex = 0;
      renderCommandPalette();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      commandPaletteSelectedIndex = Math.max(commandPaletteMatches.length - 1, 0);
      renderCommandPalette();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      executeCommandPaletteSelection();
    }
  });
  commandPaletteList?.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  commandPaletteList?.addEventListener("pointermove", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-command-index]") : null;
    if (!(target instanceof HTMLElement)) return;
    const index = Math.round(numeric(target.dataset.commandIndex, commandPaletteSelectedIndex));
    if (index === commandPaletteSelectedIndex) return;
    commandPaletteSelectedIndex = index;
    renderCommandPalette();
  });
  commandPaletteList?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-command-index]") : null;
    if (!(target instanceof HTMLElement)) return;
    executeCommandPaletteSelection(Math.round(numeric(target.dataset.commandIndex, commandPaletteSelectedIndex)));
  });

	  window.addEventListener("resize", () => {
	    syncInspectorDockState();
	    placeLayersPanelSafely(false);
	  });

  menuActionButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener("click", () => {
      const action = String(button.dataset.imageBoardMenuAction || "");
      if (!action || button.disabled) return;
      runMenuAction(action);
      updateImageToolState();
    });
  });

  cameraResetButton?.addEventListener("click", () => {
    parallaxCamera.x = 0;
    parallaxCamera.y = 0;
    updateCameraReadout();
    applyImageTransforms();
  });

  backgroundControls.base?.addEventListener("input", () => {
    updateCanvasBackground((background) => {
      background.baseColor = normalizeColor(backgroundControls.base.value, background.baseColor);
    });
  });

  backgroundControls.editorGrid?.addEventListener("change", () => {
    updateCanvasBackground((background) => {
      background.editorGrid = backgroundControls.editorGrid.checked;
    });
  });

  backgroundControls.gradientEnabled?.addEventListener("change", () => {
    updateCanvasBackground((background) => {
      background.gradient.enabled = backgroundControls.gradientEnabled.checked;
    });
  });

  backgroundControls.gradientType?.addEventListener("input", () => {
    updateCanvasBackground((background) => {
      background.gradient.type = gradientTypes.has(backgroundControls.gradientType.value) ? backgroundControls.gradientType.value : "linear";
    });
  });

  backgroundControls.gradientAngle?.addEventListener("input", () => {
    updateCanvasBackground((background) => {
      background.gradient.angle = clamp(numeric(backgroundControls.gradientAngle.value, 135), 0, 360);
    });
  });

  backgroundControls.stopColors.forEach((input, index) => {
    input.addEventListener("input", () => {
      updateCanvasBackground((background) => {
        background.gradient.stops[index].color = normalizeColor(input.value, background.gradient.stops[index].color);
      });
    });
  });

  backgroundControls.stopPositions.forEach((input, index) => {
    input.addEventListener("input", () => {
      updateCanvasBackground((background) => {
        background.gradient.stops[index].position = clamp(numeric(input.value, background.gradient.stops[index].position), 0, 100);
      });
    });
  });

  backgroundControls.paperEnabled?.addEventListener("change", () => {
    updateCanvasBackground((background) => {
      background.paper.enabled = backgroundControls.paperEnabled.checked;
    });
  });

  backgroundControls.paperStrength?.addEventListener("input", () => {
    updateCanvasBackground((background) => {
      background.paper.strength = clamp(numeric(backgroundControls.paperStrength.value, 32), 0, 100);
    });
  });

  backgroundControls.paperScale?.addEventListener("input", () => {
    updateCanvasBackground((background) => {
      background.paper.scale = clamp(numeric(backgroundControls.paperScale.value, 1), 0.5, 4);
    });
  });

  backgroundControls.reset?.addEventListener("click", () => {
    canvasBackground = normalizeCanvasBackground();
    applyCanvasBackground();
    syncCanvasBackgroundControls();
    persistCanvasBackground();
  });

  layersPanelToggle?.addEventListener("click", () => {
    if (!layersPanel) return;
    setLayersPanelCollapsed(!layersPanel.classList.contains("is-collapsed"));
  });

  layersMenuToggleButton?.addEventListener("click", () => {
    if (!layersPanel) return;
    setLayersPanelCollapsed(!layersPanel.classList.contains("is-collapsed"));
  });
  layersSearchInput?.addEventListener("input", () => {
    layersSearchQuery = layersSearchInput instanceof HTMLInputElement ? layersSearchInput.value : "";
    persistLayersPanelListState();
    renderLayersList();
  });
  layersFilterButtons.forEach((button) => {
    button?.addEventListener("click", () => {
      const nextFilter = button.dataset.uccelliLayersFilter || "all";
      setLayersActiveFilter(nextFilter);
    });
  });

	  layersPanelDrag?.addEventListener("pointerdown", (pointerEvent) => {
	    if (!layersPanel || pointerEvent.target.closest("button")) return;
	    pointerEvent.preventDefault();
	    const startX = pointerEvent.clientX;
	    const startY = pointerEvent.clientY;
	    const rect = layersPanel.getBoundingClientRect();
	    layersPanel.classList.add("is-dragging");
	    const movePointer = (moveEvent) => {
	      const x = clamp(rect.left + moveEvent.clientX - startX, 8, window.innerWidth - layersPanel.offsetWidth - 8);
	      const minY = getLayersPanelSafeTop();
	      const y = clamp(rect.top + moveEvent.clientY - startY, minY, Math.max(minY, window.innerHeight - 48));
	      layersPanel.style.left = `${x}px`;
	      layersPanel.style.top = `${y}px`;
	      layersPanel.style.right = "auto";
	    };
	    const stopPointer = () => {
	      layersPanel.classList.remove("is-dragging");
	      const x = parseFloat(layersPanel.style.left || String(rect.left));
	      const y = parseFloat(layersPanel.style.top || String(rect.top));
	      tryWriteJson(layersPanelKey, {
	        ...readJson(layersPanelKey, {}),
	        x,
	        y,
	      }, "Preferenze livelli");
	      saveFloatingPanelState("layers", { x, y });
	      document.removeEventListener("pointermove", movePointer);
	      document.removeEventListener("pointerup", stopPointer);
	    };
    document.addEventListener("pointermove", movePointer);
    document.addEventListener("pointerup", stopPointer, { once: true });
  });

  root.addEventListener("pointermove", handleImageShapePointerMove);
  root.addEventListener("pointerdown", handleImageShapePointerDown, true);
  root.addEventListener("click", handleImageShapeClick, true);
  root.addEventListener("contextmenu", handleImageShapeContextMenu, true);
  root.addEventListener("pointerleave", clearImageShapeHover);
  document.addEventListener("pointerdown", handleImageContextMenuPointerDown, true);
  document.addEventListener("pointermove", handleGameSpawnPointerMove);
  document.addEventListener("pointerup", endGameSpawnDrag);
  document.addEventListener("pointercancel", endGameSpawnDrag);
  document.addEventListener("pointermove", handleGameWalkPointPointerMove);
  document.addEventListener("pointerup", endGameWalkPointDrag);
  document.addEventListener("pointercancel", endGameWalkPointDrag);
  document.addEventListener("keyup", handleGamePreviewKeyUp);
  window.addEventListener("blur", clearGamePreviewInput);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearGamePreviewInput();
  });
  window.addEventListener("resize", hideImageContextMenu);
  window.addEventListener("scroll", hideImageContextMenu, true);

  window.addEventListener("storage", (storageEvent) => {
    if (storageEvent.key === bgImageKey || storageEvent.key === settingsKey) applyBackgroundImage();
    if (storageEvent.key === canvasBackgroundKey) {
      canvasBackground = normalizeCanvasBackground(readJson(canvasBackgroundKey, null));
      applyCanvasBackground();
      syncCanvasBackgroundControls();
    }
    if (storageEvent.key === gameRoomKey) {
      gameRoom = normalizeGameRoom(readJson(gameRoomKey, null));
      updateGameWalkStatus();
      updateGameSpawnStatus();
      syncGameInputControls();
      updateGamePreviewStatus();
      renderGameWalkOverlay();
    }
    if (storageEvent.key === imageBoxesKey) {
      const next = loadImageBoxes();
      imageBoxes = next.images;
      removedImageIds = next.removedIds;
      renderImageBoxes(false);
      renderLayersList();
      resetImageHistory();
      void hydrateImageBoxesFromLocalAssets();
    }
    if (storageEvent.key === galleriesKey) {
      const next = loadGalleries();
      galleries = next.galleries;
      removedGalleryIds = next.removedIds;
      renderGalleries(false);
      renderLayersList();
      void hydrateGalleriesFromLocalAssets();
    }
    if (storageEvent.key === snapSettingsKey) applySnapGridVisual(readSnapSettings());
  });
  window.addEventListener("claudia-editor:snap-settings", (event) => applySnapGridVisual(event.detail));
  window.addEventListener("content-editor:updated", renderLayersList);

  applySnapGridVisual();
  applyBackgroundImage();
  applyCanvasBackground();
  syncCanvasBackgroundControls();
  updateGameWalkStatus();
  updateGameSpawnStatus();
  syncGameInputControls();
  setPublicMode(false);
  const seededDemoOnLoad = seedDemoImages(false, false);
  if (!seededDemoOnLoad) ensureDemoLinks();
  renderImageBoxes(false);
  void hydrateImageBoxesFromLocalAssets();
  renderGalleries(false);
  void hydrateGalleriesFromLocalAssets();
	  setupEditorMenuBar();
	  setupFloatingPanel(layersPanel, "layers", { opacity: 88, scale: 100 });
	  loadLayersPanel();
	  placeLayersPanelSafely(true);
	  setupFloatingPanel(motionPanel, "motion", { opacity: 92, scale: 100 });
  setupFloatingPanel(backgroundPanel, "background", { opacity: 92, scale: 100 });
  setupFloatingPanel(spritePanel, "sprite", { opacity: 92, scale: 100 });
  setupFloatingPanel(cutoutPanel, "cutout", { opacity: 92, scale: 100 });
  setupFloatingPanel(gamePanel, "game", { opacity: 92, scale: 100 });
  ensureAdvancedPanelTabs();
  syncInspectorDockState();
  updateCameraReadout();
  renderLayersList();
  if (imageBoardMode && !activeItem && imageBoxes[0]) selectItem("image", imageBoxes[0].id);
  updateImageToolState();
  captureImageHistoryBaseline();
  };

  document.querySelectorAll("[data-advanced-editor-root]").forEach(initSharedAdvancedEditor);
  window.ClaudiaSharedAdvancedEditor = { init: initSharedAdvancedEditor };
})();
