(() => {
  let apiUrl = "/api/editor-state";
  let forcePushLocal = false;
  const clientVersion = 11;
  const syncedPrefixes = ["claudia-editor-", "claudia-content-"];
  const sharedPrefix = "claudia-editor-shared-";
  const revisionKey = `${sharedPrefix}revision`;
  const clientKey = `${sharedPrefix}client-id`;
  const reloadKey = `${sharedPrefix}reload-revision`;
  const dirtyKey = `${sharedPrefix}dirty`;
  const dirtyBaseRevisionKey = `${sharedPrefix}dirty-base-revision`;
  const nativeSetItem = Storage.prototype.setItem;
  const nativeRemoveItem = Storage.prototype.removeItem;
  const nativeGetItem = Storage.prototype.getItem;
  const pendingItems = new Map();
  const pendingRemovals = new Set();

  let serverAvailable = false;
  let applyingRemoteState = false;
  let flushTimer = 0;

  function markSyncReady() {
    try {
      window.dispatchEvent(new CustomEvent("editor-sync:ready"));
    } catch {}
  }

  function isEditorKey(key) {
    return typeof key === "string" && syncedPrefixes.some((prefix) => key.startsWith(prefix)) && !key.startsWith(sharedPrefix);
  }

  function getRaw(key) {
    return nativeGetItem.call(window.localStorage, key);
  }

  function setRaw(key, value) {
    nativeSetItem.call(window.localStorage, key, value);
  }

  function removeRaw(key) {
    nativeRemoveItem.call(window.localStorage, key);
  }

  function markDirty() {
    if (!hasDirtyLocalState()) setRaw(dirtyBaseRevisionKey, String(localRevision()));
    setRaw(dirtyKey, "1");
  }

  function clearDirty() {
    removeRaw(dirtyKey);
    removeRaw(dirtyBaseRevisionKey);
  }

  function hasDirtyLocalState() {
    return getRaw(dirtyKey) === "1";
  }

  function dirtyBaseRevision() {
    return Number(getRaw(dirtyBaseRevisionKey) || localRevision() || 0);
  }

  function rewriteUrlWithoutParams(params) {
    const url = new URL(window.location.href);
    let changed = false;

    for (const param of params) {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        changed = true;
      }
    }

    if (changed) window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function configureApiTarget() {
    const url = new URL(window.location.href);
    const pushTarget = url.searchParams.get("pushEditorTo");
    const serverTarget = url.searchParams.get("editorServer");

    try {
      if (pushTarget) {
        apiUrl = new URL("/api/editor-state", pushTarget).href;
        forcePushLocal = true;
      } else if (serverTarget) {
        apiUrl = new URL("/api/editor-state", serverTarget).href;
      }
    } catch {
      apiUrl = "/api/editor-state";
    }

    if (url.searchParams.has("pushEditor")) forcePushLocal = true;
    rewriteUrlWithoutParams(["pushEditorTo", "editorServer", "pushEditor"]);
  }

  function setBadge(text, tone = "ok") {
    let badge = document.querySelector("[data-editor-sync-badge]");

    if (!(badge instanceof HTMLElement)) {
      badge = document.createElement("div");
      badge.dataset.editorSyncBadge = "true";
      badge.style.position = "fixed";
      badge.style.left = "12px";
      badge.style.bottom = "12px";
      badge.style.zIndex = "2147483647";
      badge.style.padding = "8px 12px";
      badge.style.borderRadius = "999px";
      badge.style.fontFamily = "Inter, system-ui, sans-serif";
      badge.style.fontSize = "12px";
      badge.style.fontWeight = "700";
      badge.style.letterSpacing = "0.08em";
      badge.style.textTransform = "uppercase";
      badge.style.boxShadow = "0 8px 28px rgba(0, 0, 0, 0.18)";
      badge.style.pointerEvents = "none";
      document.body.appendChild(badge);
    }

    badge.textContent = text;
    badge.style.background = tone === "push" ? "#e8ffbd" : "#111";
    badge.style.color = tone === "push" ? "#1d2607" : "#fff";
  }

  function apiEndpoint(pathname) {
    try {
      return new URL(pathname, apiUrl).href;
    } catch {
      return pathname;
    }
  }

  function readableFetchError(error) {
    const message = error?.message || "";
    if (/NetworkError|Failed to fetch|Load failed|Network request failed/i.test(message) || error instanceof TypeError) {
      return `CLAUDIA non è raggiungibile. Controlla che il Mac server sia acceso e che la pagina sia aperta da ${window.location.origin}.`;
    }
    return message || "Richiesta non riuscita";
  }

  function ensureHistoryUi() {
    if (document.querySelector("[data-editor-history-button]")) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", ensureHistoryUi, { once: true });
      return;
    }

    const makeFloatingButton = (label, bottom) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = label;
      item.style.position = "fixed";
      item.style.left = "12px";
      item.style.bottom = bottom;
      item.style.zIndex = "2147483647";
      item.style.padding = "8px 12px";
      item.style.border = "1px solid rgba(255,255,255,.32)";
      item.style.borderRadius = "999px";
      item.style.background = "rgba(255,255,255,.92)";
      item.style.color = "#111";
      item.style.fontFamily = "Inter, system-ui, sans-serif";
      item.style.fontSize = "12px";
      item.style.fontWeight = "800";
      item.style.letterSpacing = "0.08em";
      item.style.textTransform = "uppercase";
      item.style.boxShadow = "0 8px 28px rgba(0,0,0,.18)";
      item.style.cursor = "pointer";
      return item;
    };

    const quickButton = makeFloatingButton("Salva rapido", "90px");
    quickButton.dataset.editorQuickSaveButton = "true";

    const button = makeFloatingButton("Cronologia", "52px");
    button.dataset.editorHistoryButton = "true";

    const panel = document.createElement("aside");
    panel.dataset.editorHistoryPanel = "true";
    panel.hidden = true;
    panel.style.position = "fixed";
    panel.style.left = "12px";
    panel.style.bottom = "130px";
    panel.style.zIndex = "2147483647";
    panel.style.width = "min(440px, calc(100vw - 24px))";
    panel.style.maxHeight = "min(620px, calc(100vh - 112px))";
    panel.style.overflow = "auto";
    panel.style.padding = "14px";
    panel.style.border = "1px solid rgba(18,18,18,.18)";
    panel.style.borderRadius = "18px";
    panel.style.background = "rgba(255,255,255,.94)";
    panel.style.color = "#111";
    panel.style.fontFamily = "Inter, system-ui, sans-serif";
    panel.style.boxShadow = "0 18px 60px rgba(0,0,0,.24)";
    panel.style.backdropFilter = "blur(14px)";

    const renderLoading = () => {
      panel.replaceChildren();
      const text = document.createElement("p");
      text.textContent = "Carico cronologia…";
      text.style.margin = "0";
      panel.appendChild(text);
    };

    const formatDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleString("it-IT", { dateStyle: "short", timeStyle: "medium" });
    };

    const keyLabel = (key) =>
      `${key || ""}`
        .replace(/^claudia-editor-/, "")
        .replace(/^claudia-content-/, "contenuti ")
        .replace(/-v\d+$/, "")
        .replace(/-/g, " ");

    const makePanelButton = (label) => {
      const item = document.createElement("button");
      item.type = "button";
      item.textContent = label;
      item.style.border = "1px solid rgba(18,18,18,.18)";
      item.style.borderRadius = "999px";
      item.style.background = "#fff";
      item.style.padding = "7px 10px";
      item.style.font = "700 12px/1 Inter, system-ui, sans-serif";
      item.style.cursor = "pointer";
      return item;
    };

    const restoreBackup = async (backup) => {
      const ok = window.confirm(
        `Ripristinare il backup rev ${backup.revision} del ${formatDate(backup.updatedAt)}? La copia attuale resterà nella cronologia.`,
      );
      if (!ok) return;
      const response = await fetch(apiEndpoint("/api/editor-history/restore"), {
        method: "POST",
        cache: "no-store",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ id: backup.id, clientId: clientId(), clientVersion }),
      });
      if (!response.ok) throw new Error(`Ripristino non riuscito: ${response.status}`);
      const state = await response.json();
      const data = state && typeof state.data === "object" && !Array.isArray(state.data) ? state.data : {};
      applyServerState(data, Number(state.revision || 0));
      window.location.reload();
    };

    const renderHistory = (history) => {
      panel.replaceChildren();

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.style.gap = "10px";
      header.style.marginBottom = "12px";

      const title = document.createElement("div");
      title.innerHTML = `<strong style="display:block;font-size:14px;letter-spacing:.08em;text-transform:uppercase;">Cronologia CLAUDIA</strong><span style="display:block;margin-top:4px;font-size:12px;color:rgba(0,0,0,.58);"></span>`;
      title.querySelector("span").textContent =
        `Rev ${history.currentRevision || 0} · backup ogni ${history.backupIntervalMinutes || 5} min · ultime ${history.retentionHours || 24}h`;

      const close = makePanelButton("Chiudi");
      close.addEventListener("click", () => {
        panel.hidden = true;
      });
      header.append(title, close);

      const refresh = makePanelButton("Aggiorna");
      refresh.style.marginBottom = "12px";
      refresh.addEventListener("click", () => {
        void openHistory();
      });

      const backupsTitle = document.createElement("h3");
      backupsTitle.textContent = "Backup";
      backupsTitle.style.margin = "8px 0";
      backupsTitle.style.font = "800 12px/1 Inter, system-ui, sans-serif";
      backupsTitle.style.letterSpacing = ".08em";
      backupsTitle.style.textTransform = "uppercase";

      const backupList = document.createElement("div");
      backupList.style.display = "grid";
      backupList.style.gap = "7px";

      (history.backups || []).slice(0, 60).forEach((backup) => {
        const row = document.createElement("div");
        row.style.display = "grid";
        row.style.gridTemplateColumns = "1fr auto";
        row.style.gap = "8px";
        row.style.alignItems = "center";
        row.style.padding = "9px";
        row.style.border = "1px solid rgba(18,18,18,.12)";
        row.style.borderRadius = "12px";
        row.style.background = "rgba(0,0,0,.035)";

        const text = document.createElement("div");
        text.innerHTML = `<strong style="display:block;font-size:12px;"></strong><span style="display:block;margin-top:3px;font-size:11px;color:rgba(0,0,0,.58);"></span>`;
        text.querySelector("strong").textContent =
          `${backup.kind && backup.kind !== "auto" ? "Manuale" : "Auto"} · Rev ${backup.revision}`;
        text.querySelector("span").textContent = `${formatDate(backup.updatedAt)} · ${Math.round((backup.size || 0) / 1024)} KB`;

        const restore = makePanelButton("Ripristina");
        restore.addEventListener("click", async () => {
          try {
            await restoreBackup(backup);
          } catch (error) {
            window.alert(error.message || "Ripristino non riuscito");
          }
        });

        row.append(text, restore);
        backupList.appendChild(row);
      });

      if (!backupList.childElementCount) {
        const empty = document.createElement("p");
        empty.textContent = "Nessun backup 24h ancora disponibile.";
        empty.style.margin = "0 0 12px";
        empty.style.fontSize = "12px";
        backupList.appendChild(empty);
      }

      const changesTitle = document.createElement("h3");
      changesTitle.textContent = "Cambiamenti";
      changesTitle.style.margin = "14px 0 8px";
      changesTitle.style.font = "800 12px/1 Inter, system-ui, sans-serif";
      changesTitle.style.letterSpacing = ".08em";
      changesTitle.style.textTransform = "uppercase";

      const changesList = document.createElement("div");
      changesList.style.display = "grid";
      changesList.style.gap = "6px";
      (history.changes || []).slice(0, 80).forEach((change) => {
        const row = document.createElement("div");
        row.style.padding = "8px 9px";
        row.style.border = "1px solid rgba(18,18,18,.1)";
        row.style.borderRadius = "10px";
        const keys = [...(change.changedKeys || []), ...(change.removedKeys || [])].slice(0, 4).map(keyLabel);
        row.innerHTML = `<strong style="display:block;font-size:12px;"></strong><span style="display:block;margin-top:3px;font-size:11px;color:rgba(0,0,0,.58);"></span>`;
        row.querySelector("strong").textContent =
          `${
            change.type === "restore"
              ? "Ripristino"
              : change.type === "snapshot"
                ? "Salva rapido"
                : "Salvataggio"
          } · rev ${change.revision || "—"}`;
        row.querySelector("span").textContent =
          `${formatDate(change.updatedAt)} · ${change.updatedBy || "utente"}${keys.length ? ` · ${keys.join(", ")}` : ""}`;
        changesList.appendChild(row);
      });

      panel.append(header, refresh, backupsTitle, backupList, changesTitle, changesList);
    };

    async function openHistory() {
      panel.hidden = false;
      renderLoading();
      try {
        const response = await fetch(apiEndpoint("/api/editor-history"), {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`Cronologia non disponibile: ${response.status}`);
        renderHistory(await response.json());
      } catch (error) {
        panel.replaceChildren();
        const text = document.createElement("p");
        text.textContent = error.message || "Cronologia non disponibile";
        text.style.margin = "0";
        panel.appendChild(text);
      }
    }

    button.addEventListener("click", () => {
      if (panel.hidden) void openHistory();
      else panel.hidden = true;
    });

    quickButton.addEventListener("click", async () => {
      const previousText = quickButton.textContent;
      quickButton.disabled = true;
      quickButton.style.opacity = ".72";
      quickButton.textContent = "Salvo…";
      try {
        await flushPending(false);
        const response = await fetch(apiEndpoint("/api/editor-history/snapshot"), {
          method: "POST",
          cache: "no-store",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: clientId(), clientVersion }),
        });
        if (!response.ok) throw new Error(`Salva rapido non riuscito: ${response.status}`);
        quickButton.textContent = "Salvato ✓";
        if (!panel.hidden) void openHistory();
      } catch (error) {
        quickButton.textContent = "Errore";
        window.alert(readableFetchError(error));
      } finally {
        window.setTimeout(() => {
          quickButton.disabled = false;
          quickButton.style.opacity = "1";
          quickButton.textContent = previousText || "Salva rapido";
        }, 1200);
      }
    });

    document.body.append(quickButton, button, panel);
  }

  function consumeResetFlag() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("resetEditor")) return false;

    rewriteUrlWithoutParams(["resetEditor"]);
    applyingRemoteState = true;

    try {
      const keys = [];
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (isEditorKey(key) || (typeof key === "string" && key.startsWith(sharedPrefix))) keys.push(key);
      }
      keys.forEach((key) => removeRaw(key));
    } finally {
      applyingRemoteState = false;
    }

    return true;
  }

  function clientId() {
    let id = getRaw(clientKey);
    if (!id) {
      const randomPart =
        window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);
      id = `browser-${randomPart}`;
      setRaw(clientKey, id);
    }
    return id;
  }

  function localRevision() {
    return Number(getRaw(revisionKey) || 0);
  }

  function setLocalRevision(revision) {
    setRaw(revisionKey, String(Number(revision || 0)));
  }

  function collectLocalState() {
    const items = {};

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (isEditorKey(key)) items[key] = getRaw(key) || "";
    }

    return items;
  }

  function hasStateDifference(serverData) {
    const localData = collectLocalState();
    const keys = new Set([...Object.keys(localData), ...Object.keys(serverData)]);

    for (const key of keys) {
      if ((localData[key] || "") !== (serverData[key] || "")) return true;
    }

    return false;
  }

  function applyServerState(serverData, revision) {
    applyingRemoteState = true;

    try {
      const localKeys = Object.keys(collectLocalState());

      for (const key of localKeys) {
        if (!Object.prototype.hasOwnProperty.call(serverData, key)) removeRaw(key);
      }

      for (const [key, value] of Object.entries(serverData)) {
        if (isEditorKey(key)) setRaw(key, String(value ?? ""));
      }

      setLocalRevision(revision);
      clearDirty();
    } finally {
      applyingRemoteState = false;
    }
  }

  async function fetchState() {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Editor server non disponibile: ${response.status}`);
    return response.json();
  }

  async function postState(payload) {
    const baseRevision = hasDirtyLocalState() ? dirtyBaseRevision() : localRevision();
    const response = await fetch(apiUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload, baseRevision, clientId: clientId(), clientVersion }),
    });

    if (!response.ok) throw new Error(`Salvataggio non riuscito: ${response.status}`);
    const state = await response.json();
    setLocalRevision(state.revision);
    clearDirty();
    return state;
  }

  function requeue(items, removals) {
    for (const [key, value] of Object.entries(items)) pendingItems.set(key, value);
    for (const key of removals) pendingRemovals.add(key);
  }

  async function flushPending(fullState = false) {
    if (!serverAvailable) return;

    const items = fullState ? collectLocalState() : Object.fromEntries(pendingItems.entries());
    const removals = fullState ? [] : Array.from(pendingRemovals);

    if (!Object.keys(items).length && !removals.length) return;

    if (!fullState) {
      pendingItems.clear();
      pendingRemovals.clear();
    }

    try {
      await postState({ items, remove: removals });
      if (fullState) {
        pendingItems.clear();
        pendingRemovals.clear();
      }
    } catch (error) {
      if (!fullState) requeue(items, removals);
      markDirty();
      console.warn(error.message || error);
    }
  }

  function scheduleFlush() {
    if (!serverAvailable) return;
    window.clearTimeout(flushTimer);
    flushTimer = window.setTimeout(() => {
      void flushPending(false);
    }, 250);
  }

  Storage.prototype.setItem = function patchedSetItem(key, value) {
    const previousValue = this === window.localStorage && isEditorKey(key) ? nativeGetItem.call(this, key) : null;
    const result = nativeSetItem.apply(this, arguments);

    if (this === window.localStorage && isEditorKey(key) && !applyingRemoteState) {
      if (previousValue === String(value)) return result;
      markDirty();
      pendingRemovals.delete(key);
      pendingItems.set(key, String(value));
      scheduleFlush();
    }

    return result;
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key) {
    const hadValue = this === window.localStorage && isEditorKey(key) ? nativeGetItem.call(this, key) !== null : false;
    const result = nativeRemoveItem.apply(this, arguments);

    if (this === window.localStorage && isEditorKey(key) && !applyingRemoteState) {
      if (!hadValue) return result;
      markDirty();
      pendingItems.delete(key);
      pendingRemovals.add(key);
      scheduleFlush();
    }

    return result;
  };

  window.addEventListener("style-editor:save-all", () => {
    window.setTimeout(() => {
      void flushPending(false);
    }, 500);
  });

  window.addEventListener("beforeunload", () => {
    if (!serverAvailable || (!pendingItems.size && !pendingRemovals.size)) return;
    const payload = {
      items: Object.fromEntries(pendingItems.entries()),
      remove: Array.from(pendingRemovals),
      clientId: clientId(),
      clientVersion,
    };
    const body = JSON.stringify(payload);
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(apiUrl, blob);
  });

  async function pullRemoteUpdates() {
    if (!serverAvailable || pendingItems.size || pendingRemovals.size) return;

    try {
      const state = await fetchState();
      const serverRevision = Number(state.revision || 0);
      const serverData = state && typeof state.data === "object" && !Array.isArray(state.data) ? state.data : {};

      if (Object.keys(serverData).length && hasStateDifference(serverData)) {
        applyServerState(serverData, serverRevision);

        if (sessionStorage.getItem(reloadKey) !== String(serverRevision)) {
          sessionStorage.setItem(reloadKey, String(serverRevision));
          window.location.reload();
          return;
        }
      } else {
        setLocalRevision(serverRevision);
      }

      sessionStorage.removeItem(reloadKey);
    } catch {
      // Keep polling quietly; the editor can continue saving locally if the server drops for a moment.
    }
  }

  async function boot() {
    try {
      configureApiTarget();
      const resetRequested = consumeResetFlag();
      const localData = collectLocalState();
      const localDataCount = Object.keys(localData).length;
      const localDirty = hasDirtyLocalState();
      const localDirtyBaseRevision = dirtyBaseRevision();

      if (forcePushLocal && localDataCount) {
        serverAvailable = true;
        const pushedState = await postState({ items: localData, remove: [], replace: true });
        const pushedData =
          pushedState && typeof pushedState.data === "object" && !Array.isArray(pushedState.data) ? pushedState.data : {};
        applyServerState(pushedData, Number(pushedState.revision || 0));
        setBadge(`CLAUDIA aggiornata rev ${pushedState.revision}`, "push");
        ensureHistoryUi();
        window.setInterval(() => {
          void pullRemoteUpdates();
        }, 5000);
        markSyncReady();
        return;
      }

      const state = await fetchState();
      const serverData = state && typeof state.data === "object" && !Array.isArray(state.data) ? state.data : {};
      const serverRevision = Number(state.revision || 0);
      const serverDataCount = Object.keys(serverData).length;

      serverAvailable = true;
      setBadge(`CLAUDIA rev ${serverRevision}`);
      ensureHistoryUi();

      if (localDirty && localDataCount && (!serverDataCount || localDirtyBaseRevision >= serverRevision)) {
        const pushedState = await postState({ items: localData, remove: [], replace: true });
        const pushedData =
          pushedState && typeof pushedState.data === "object" && !Array.isArray(pushedState.data) ? pushedState.data : {};
        applyServerState(pushedData, Number(pushedState.revision || 0));
        setBadge(`CLAUDIA aggiornata rev ${pushedState.revision}`, "push");
      } else if (serverDataCount && (resetRequested || hasStateDifference(serverData))) {
        applyServerState(serverData, serverRevision);

        if (sessionStorage.getItem(reloadKey) !== String(serverRevision)) {
          sessionStorage.setItem(reloadKey, String(serverRevision));
          window.location.reload();
          return;
        }
      } else if (localDataCount && !serverDataCount) {
        await postState({ items: localData, remove: [] });
      } else {
        setLocalRevision(serverRevision);
      }

      sessionStorage.removeItem(reloadKey);
      if (pendingItems.size || pendingRemovals.size) scheduleFlush();
      window.setInterval(() => {
        void pullRemoteUpdates();
      }, 5000);
      markSyncReady();
    } catch {
      serverAvailable = false;
      markSyncReady();
    }
  }

  void boot();
})();
