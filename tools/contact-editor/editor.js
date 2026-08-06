import { loadPageConfiguration, savePageConfiguration, uploadEditorImage } from "./editor-api.js";
import { devices, pageDefaultVariables, pageDefinitions } from "./editor-registry.js";

(() => {
  "use strict";

  const preview = document.querySelector("[data-preview]");
  const viewport = document.querySelector("[data-viewport]");
  const scaled = document.querySelector("[data-scaled]");
  const controls = document.querySelector("[data-controls]");
  const selectionName = document.querySelector("[data-selection-name]");
  const selectionSelector = document.querySelector("[data-selection-selector]");
  const quickSelect = document.querySelector("[data-quick-select]");
  const saveButton = document.querySelector("[data-save]");
  const saveState = document.querySelector("[data-save-state]");
  const stageStatus = document.querySelector("[data-stage-status]");
  const undoButton = document.querySelector("[data-undo]");
  const redoButton = document.querySelector("[data-redo]");
  const textInput = document.querySelector("[data-text]");
  const fontUrlInput = document.querySelector("[data-font-url]");
  const scopeLabel = document.querySelector("[data-scope-label]");
  const publicLink = document.querySelector(".link-button");
  const pageSelect = document.querySelector("[data-page-select]");
  const socialControls = document.querySelector("[data-social-controls]");
  const iconNameInput = document.querySelector("[data-icon-name]");
  const iconSizeInput = document.querySelector("[data-icon-size]");
  const imageControls = document.querySelector("[data-image-controls]");
  const imageSrcInput = document.querySelector("[data-image-src]");
  const imageFileInput = document.querySelector("[data-image-file]");
  const imageAltInput = document.querySelector("[data-image-alt]");
  const languageGroup = document.querySelector('[aria-label="Lingua della pagina"]');
  const channel = "BroadcastChannel" in window ? new BroadcastChannel("claudia-contact-editor") : null;

  let configuration = { version: 1, updatedAt: null, global: { fontUrl: "", variables: {} }, elements: {} };
  let savedSnapshot = "";
  let selectedElement = null;
  let selectedSelector = "";
  let selectedLabel = "";
  let currentDevice = "desktop";
  let currentLanguage = "it";
  let currentPage = new URLSearchParams(location.search).get("page") || "contatti";
  if (!pageDefinitions[currentPage]) currentPage = "contatti";
  let activeConfigurationPage = currentPage;
  let undoStack = [];
  let redoStack = [];
  let loadingControls = false;
  let dragState = null;

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const defaultVariables = () => pageDefaultVariables[currentPage] || pageDefaultVariables.contatti;
  const snapshot = () => JSON.stringify(configuration);
  const scope = () => devices[currentDevice].scope;
  const frameDocument = () => preview.contentDocument;

  const setStageStatus = (message) => { stageStatus.textContent = message; };
  const setSaveState = (message, state = "") => {
    saveState.textContent = message;
    saveState.className = `save-state${state ? ` is-${state}` : ""}`;
  };

  const markDirty = () => {
    const dirty = snapshot() !== savedSnapshot;
    setSaveState(dirty ? "Modifiche non salvate" : "Salvato", dirty ? "dirty" : "");
  };

  const pushUndo = () => {
    undoStack.push(snapshot());
    if (undoStack.length > 100) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
  };

  const updateHistoryButtons = () => {
    undoButton.disabled = undoStack.length === 0;
    redoButton.disabled = redoStack.length === 0;
  };

  const broadcastPreview = () => {
    channel?.postMessage({ type: "preview", configuration });
  };

  const applyConfiguration = () => {
    preview.contentWindow?.ClaudiaContactCustomizer?.apply(configuration);
    broadcastPreview();
    if (selectedSelector) selectedElement = frameDocument()?.querySelector(selectedSelector) || null;
    highlightSelection();
  };

  const mutate = (callback, { history = true } = {}) => {
    if (history) pushUndo();
    callback();
    applyConfiguration();
    markDirty();
  };

  const definitionForSelection = (create = false) => {
    if (!selectedSelector) return null;
    if (!configuration.elements[selectedSelector] && create) {
      configuration.elements[selectedSelector] = { label: selectedLabel, styles: {} };
    }
    return configuration.elements[selectedSelector] || null;
  };

  const cleanDefinition = () => {
    const definition = definitionForSelection();
    if (!definition) return;
    for (const key of Object.keys(definition.styles || {})) {
      if (!Object.keys(definition.styles[key] || {}).length) delete definition.styles[key];
    }
    if (
      definition.text === undefined
      && definition.src === undefined
      && definition.alt === undefined
      && !definition.icon
      && !Object.keys(definition.iconSize || {}).length
      && !Object.keys(definition.hover || {}).length
      && !Object.keys(definition.styles || {}).length
    ) {
      delete configuration.elements[selectedSelector];
    }
  };

  const updateStyle = (property, value, options = {}) => {
    if (!selectedSelector || loadingControls) return;
    mutate(() => {
      const definition = definitionForSelection(true);
      definition.styles ||= {};
      definition.styles[scope()] ||= {};
      const cleanValue = String(value || "").trim();
      if (cleanValue) definition.styles[scope()][property] = cleanValue;
      else delete definition.styles[scope()][property];
      cleanDefinition();
    }, options);
  };

  const updateText = (value) => {
    if (!selectedSelector || loadingControls) return;
    mutate(() => {
      const definition = definitionForSelection(true);
      definition.text = String(value).slice(0, 5000);
    });
  };

  const updateImageSource = (value) => {
    if (!selectedSelector || loadingControls || selectedElement?.tagName !== "IMG") return;
    mutate(() => {
      const definition = definitionForSelection(true);
      const cleanValue = String(value || "").trim().slice(0, 4 * 1024 * 1024);
      if (cleanValue) definition.src = cleanValue;
      else delete definition.src;
      if (cleanValue) {
        definition.styles ||= {};
        definition.styles[scope()] ||= {};
        if (preview.contentWindow.getComputedStyle(selectedElement).display === "none") {
          definition.styles[scope()].display = "block";
        }
      }
      cleanDefinition();
    });
  };

  const updateImageAlt = (value) => {
    if (!selectedSelector || loadingControls || selectedElement?.tagName !== "IMG") return;
    mutate(() => {
      const definition = definitionForSelection(true);
      const cleanValue = String(value || "").trim().slice(0, 500);
      if (cleanValue) definition.alt = cleanValue;
      else delete definition.alt;
      cleanDefinition();
    });
  };

  const updateIcon = (value) => {
    if (!selectedSelector || loadingControls) return;
    mutate(() => {
      const definition = definitionForSelection(true);
      if (value) definition.icon = value;
      else delete definition.icon;
      cleanDefinition();
    });
  };

  const updateIconSize = (value) => {
    if (!selectedSelector || loadingControls) return;
    mutate(() => {
      const definition = definitionForSelection(true);
      definition.iconSize ||= {};
      if (String(value).trim()) definition.iconSize[scope()] = String(value).trim();
      else delete definition.iconSize[scope()];
      cleanDefinition();
    });
  };

  const updateHover = (property, value) => {
    if (!selectedSelector || loadingControls) return;
    mutate(() => {
      const definition = definitionForSelection(true);
      definition.hover ||= {};
      definition.hover[scope()] ||= {};
      if (String(value).trim()) definition.hover[scope()][property] = String(value).trim();
      else delete definition.hover[scope()][property];
      if (!Object.keys(definition.hover[scope()]).length) delete definition.hover[scope()];
      cleanDefinition();
    });
  };

  const prettify = (value) => String(value || "elemento")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const cssEscape = (value) => window.CSS?.escape ? CSS.escape(value) : String(value).replace(/["\\]/g, "\\$&");

  const stableSelector = (element) => {
    element = element?.closest?.("[data-contact-edit]") || element;
    const editorKey = element.getAttribute?.("data-contact-edit");
    if (editorKey) return `[data-contact-edit="${cssEscape(editorKey)}"]`;
    if (element.id?.startsWith("contact-")) return `#${cssEscape(element.id)}`;
    if (element.classList?.contains("site-language-switcher")) return ".site-language-switcher";
    const main = element.closest?.("main.contact-public");
    if (!main) return "";
    const parts = [];
    let node = element;
    while (node && node !== main) {
      let part = node.localName;
      const classes = [...node.classList].filter((name) => !name.startsWith("claudia-editor-")).slice(0, 2);
      if (classes.length) part += classes.map((name) => `.${cssEscape(name)}`).join("");
      const sameTags = node.parentElement ? [...node.parentElement.children].filter((child) => child.localName === node.localName) : [];
      if (sameTags.length > 1) part += `:nth-of-type(${sameTags.indexOf(node) + 1})`;
      parts.unshift(part);
      node = node.parentElement;
    }
    return `main.contact-public > ${parts.join(" > ")}`;
  };

  const labelFor = (element) => {
    element = element?.closest?.("[data-contact-edit]") || element;
    const key = element.getAttribute?.("data-contact-edit");
    if (key) return prettify(key);
    const text = (element.textContent || "").trim().replace(/\s+/g, " ");
    return text && text.length <= 38 ? text : prettify(element.localName);
  };

  const textEditable = (element) => {
    if (!element || element.children.length > 0) return false;
    return !["IMG", "INPUT", "TEXTAREA", "SVG", "PATH", "FORM", "NAV"].includes(element.tagName);
  };

  const rgbToHex = (color) => {
    const match = String(color).match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);
    if (!match) return /^#[0-9a-f]{6}$/i.test(color) ? color : "#000000";
    return `#${[match[1], match[2], match[3]].map((part) => Number(part).toString(16).padStart(2, "0")).join("")}`;
  };

  const parseTranslate = (value) => {
    const numbers = String(value || "").match(/-?\d+(?:\.\d+)?/g) || [];
    return { x: Number(numbers[0] || 0), y: Number(numbers[1] || 0) };
  };

  const highlightSelection = () => {
    const doc = frameDocument();
    doc?.querySelectorAll(".claudia-editor-selected").forEach((element) => element.classList.remove("claudia-editor-selected"));
    selectedElement?.classList.add("claudia-editor-selected");
  };

  const loadControls = () => {
    loadingControls = true;
    controls.setAttribute("aria-disabled", selectedElement ? "false" : "true");
    selectionName.textContent = selectedElement ? selectedLabel : "Nessun elemento";
    selectionSelector.textContent = selectedSelector || "Clicca qualcosa nell’anteprima";
    const definition = definitionForSelection();
    const styles = definition?.styles?.[scope()] || {};
    const computed = selectedElement ? preview.contentWindow.getComputedStyle(selectedElement) : null;
    const isSocial = Boolean(selectedElement?.matches?.("[data-social-icon]"));
    const isImage = selectedElement?.tagName === "IMG";

    document.querySelectorAll("[data-style]").forEach((input) => {
      const property = input.dataset.style;
      input.value = styles[property] || "";
      if (computed && input.tagName === "INPUT" && input.type !== "number") {
        input.placeholder = computed.getPropertyValue(property).trim() || input.placeholder;
      }
    });
    document.querySelectorAll("[data-choice]").forEach((button) => {
      const current = styles[button.dataset.choice] || computed?.getPropertyValue(button.dataset.choice).trim();
      button.classList.toggle("is-active", current === button.dataset.value);
    });
    document.querySelectorAll("[data-color-picker]").forEach((picker) => {
      const property = picker.dataset.colorPicker;
      picker.value = rgbToHex(styles[property] || computed?.getPropertyValue(property) || "#000000");
    });
    const translate = parseTranslate(styles.translate);
    document.querySelector('[data-axis="x"]').value = String(Math.max(-300, Math.min(300, translate.x)));
    document.querySelector('[data-axis="y"]').value = String(Math.max(-300, Math.min(300, translate.y)));
    document.querySelector('[data-axis-output="x"]').textContent = `${translate.x} px`;
    document.querySelector('[data-axis-output="y"]').textContent = `${translate.y} px`;

    textInput.disabled = !textEditable(selectedElement);
    textInput.value = textEditable(selectedElement) ? (definition?.text ?? selectedElement.textContent ?? "") : "";
    textInput.placeholder = textEditable(selectedElement) ? "Testo dell’elemento" : "Seleziona un singolo testo, non il box che lo contiene";
    socialControls.hidden = !isSocial;
    imageControls.hidden = !isImage;
    if (isImage) {
      imageSrcInput.value = definition?.src || selectedElement.getAttribute("src") || "";
      imageAltInput.value = definition?.alt ?? selectedElement.getAttribute("alt") ?? "";
      imageFileInput.value = "";
    }
    if (isSocial) {
      iconNameInput.value = definition?.icon || "";
      iconSizeInput.value = definition?.iconSize?.[scope()] || "";
      iconSizeInput.placeholder = preview.contentWindow.getComputedStyle(selectedElement.querySelector("svg")).width || "21px";
      document.querySelectorAll("[data-shape]").forEach((button) => {
        const currentRadius = styles["border-radius"] || computed?.borderRadius || "0px";
        const active = button.dataset.shape === "999px"
          ? parseFloat(currentRadius) > 100
          : currentRadius === button.dataset.shape || (button.dataset.shape === "0" && parseFloat(currentRadius) === 0);
        button.classList.toggle("is-active", active);
      });
      document.querySelectorAll("[data-hover]").forEach((input) => {
        input.value = definition?.hover?.[scope()]?.[input.dataset.hover] || "";
      });
      document.querySelectorAll("[data-hover-picker]").forEach((picker) => {
        picker.value = rgbToHex(definition?.hover?.[scope()]?.[picker.dataset.hoverPicker] || computed?.getPropertyValue(picker.dataset.hoverPicker) || "#000000");
      });
    }
    scopeLabel.textContent = devices[currentDevice].label;
    loadingControls = false;
  };

  const selectElement = (element) => {
    if (!element) return;
    if (["PATH", "SVG"].includes(element.tagName)) element = element.closest("a, button") || element.parentElement;
    element = element.closest?.("[data-contact-edit]") || element;
    const selector = stableSelector(element);
    if (!selector) return;
    selectedElement = element;
    selectedSelector = selector;
    selectedLabel = labelFor(element);
    highlightSelection();
    quickSelect.value = selector;
    loadControls();
    setStageStatus(`${selectedLabel} · trascina per spostare`);
  };

  const clearSelection = () => {
    selectedElement = null;
    selectedSelector = "";
    selectedLabel = "";
    highlightSelection();
    loadControls();
  };

  const populateQuickSelect = () => {
    quickSelect.replaceChildren(new Option("Scegli un elemento…", ""));
    const seen = new Set();
    frameDocument()?.querySelectorAll("[data-contact-edit]").forEach((element) => {
      const selector = stableSelector(element);
      if (!selector || seen.has(selector)) return;
      seen.add(selector);
      quickSelect.add(new Option(labelFor(element), selector));
    });
    quickSelect.add(new Option("Selettore lingua", ".site-language-switcher"));
  };

  const installFrameEditing = () => {
    const doc = frameDocument();
    if (!doc) return;
    const editorStyle = doc.createElement("style");
    editorStyle.id = "claudia-editor-overlay";
    editorStyle.textContent = `
      main.contact-public *, [data-contact-edit], .site-language-switcher { cursor: crosshair !important; }
      .claudia-editor-selected { outline: 3px solid #ff3b30 !important; outline-offset: 3px !important; }
      .claudia-editor-selected::selection { background: transparent; }
    `;
    doc.head.appendChild(editorStyle);

    doc.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      selectElement(event.target);
    }, true);
    doc.addEventListener("submit", (event) => event.preventDefault(), true);
    doc.addEventListener("pointerdown", startDrag, true);
    doc.addEventListener("pointermove", moveDrag, true);
    doc.addEventListener("pointerup", endDrag, true);
    doc.addEventListener("pointercancel", endDrag, true);
  };

  const startDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    let target = event.target;
    if (["PATH", "SVG"].includes(target.tagName)) target = target.closest("a, button") || target.parentElement;
    selectElement(target);
    const current = definitionForSelection()?.styles?.[scope()]?.translate;
    const translate = parseTranslate(current);
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: translate.x,
      originY: translate.y,
      initial: snapshot(),
      moved: false,
    };
    target.setPointerCapture?.(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    const dx = Math.round(event.clientX - dragState.startX);
    const dy = Math.round(event.clientY - dragState.startY);
    if (!dragState.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    dragState.moved = true;
    const x = dragState.originX + dx;
    const y = dragState.originY + dy;
    updateStyle("translate", `${x}px ${y}px`, { history: false });
    document.querySelector('[data-axis="x"]').value = String(Math.max(-300, Math.min(300, x)));
    document.querySelector('[data-axis="y"]').value = String(Math.max(-300, Math.min(300, y)));
    document.querySelector('[data-axis-output="x"]').textContent = `${x} px`;
    document.querySelector('[data-axis-output="y"]').textContent = `${y} px`;
  };

  const endDrag = (event) => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    if (dragState.moved) {
      undoStack.push(dragState.initial);
      if (undoStack.length > 100) undoStack.shift();
      redoStack = [];
      updateHistoryButtons();
    }
    dragState = null;
  };

  const resizePreview = () => {
    const device = devices[currentDevice];
    const availableWidth = Math.max(300, viewport.clientWidth - 48);
    const availableHeight = Math.max(300, viewport.clientHeight - 92);
    const scale = Math.min(1, availableWidth / device.width, availableHeight / device.height);
    preview.style.width = `${device.width}px`;
    preview.style.height = `${device.height}px`;
    preview.style.transform = `scale(${scale})`;
    scaled.style.width = `${Math.round(device.width * scale)}px`;
    scaled.style.height = `${Math.round(device.height * scale)}px`;
  };

  const setDevice = (deviceName) => {
    currentDevice = deviceName;
    document.querySelectorAll("[data-device]").forEach((button) => button.classList.toggle("is-active", button.dataset.device === deviceName));
    resizePreview();
    loadControls();
    setStageStatus(`${prettify(deviceName)} · le modifiche seguono questa dimensione`);
  };

  const setLanguage = (language) => {
    currentLanguage = language;
    document.querySelectorAll("[data-language]").forEach((button) => button.classList.toggle("is-active", button.dataset.language === language));
    const page = pageDefinitions[currentPage];
    const separator = page.path.includes("?") ? "&" : "?";
    publicLink.href = page.languages === false ? page.path : `${page.path}${separator}lang=${language}`;
    preview.title = `Anteprima pagina ${page.label}`;
    clearSelection();
    setStageStatus(`Carico ${page.label}, versione ${language.toUpperCase()}…`);
    preview.src = page.languages === false
      ? `${page.path}${separator}editor-preview=1`
      : `${page.path}${separator}lang=${language}&editor-preview=1`;
  };

  const setPage = (pageName, { updateHistory = true } = {}) => {
    currentPage = pageDefinitions[pageName] ? pageName : "contatti";
    pageSelect.value = currentPage;
    document.querySelector(".palette-panel").hidden = currentPage === "bio" || currentPage === "collage";
    languageGroup.hidden = pageDefinitions[currentPage].languages === false;
    if (updateHistory) history.replaceState(null, "", `/__editor/?page=${encodeURIComponent(currentPage)}`);
    setLanguage(currentLanguage);
  };

  const loadConfiguration = async () => {
    activeConfigurationPage = currentPage;
    configuration = await loadPageConfiguration(activeConfigurationPage);
    configuration.global ||= { fontUrl: "", variables: {} };
    configuration.global.variables ||= {};
    configuration.elements ||= {};
    savedSnapshot = snapshot();
    fontUrlInput.value = configuration.global.fontUrl || "";
    document.querySelectorAll("[data-variable]").forEach((input) => {
      input.value = configuration.global.variables[input.dataset.variable] || defaultVariables()[input.dataset.variable];
    });
    markDirty();
  };

  const save = async () => {
    saveButton.disabled = true;
    saveButton.classList.add("is-saving");
    saveButton.textContent = "Salvataggio…";
    setSaveState("Salvataggio…", "dirty");
    try {
      configuration = await savePageConfiguration(activeConfigurationPage, configuration);
      savedSnapshot = snapshot();
      setSaveState("Salvato");
      setStageStatus("Salvato · la pagina pubblica è aggiornata");
      channel?.postMessage({ type: "saved" });
    } catch (error) {
      setSaveState(error.message || "Errore", "error");
      setStageStatus("Non ho potuto salvare. Riprova.");
    } finally {
      saveButton.disabled = false;
      saveButton.classList.remove("is-saving");
      saveButton.textContent = "Salva modifiche";
    }
  };

  const restoreSnapshot = (serialized) => {
    configuration = JSON.parse(serialized);
    applyConfiguration();
    loadControls();
    markDirty();
    updateHistoryButtons();
  };

  preview.addEventListener("load", () => {
    installFrameEditing();
    preview.contentWindow?.ClaudiaContactCustomizer?.apply(configuration);
    populateQuickSelect();
    clearSelection();
    resizePreview();
    setStageStatus("Pronto · clicca qualsiasi elemento per modificarlo");
  });

  quickSelect.addEventListener("change", () => {
    if (!quickSelect.value) return clearSelection();
    const element = frameDocument()?.querySelector(quickSelect.value);
    if (element) {
      selectElement(element);
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  document.querySelectorAll("[data-style]").forEach((input) => {
    input.addEventListener("input", () => updateStyle(input.dataset.style, input.value));
  });
  textInput.addEventListener("input", () => updateText(textInput.value));
  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const definition = definitionForSelection();
      const current = definition?.styles?.[scope()]?.[button.dataset.choice];
      updateStyle(button.dataset.choice, current === button.dataset.value ? "" : button.dataset.value);
      loadControls();
    });
  });
  document.querySelectorAll("[data-color-picker]").forEach((picker) => {
    picker.addEventListener("input", () => {
      const textField = document.querySelector(`[data-style="${picker.dataset.colorPicker}"]`);
      textField.value = picker.value;
      updateStyle(picker.dataset.colorPicker, picker.value);
    });
  });
  document.querySelectorAll("[data-axis]").forEach((input) => {
    input.addEventListener("input", () => {
      const axis = input.dataset.axis;
      document.querySelector(`[data-axis-output="${axis}"]`).textContent = `${input.value} px`;
      const x = document.querySelector('[data-axis="x"]').value;
      const y = document.querySelector('[data-axis="y"]').value;
      updateStyle("translate", `${x}px ${y}px`);
    });
  });

  imageSrcInput.addEventListener("change", () => { updateImageSource(imageSrcInput.value); loadControls(); });
  imageAltInput.addEventListener("input", () => updateImageAlt(imageAltInput.value));
  imageFileInput.addEventListener("change", async () => {
    const file = imageFileInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Seleziona un file immagine.");
      imageFileInput.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      window.alert("L’immagine supera 2 MB. Ridimensionala prima di caricarla.");
      imageFileInput.value = "";
      return;
    }
    imageFileInput.disabled = true;
    setStageStatus("Caricamento immagine…");
    try {
      imageSrcInput.value = await uploadEditorImage(activeConfigurationPage, file);
      updateImageSource(imageSrcInput.value);
      loadControls();
      setStageStatus("Immagine caricata · salva le modifiche per pubblicarla");
    } catch (error) {
      window.alert(error.message || "Caricamento non riuscito");
      setStageStatus("Caricamento immagine non riuscito");
    } finally {
      imageFileInput.disabled = false;
      imageFileInput.value = "";
    }
  });
  document.querySelector("[data-image-show]").addEventListener("click", () => { updateStyle("display", "block"); loadControls(); });
  document.querySelector("[data-image-hide]").addEventListener("click", () => { updateStyle("display", "none"); loadControls(); });
  document.querySelector("[data-image-reset]").addEventListener("click", () => {
    if (!selectedSelector || selectedElement?.tagName !== "IMG") return;
    mutate(() => {
      const definition = definitionForSelection();
      if (!definition) return;
      delete definition.src;
      delete definition.alt;
      if (definition.styles?.[scope()]) delete definition.styles[scope()].display;
      cleanDefinition();
    });
    loadControls();
  });

  iconNameInput.addEventListener("change", () => { updateIcon(iconNameInput.value); loadControls(); });
  iconSizeInput.addEventListener("input", () => updateIconSize(iconSizeInput.value));
  document.querySelectorAll("[data-shape]").forEach((button) => {
    button.addEventListener("click", () => { updateStyle("border-radius", button.dataset.shape); loadControls(); });
  });
  document.querySelectorAll("[data-hover]").forEach((input) => {
    input.addEventListener("input", () => updateHover(input.dataset.hover, input.value));
  });
  document.querySelectorAll("[data-hover-picker]").forEach((picker) => {
    picker.addEventListener("input", () => {
      const textField = document.querySelector(`[data-hover="${picker.dataset.hoverPicker}"]`);
      textField.value = picker.value;
      updateHover(picker.dataset.hoverPicker, picker.value);
    });
  });

  document.querySelectorAll("[data-variable]").forEach((input) => {
    input.addEventListener("input", () => {
      mutate(() => { configuration.global.variables[input.dataset.variable] = input.value; });
    });
  });
  fontUrlInput.addEventListener("change", () => {
    mutate(() => { configuration.global.fontUrl = fontUrlInput.value.trim(); });
  });

  document.querySelectorAll("[data-device]").forEach((button) => button.addEventListener("click", () => setDevice(button.dataset.device)));
  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.language)));
  pageSelect.value = currentPage;
  pageSelect.addEventListener("change", async () => {
    setPage(pageSelect.value);
    undoStack = [];
    redoStack = [];
    updateHistoryButtons();
    try {
      await loadConfiguration();
      applyConfiguration();
      loadControls();
    } catch (error) {
      setSaveState(error.message || "Editor non disponibile", "error");
      setStageStatus("Impossibile caricare la configurazione della pagina");
    }
  });

  document.querySelector("[data-reset-scope]").addEventListener("click", () => {
    if (!selectedSelector) return;
    mutate(() => {
      const definition = definitionForSelection();
      if (definition?.styles) delete definition.styles[scope()];
      if (definition?.iconSize) delete definition.iconSize[scope()];
      if (definition?.hover) delete definition.hover[scope()];
      cleanDefinition();
    });
    loadControls();
  });
  document.querySelector("[data-reset-element]").addEventListener("click", () => {
    if (!selectedSelector) return;
    mutate(() => { delete configuration.elements[selectedSelector]; });
    loadControls();
  });
  document.querySelector("[data-reset-all]").addEventListener("click", () => {
    if (currentPage === "bio" && activeConfigurationPage === "contatti") {
      window.alert("Il ripristino totale è disabilitato in modalità compatibilità, per proteggere la pagina Contatti.");
      return;
    }
    if (!window.confirm(`Ripristinare tutte le personalizzazioni di ${pageDefinitions[currentPage].label}?`)) return;
    mutate(() => {
      configuration.elements = {};
      configuration.global = { fontUrl: "", variables: {} };
      fontUrlInput.value = "";
      document.querySelectorAll("[data-variable]").forEach((input) => { input.value = defaultVariables()[input.dataset.variable]; });
    });
    loadControls();
  });

  undoButton.addEventListener("click", () => {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restoreSnapshot(undoStack.pop());
  });
  redoButton.addEventListener("click", () => {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restoreSnapshot(redoStack.pop());
  });
  saveButton.addEventListener("click", save);
  window.addEventListener("keydown", (event) => {
    if (!(event.metaKey || event.ctrlKey)) return;
    if (event.key.toLowerCase() === "s") { event.preventDefault(); void save(); }
    if (event.key.toLowerCase() === "z" && !event.shiftKey) { event.preventDefault(); undoButton.click(); }
    if ((event.key.toLowerCase() === "z" && event.shiftKey) || event.key.toLowerCase() === "y") { event.preventDefault(); redoButton.click(); }
  });
  new ResizeObserver(resizePreview).observe(viewport);

  setPage(currentPage, { updateHistory: false });

  loadConfiguration()
    .then(() => {
      if (preview.contentDocument?.readyState === "complete") {
        preview.dispatchEvent(new Event("load"));
      }
    })
    .catch((error) => {
      setSaveState(error.message || "Editor non disponibile", "error");
      setStageStatus("Impossibile caricare l’editor locale");
    });
})();
