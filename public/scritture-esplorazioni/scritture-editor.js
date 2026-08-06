(() => {
  "use strict";

  const page = String(window.ClaudiaCustomizationPage || "scritture");
  const botanical = "https://upload.wikimedia.org/wikipedia/commons/9/98/Blossfeldt_-_Carduus_spec.%2C_16108.jpg";
  const slug = (value) => String(value || "elemento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "elemento";
  const mark = (element, key) => {
    if (element && !element.hasAttribute("data-contact-edit")) element.setAttribute("data-contact-edit", `${page}-${key}`);
    return element;
  };
  const markChildren = (root, prefix) => {
    if (!root) return;
    root.querySelectorAll("h1,h2,h3,p,blockquote,figcaption,a,span").forEach((element, index) => {
      const text = element.textContent?.trim().replace(/\s+/g, " ") || `${element.localName}-${index + 1}`;
      mark(element, `${prefix}-${slug(text)}-${index + 1}`);
    });
  };
  const addOptionalImage = (container, key) => {
    if (!container || container.querySelector(":scope > .optional-card-image")) return;
    const image = document.createElement("img");
    image.className = "optional-card-image";
    image.src = botanical;
    image.alt = "";
    image.loading = "lazy";
    image.setAttribute("data-contact-edit", `${page}-${key}-immagine-opzionale`);
    container.prepend(image);
  };

  const main = document.querySelector("main");
  mark(main, "pagina");
  mark(document.querySelector(".preview-bar"), "barra-anteprima");

  if (page === "scritture-home") {
    mark(document.querySelector(".home-link"), "torna-home");
    mark(document.querySelector(".masthead"), "testata");
    mark(document.querySelector(".masthead h1"), "titolo");
    mark(document.querySelector(".masthead > p"), "sottotitolo");
    document.querySelectorAll(".edition-line span").forEach((element, index) => mark(element, `edizione-${index + 1}`));
    mark(document.querySelector(".categories"), "categorie-riga");
    document.querySelectorAll(".categories a").forEach((element) => mark(element, `categoria-${slug(element.textContent)}`));

    const groups = [
      [".feature--book", "riga-libro"],
      [".stories-row", "riga-racconti"],
      [".feature--article", "riga-articolo"],
      [".blog-row", "riga-blog"],
    ];
    groups.forEach(([selector, key]) => {
      const section = mark(document.querySelector(selector), key);
      markChildren(section, key);
    });
    document.querySelectorAll("figure").forEach((figure, index) => {
      mark(figure, `figura-${index + 1}`);
      mark(figure.querySelector("img"), `immagine-${index + 1}`);
    });
    document.querySelectorAll(".feature-copy,.story-card,.story-copy,.blog-grid,.blog-item").forEach((element, index) => {
      mark(element, `colonna-${index + 1}-${slug(element.querySelector("h2,h3")?.textContent)}`);
    });
    const compactStory = document.querySelector(".story-card--compact");
    addOptionalImage(compactStory, "racconto-compatto");
    document.querySelectorAll(".blog-item").forEach((item, index) => addOptionalImage(item, `blog-${index + 1}`));
  } else {
    mark(document.querySelector(".utility-links"), "utilita");
    document.querySelectorAll(".utility-links a").forEach((element, index) => mark(element, `utilita-link-${index + 1}`));
    mark(document.querySelector(".archive-header"), "testata");
    mark(document.querySelector(".archive-header p"), "occhiello");
    mark(document.querySelector(".archive-header h1"), "titolo");
    mark(document.querySelector(".archive-nav"), "categorie-riga");
    document.querySelectorAll(".archive-nav a").forEach((element) => mark(element, `categoria-${slug(element.textContent)}`));
    const grid = mark(document.querySelector(".grid"), "griglia");
    grid?.querySelectorAll(":scope > .card").forEach((card, index) => {
      const title = card.querySelector("h2")?.textContent || `scheda-${index + 1}`;
      const key = `scheda-${slug(title)}`;
      mark(card, key);
      markChildren(card, key);
      addOptionalImage(card, key);
    });
  }

  mark(document.querySelector("footer"), "footer");
})();
