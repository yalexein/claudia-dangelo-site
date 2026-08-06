(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("embed") === "1") document.body.classList.add("is-embedded");

  const originalPreviews = new Set([
    "collage_mamma gatta rgb.jpg",
    "collage_nerovertigo_RGB.jpg",
    "collage_fairy tale.jpg",
    "collage_monsieur mars_scontornato_piccolo.jpg",
    "collage_obsession (2025).jpg",
    "collage_ricalibrarsi.jpg",
    "collage_wake.jpg",
    "collage_comunicazione_altramarea.jpg",
  ]);

  const pieces = [
    { file: "collage_Buon Natale digitale.jpg", title: "Buon Natale digitale", dx: 1, dy: 6, dw: 14, dr: -7, dz: 18, mx: 2, my: 2, mw: 47, mr: -7 },
    { file: "collage_I am not a poet_RGB.jpg", title: "I am not a poet", dx: 8, dy: 58, dw: 15, dr: 5, dz: 70, mx: 47, my: 8, mw: 45, mr: 5 },
    { file: "collage_ballerina_persocial.jpg", title: "Ballerina", dx: 16, dy: 2, dw: 12, dr: -3, dz: 58, mx: 18, my: 15, mw: 42, mr: -4 },
    { file: "collage_comunicazione_altramarea.jpg", title: "Comunicazione Altramarea", dx: 23, dy: 62, dw: 16, dr: 4, dz: 16, mx: 52, my: 19, mw: 47, mr: 5 },
    { file: "collage_delitto di mafia2.jpg", title: "Delitto di mafia", dx: 28, dy: 13, dw: 13, dr: -5, dz: 70, mx: 0, my: 26, mw: 48, mr: -6 },
    { file: "collage_earthly dysphoria (2025).jpg", title: "Earthly dysphoria", dx: 37, dy: 69, dw: 12, dr: 5, dz: 72, mx: 0, my: 43, mw: 38, mr: 5 },
    { file: "collage_fairy tale.jpg", title: "Fairy tale", dx: 43, dy: 5, dw: 13, dr: -4, dz: 16, mx: 11, my: 38, mw: 49, mr: -4 },
    { file: "collage_hangin out with my demon.jpg", title: "Hangin out with my demon", dx: 50, dy: 59, dw: 16, dr: 182, dz: 44, mx: 53, my: 43, mw: 44, mr: 182, fullRotation: 180 },
    { file: "collage_high-fluids (2025).jpg", title: "High fluids", dx: 56, dy: 10, dw: 17, dr: -5, dz: 62, mx: 0, my: 51, mw: 58, mr: -6 },
    { file: "collage_il cammino.jpg", title: "Il cammino", dx: 65, dy: 58, dw: 13, dr: 183, dz: 18, mx: 54, my: 56, mw: 43, mr: 183, fullRotation: 180 },
    { file: "collage_l'origine dell'umanità.jpg", title: "L'origine dell'umanità", dx: 71, dy: 3, dw: 12, dr: -3, dz: 39, mx: 12, my: 63, mw: 44, mr: -3 },
    { file: "collage_la calosca_RGB.jpg", title: "La calosca", dx: 72, dy: 56, dw: 14, dr: 5, dz: 72, mx: 51, my: 67, mw: 46, mr: 5 },
    { file: "collage_mamma gatta rgb.jpg", title: "Mamma gatta", dx: 86, dy: 9, dw: 15, dr: -4, dz: 17, mx: 0, my: 74, mw: 56, mr: -4 },
    { file: "collage_monsieur mars_scontornato_piccolo.jpg", title: "Monsieur Mars", dx: 92, dy: 58, dw: 12, dr: 2, dz: 46, mx: 56, my: 79, mw: 41, mr: 3 },
    { file: "collage_nerovertigo_RGB.jpg", title: "Nerovertigo", dx: -2, dy: 33, dw: 16, dr: -3, dz: 50, mx: 9, my: 86, mw: 51, mr: -3 },
    { file: "collage_obsession (2025).jpg", title: "Obsession", dx: 12, dy: 30, dw: 14, dr: 5, dz: 20, mx: 51, my: 91, mw: 45, mr: 5 },
    { file: "collage_penetrano per le fessure come i raggi della luna.jpg", title: "Penetrano per le fessure", dx: 18, dy: 31, dw: 16, dr: -6, dz: 64, mx: 0, my: 11, mw: 55, mr: -5 },
    { file: "collage_rendono le donne rabbiose.jpg", title: "Rendono le donne rabbiose", dx: 34, dy: 27, dw: 17, dr: 4, dz: 19, mx: 47, my: 24, mw: 51, mr: 4 },
    { file: "collage_ricalibrarsi.jpg", title: "Ricalibrarsi", dx: 52, dy: 20, dw: 10, dr: -4, dz: 70, mx: 3, my: 40, mw: 44, mr: -4 },
    { file: "collage_sogni d'oro.jpg", title: "Sogni d'oro", dx: 59, dy: 34, dw: 12, dr: 4, dz: 20, mx: 50, my: 53, mw: 43, mr: 4 },
    { file: "collage_speak memory (2022).jpg", title: "Speak memory", dx: 69, dy: 28, dw: 17, dr: -5, dz: 61, mx: 0, my: 69, mw: 55, mr: -5 },
    { file: "collage_un tuffo.jpg", title: "Un tuffo", dx: 82, dy: 31, dw: 16, dr: 3, dz: 37, mx: 45, my: 82, mw: 54, mr: 3 },
    { file: "collage_wake.jpg", title: "Wake", dx: 93, dy: 26, dw: 11, dr: -3, dz: 70, mx: 1, my: 93, mw: 44, mr: -3 },
    { file: "collage_watching my thoughts (2023).jpg", title: "Watching my thoughts", dx: 48, dy: 1, dw: 11, dr: 6, dz: 37, mx: 56, my: 34, mw: 41, mr: 6 },
  ];

  const effects = ["lift", "glow", "tilt", "zoom"];
  const imageRoot = "/images/collage/";
  const cutoutRoot = "/images/collage-cutout/";
  const stage = document.querySelector("[data-composition-images]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");
  let previousFocus = null;

  const encodeAsset = (value) => encodeURI(value);
  const previewFor = (file) => originalPreviews.has(file)
    ? `${imageRoot}${file}?v=collage-of-collages-1`
    : `${cutoutRoot}${file.replace(/\.[^.]+$/, ".png")}`;
  const fullFor = (file) => `${imageRoot}${file}?v=collage-of-collages-1`;

  const openLightbox = (piece, sourceButton) => {
    if (!lightbox || !lightboxImage) return;
    previousFocus = sourceButton;
    lightboxImage.src = encodeAsset(fullFor(piece.file));
    lightboxImage.alt = piece.title;
    lightboxImage.style.setProperty("--full-rotation", `${piece.fullRotation || 0}deg`);
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => lightbox.classList.add("is-open"));
    lightboxClose?.focus({ preventScroll: true });
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    lightboxImage.removeAttribute("style");
    document.body.style.overflow = "";
    previousFocus?.focus?.({ preventScroll: true });
    previousFocus = null;
  };

  pieces.forEach((piece, index) => {
    if (!stage) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "composition-piece";
    button.dataset.effect = effects[index % effects.length];
    button.dataset.contactEdit = `collage-piece-${index + 1}`;
    button.setAttribute("aria-label", `Apri l'opera ${piece.title}`);
    button.style.setProperty("--x", `${piece.dx}%`);
    button.style.setProperty("--y", `${piece.dy}%`);
    button.style.setProperty("--w", `${piece.dw}%`);
    button.style.setProperty("--r", `${piece.dr}deg`);
    button.style.setProperty("--z", String(piece.dz));
    button.style.setProperty("--mx", `${piece.mx}%`);
    button.style.setProperty("--my", `${piece.my}%`);
    button.style.setProperty("--mw", `${piece.mw}%`);
    button.style.setProperty("--float-x", `${(index % 3) - 1.1}px`);
    button.style.setProperty("--float-y", `${3 + (index % 5) * 1.05}px`);
    button.style.setProperty("--duration", `${5.8 + (index % 7) * 0.52}s`);
    button.style.setProperty("--delay", `${-0.31 * (index % 9)}s`);

    const surface = document.createElement("span");
    surface.className = "composition-piece__surface";
    const image = document.createElement("img");
    image.src = encodeAsset(previewFor(piece.file));
    image.dataset.contactEdit = `collage-image-${index + 1}`;
    image.dataset.defaultPreview = image.src;
    image.alt = piece.title;
    image.loading = index < 12 ? "eager" : "lazy";
    image.decoding = "async";
    image.draggable = false;
    surface.append(image);
    button.append(surface);

    button.addEventListener("click", () => {
      button.classList.remove("is-clicking");
      void button.offsetWidth;
      button.classList.add("is-clicking");
      const preload = new Image();
      preload.src = encodeAsset(fullFor(piece.file));
      window.setTimeout(() => {
        button.classList.remove("is-clicking");
        openLightbox(piece, button);
      }, 300);
    });

    stage.append(button);
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
})();
