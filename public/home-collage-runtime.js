(function () {
    const visualClickEffects = new Set(["pulse", "pop", "flash", "spin"]);
    const motionPresets = new Set(["none", "float", "drift-x", "drift-y", "orbit", "sway", "scroll-left"]);
    const number = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const canvas = document.querySelector("[data-public-canvas]");
    const tooltip = document.querySelector("[data-collage-tooltip]");
    const rawData = document.getElementById("canvas-data");
    const parseCanvasData = (value) => {
      const normalized = String(value || "[]").replace(
        /([:[,\s])(-?)\.(\d+)/g,
        (_match, prefix, sign, digits) => `${prefix}${sign}0.${digits}`,
      );
      return JSON.parse(normalized);
    };
    const items = rawData ? parseCanvasData(rawData.textContent) : [];
    const sourceItems = JSON.parse(JSON.stringify(items));
    const compositionBounds = Object.freeze({
      left: 471.0940323589004,
      top: 13.35546875,
      right: 1113.7157615345611,
      bottom: 858.9683719758065,
    });
    const boxes = new Map();
    const masks = new Map();
    const dragOffsets = new Map();
    const inertiaItems = new Map();
    const clickSuppressions = new Map();
    const locale = document.documentElement.dataset.locale === "en" ? "en" : "it";
    const localized = (value, fallback) => {
      if (value && typeof value === "object") return value[locale] || value.it || value.en || fallback;
      return String(value || fallback);
    };
    let hoverId = "";
    let raf = 0;
    let inertiaRaf = 0;
    let collageReady = false;
    let renderGeneration = 0;
    const camera = { x: 0, y: 0 };

    const layoutItems = () => {
      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const shortEdge = Math.min(viewportWidth, viewportHeight);
      const paddingX = shortEdge < 520 ? 12 : shortEdge < 900 ? 24 : 34;
      const paddingY = shortEdge < 520 ? 16 : shortEdge < 900 ? 28 : 34;
      const compositionWidth = compositionBounds.right - compositionBounds.left;
      const compositionHeight = compositionBounds.bottom - compositionBounds.top;
      const availableWidth = Math.max(viewportWidth - paddingX * 2, 1);
      const availableHeight = Math.max(viewportHeight - paddingY * 2, 1);
      const scale = Math.min(1.12, availableWidth / compositionWidth, availableHeight / compositionHeight);
      const offsetX = (viewportWidth - compositionWidth * scale) / 2 - compositionBounds.left * scale;
      const offsetY = (viewportHeight - compositionHeight * scale) / 2 - compositionBounds.top * scale;

      sourceItems.forEach((source, index) => {
        const item = items[index];
        if (!item) return;
        item.x = source.x * scale + offsetX;
        item.y = source.y * scale + offsetY;
        item.width = source.width * scale;
        item.motion = source.motion
          ? { ...source.motion, distance: number(source.motion.distance, 0) * scale }
          : source.motion;
        item.pathMotion = source.pathMotion
          ? {
              ...source.pathMotion,
              points: Array.isArray(source.pathMotion.points)
                ? source.pathMotion.points.map((point) => ({
                    x: point.x * scale + offsetX,
                    y: point.y * scale + offsetY,
                  }))
                : [],
            }
          : source.pathMotion;
      });

      canvas.dataset.collageScale = scale.toFixed(4);
      canvas.dataset.collageWidth = (compositionWidth * scale).toFixed(1);
      canvas.dataset.collageHeight = (compositionHeight * scale).toFixed(1);
    };

    const resolveLink = (value) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      if (raw.startsWith("#")) return window.location.pathname + raw;
      if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
      const path = raw.startsWith("/") ? raw : "/" + raw.replace(/^\/+/, "");
      const href = new URL(path, window.location.origin).href;
      const localizedUrl = window.ClaudiaLocale && window.ClaudiaLocale.localizedUrl;
      return localizedUrl ? new URL(localizedUrl(href), window.location.origin).href : href;
    };

    const motionActive = (motion) => motion && motion.preset !== "none" && motion.speed > 0 && motion.distance > 0;
    const parallaxActive = (parallax) => parallax && parallax.enabled && parallax.depth > 0;
    const pathActive = (item) => item.pathMotion && item.pathMotion.enabled && item.pathMotion.points.length > 1;
    const publicDragActive = (item) => item.publicDrag && item.publicDrag.enabled && item.locked !== true && item.hidden !== true;
    const dragOffset = (id) => dragOffsets.get(String(id || "")) || { x: 0, y: 0 };

    const getMotionState = (item, index, time) => {
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

    const getRenderState = (item, index, time) => {
      const motion = getMotionState(item, index, time);
      const path = getPathState(item, time);
      const parallax = item.parallax || { enabled: false, depth: 1 };
      const offset = dragOffset(item.id);
      return {
        x: motion.x + path.x + (parallaxActive(parallax) ? -camera.x * parallax.depth : 0) + offset.x,
        y: motion.y + path.y + (parallaxActive(parallax) ? -camera.y * parallax.depth : 0) + offset.y,
        rotation: motion.rotation,
      };
    };

    const applyTransform = (item, index, time) => {
      const box = boxes.get(item.id);
      if (!box) return;
      const state = getRenderState(item, index, time);
      box.style.transform = "translate(" + (item.x + state.x) + "px, " + (item.y + state.y) + "px) rotate(" + (item.rotation + state.rotation) + "deg)";
    };

    const syncMotion = () => {
      const hasMotion = items.some((item) => motionActive(item.motion) || pathActive(item) || parallaxActive(item.parallax) || inertiaItems.size);
      if (!hasMotion) {
        raf = 0;
        return;
      }
      if (raf) return;
      const tick = (time) => {
        raf = 0;
        items.forEach((item, index) => applyTransform(item, index, time));
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

    const waitForImage = (image, item) => new Promise((resolve) => {
      let settled = false;
      let fallbackAttempted = false;
      let timeoutId = 0;

      const cleanup = () => {
        image.removeEventListener("load", handleLoad);
        image.removeEventListener("error", handleError);
        if (timeoutId) window.clearTimeout(timeoutId);
      };

      const finish = async (loaded) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (loaded) {
          if (typeof image.decode === "function") {
            await Promise.race([
              image.decode().catch(() => {}),
              new Promise((done) => window.setTimeout(done, 2500)),
            ]);
          }
          buildMask(item, image);
        } else {
          masks.delete(item.id);
        }
        resolve();
      };

      const handleLoad = () => {
        void finish(true);
      };

      const handleError = () => {
        const fallbackUrl = item.fallbackSrc ? new URL(item.fallbackSrc, window.location.href).href : "";
        if (!fallbackAttempted && fallbackUrl && image.src !== fallbackUrl) {
          fallbackAttempted = true;
          image.src = item.fallbackSrc;
          return;
        }
        void finish(false);
      };

      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);
      timeoutId = window.setTimeout(() => {
        void finish(Boolean(image.complete && image.naturalWidth));
      }, 20_000);
      image.src = item.src;

      if (image.complete) {
        window.queueMicrotask(() => {
          if (image.naturalWidth) handleLoad();
          else handleError();
        });
      }
    });

    const render = () => {
      const generation = ++renderGeneration;
      collageReady = false;
      canvas.dataset.collageReady = "false";
      canvas.setAttribute("aria-busy", "true");
      canvas.innerHTML = "";
      boxes.clear();
      masks.clear();
      const pendingImages = [];

      items.forEach((item, index) => {
        if (item.hidden || !item.src) return;
        const trim = item.trim;
        const scale = item.width / Math.max(trim.naturalWidth, 1);
        const fullHeight = trim.naturalHeight * scale;
        const trimLeft = trim.x * scale;
        const trimTop = trim.y * scale;
        const trimWidth = trim.width * scale;
        const trimHeight = trim.height * scale;
        const box = document.createElement("a");
        box.className = "public-image";
        box.dataset.id = item.id;
        box.dataset.hoverEffect = item.hoverEffect;
        box.dataset.clickEffect = item.clickEffect;
        const href = resolveLink(item.linkUrl);
        const activatable = Boolean(href || item.activationMode);
        box.dataset.hasLink = href ? "true" : "false";
        box.dataset.activatable = activatable ? "true" : "false";
        box.dataset.publicDrag = publicDragActive(item) ? "true" : "false";
        box.style.width = item.width + "px";
        box.style.height = fullHeight + "px";
        box.style.zIndex = String(item.z);
        box.style.setProperty("--image-opacity", String(item.opacity));
        box.style.setProperty("--blend-mode", item.blendMode);
        box.style.setProperty("--image-full-width", item.width + "px");
        box.style.setProperty("--image-full-height", fullHeight + "px");
        box.style.setProperty("--trim-left", trimLeft + "px");
        box.style.setProperty("--trim-top", trimTop + "px");
        box.style.setProperty("--trim-width", trimWidth + "px");
        box.style.setProperty("--trim-height", trimHeight + "px");
        if (activatable) {
          if (href) box.href = href;
          else box.setAttribute("role", "button");
          box.setAttribute("aria-label", localized(item.labels, locale === "en" ? "Open image" : "Apri l’immagine"));
          box.setAttribute("aria-describedby", "collage-help");
          box.tabIndex = 0;
          box.addEventListener("focus", () => {
            hoverId = item.id;
            showTooltip(item);
            box.classList.add("is-shape-hover");
          });
          box.addEventListener("blur", () => {
            if (hoverId === item.id) hoverId = "";
            box.classList.remove("is-shape-hover");
            if (tooltip) {
              tooltip.hidden = true;
              tooltip.setAttribute("aria-hidden", "true");
            }
          });
          box.addEventListener("keydown", (event) => {
            if ((event.key !== " " && event.key !== "Enter") || !collageReady) return;
            event.preventDefault();
            activate(item);
          });
        }
        const surface = document.createElement("div");
        surface.className = "public-image__surface";
        const image = document.createElement("img");
        image.loading = "eager";
        image.decoding = "async";
        image.fetchPriority = "high";
        image.alt = "";
        image.draggable = false;
        pendingImages.push(waitForImage(image, item));
        surface.append(image);
        box.append(surface);
        boxes.set(item.id, box);
        canvas.append(box);
        applyTransform(item, index, window.performance.now());
      });

      Promise.allSettled(pendingImages).then(() => {
        if (generation !== renderGeneration) return;
        window.requestAnimationFrame(() => {
          if (generation !== renderGeneration) return;
          collageReady = true;
          canvas.dataset.collageReady = "true";
          canvas.setAttribute("aria-busy", "false");
          syncMotion();
          document.dispatchEvent(new CustomEvent("claudia:home-collage-ready"));
        });
      });
    };

    const hitForItem = (item, index, pageX, pageY) => {
      if (item.hidden || item.opacity <= 0.01) return null;
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
      if (!collageReady) return null;
      const pageX = event.pageX || event.clientX + window.scrollX;
      const pageY = event.pageY || event.clientY + window.scrollY;
      const ordered = items.map((item, index) => ({ item, index })).sort((a, b) => b.item.z - a.item.z || b.index - a.index);
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
      if (tooltip) {
        tooltip.hidden = true;
        tooltip.setAttribute("aria-hidden", "true");
      }
    };

    const showTooltip = (item) => {
      if (!tooltip) return;
      const box = boxes.get(item.id);
      const surface = box && box.querySelector(".public-image__surface");
      if (!surface) return;
      tooltip.textContent = localized(item.pageNames, locale === "en" ? "Page" : "Pagina");
      tooltip.hidden = false;
      tooltip.setAttribute("aria-hidden", "true");
      const tooltipRect = tooltip.getBoundingClientRect();
      const imageRect = surface.getBoundingClientRect();
      const margin = 12;
      const anchor = item.tooltipAnchor || { x: 0.5, y: 0.86 };
      const anchorX = imageRect.left + imageRect.width * clamp(number(anchor.x, 0.5), 0, 1);
      const anchorY = imageRect.top + imageRect.height * clamp(number(anchor.y, 0.86), 0, 1);
      const left = clamp(anchorX - tooltipRect.width / 2, margin, window.innerWidth - tooltipRect.width - margin);
      const top = clamp(anchorY - tooltipRect.height, margin, window.innerHeight - tooltipRect.height - margin);
      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    };

    const setHover = (hit) => {
      if (!hit) return clearHover();
      if (hoverId && hoverId !== hit.item.id && boxes.get(hoverId)) boxes.get(hoverId).classList.remove("is-shape-hover");
      const box = boxes.get(hit.item.id);
      if (!box) return clearHover();
      hoverId = hit.item.id;
      showTooltip(hit.item);
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
        if (box) box.style.zIndex = String(item.z);
      }
      window.dispatchEvent(new CustomEvent("collage:activate", { detail: { item } }));
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
        if (!moved) {
          markClickSuppressed(id);
          activate(item);
          return;
        }
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
      if (event.pointerType !== "touch") setHover(getHit(event));
      if (items.some((item) => parallaxActive(item.parallax))) syncMotion();
    });

    document.addEventListener("pointerdown", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-collage-lightbox]")) return;
      if (event.button !== 0) return;
      const hit = getHit(event);
      if (!hit) {
        if (event.pointerType === "touch") clearHover();
        return;
      }
      startPublicDrag(event, hit);
    });

    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("[data-collage-lightbox]")) return;
      const hit = getHit(event);
      if (!hit || clickSuppressed(hit.item.id)) return;
      const href = resolveLink(hit.item.linkUrl);
      if (href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) {
        event.preventDefault();
        window.open(href, "_blank", "noopener");
        return;
      }
      event.preventDefault();
      activate(hit.item);
    }, true);

    let resizeRaf = 0;
    window.addEventListener("resize", () => {
      if (resizeRaf) window.cancelAnimationFrame(resizeRaf);
      resizeRaf = window.requestAnimationFrame(() => {
        resizeRaf = 0;
        dragOffsets.clear();
        layoutItems();
        render();
      });
    });

    layoutItems();
    render();
  })();
