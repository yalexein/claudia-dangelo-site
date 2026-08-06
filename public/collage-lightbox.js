(() => {
  const lightbox = document.querySelector("[data-collage-lightbox]");
  const lightboxImage = document.querySelector("[data-collage-lightbox-image]");
  const closeButton = document.querySelector("[data-collage-lightbox-close]");
  const stage = document.querySelector(".public-stage");
  const canvas = document.querySelector("[data-public-canvas]");

  if (!lightbox || !lightboxImage || !closeButton || !canvas) return;

  const clickEffectDelays = {
    pulse: 360,
    pop: 420,
    flash: 520,
    spin: 520,
  };

  let lastFocused = null;
  let activeSource = "";
  let pendingOpenTimer = 0;

  const fitOpenImage = () => {
    if (lightbox.hidden || !lightboxImage.naturalWidth || !lightboxImage.naturalHeight) return;
    const compact = window.matchMedia("(max-width: 640px)").matches;
    const edge = compact ? 36 : 48;
    const availableWidth = Math.max(1, Math.min(window.innerWidth - edge, 1400));
    const availableHeight = Math.max(1, Math.min(window.innerHeight - edge, 1000));
    const scale = Math.min(
      availableWidth / lightboxImage.naturalWidth,
      availableHeight / lightboxImage.naturalHeight,
    );
    lightboxImage.style.width = `${Math.round(lightboxImage.naturalWidth * scale)}px`;
    lightboxImage.style.height = `${Math.round(lightboxImage.naturalHeight * scale)}px`;
  };

  const closeLightbox = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if (lightbox.hidden) return;

    lightbox.classList.remove("is-open");
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    stage?.removeAttribute("inert");
    activeSource = "";
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("style");

    const focusTarget = lastFocused;
    lastFocused = null;
    focusTarget?.focus?.({ preventScroll: true });
  };

  const openLightbox = (item, sourceElement) => {
    const source = item?.fullSrc || item?.src;
    if (!source) return;
    if (!lightbox.hidden && activeSource === source) return;

    lastFocused = sourceElement || document.activeElement;
    activeSource = source;
    lightboxImage.alt = document.documentElement.dataset.locale === "en"
      ? "Full collage image"
      : "Immagine completa del collage";
    lightboxImage.style.setProperty("--lightbox-rotation", `${Number(item.fullRotation) || 0}deg`);
    lightboxImage.src = source;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    stage?.setAttribute("inert", "");
    fitOpenImage();
    window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
    closeButton.focus({ preventScroll: true });
  };

  const sourceElementFor = (item) => {
    const itemId = String(item?.id || "");
    return Array.from(canvas.querySelectorAll(".public-image"))
      .find((box) => box instanceof HTMLElement && box.dataset.id === itemId)
      || document.activeElement;
  };

  const scheduleOpen = (item) => {
    if (!item?.src || item?.linkUrl) return;
    if (pendingOpenTimer) window.clearTimeout(pendingOpenTimer);

    const source = item.fullSrc || item.src;
    if (source) {
      const preloader = new Image();
      preloader.src = source;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reducedMotion ? 0 : (clickEffectDelays[item.clickEffect] || 0);
    const sourceElement = sourceElementFor(item);

    if (!delay) {
      openLightbox(item, sourceElement);
      return;
    }

    pendingOpenTimer = window.setTimeout(() => {
      pendingOpenTimer = 0;
      openLightbox(item, sourceElement);
    }, delay);
  };

  const wireImage = (box) => {
    if (!(box instanceof HTMLElement) || box.dataset.lightboxBound === "true") return;
    box.dataset.lightboxBound = "true";
    box.style.pointerEvents = "auto";
    box.style.cursor = "zoom-in";
    box.style.touchAction = "manipulation";
    box.setAttribute("aria-label", document.documentElement.dataset.locale === "en"
      ? "Open full collage image"
      : "Apri l’immagine completa del collage");
  };

  const wireImages = () => {
    canvas.querySelectorAll(".public-image").forEach(wireImage);
  };

  window.addEventListener("collage:activate", (event) => {
    scheduleOpen(event.detail?.item);
  });

  document.addEventListener("claudia:home-collage-ready", wireImages);
  if (canvas.dataset.collageReady === "true") wireImages();

  lightboxImage.addEventListener("load", fitOpenImage);
  window.addEventListener("resize", fitOpenImage);

  closeButton.addEventListener("pointerdown", closeLightbox);
  closeButton.addEventListener("click", closeLightbox);

  lightbox.addEventListener("pointerdown", (event) => {
    if (event.target === lightbox) closeLightbox(event);
  });
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox(event);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox(event);
  });
})();
