import {
  createWritingPost,
  deleteWritingPost,
  loadWritingPosts,
  updateWritingPost,
  uploadEditorImage,
} from "./editor-api.js";

export function initializeWritingDashboard() {
  const pageWorkspace = document.querySelector("[data-page-editor-workspace]");
  const dashboard = document.querySelector("[data-writing-dashboard]");
  const openButton = document.querySelector("[data-writing-dashboard-open]");
  const closeButton = document.querySelector("[data-writing-dashboard-close]");
  const newButton = document.querySelector("[data-writing-new]");
  const form = document.querySelector("[data-writing-form]");
  const empty = document.querySelector("[data-writing-empty]");
  const list = document.querySelector("[data-writing-list]");
  const count = document.querySelector("[data-writing-count]");
  const search = document.querySelector("[data-writing-search]");
  const categoryFilter = document.querySelector("[data-writing-category-filter]");
  const statusFilter = document.querySelector("[data-writing-status-filter]");
  const idInput = document.querySelector("[data-writing-id]");
  const status = document.querySelector("[data-writing-status]");
  const deleteButton = document.querySelector("[data-writing-delete]");
  const draftButton = document.querySelector("[data-writing-save-draft]");
  const imageFile = document.querySelector("[data-writing-image-file]");
  const publicLink = document.querySelector(".link-button");
  const pageSaveButton = document.querySelector("[data-save]");
  const previewTitle = document.querySelector("[data-writing-preview-title]");
  const previewMeta = document.querySelector("[data-writing-preview-meta]");
  const previewExcerpt = document.querySelector("[data-writing-preview-excerpt]");
  const previewBody = document.querySelector("[data-writing-preview-body]");
  const previewImage = document.querySelector("[data-writing-preview-image]");
  const richImageFile = document.querySelector("[data-rich-image-file]");
  const richEditors = Object.fromEntries([...document.querySelectorAll("[data-rich-editor]")].map((editor) => [editor.dataset.richEditor, editor]));
  const fields = Object.fromEntries([...form.querySelectorAll("[data-writing-field]")].map((field) => [field.dataset.writingField, field]));

  let posts = [];
  let selectedId = "";
  let previewLocale = "it";
  let activeRichLocale = "it";
  let loaded = false;

  const allowedRichTags = new Set(["P", "H2", "H3", "H4", "STRONG", "B", "EM", "I", "U", "S", "BLOCKQUOTE", "UL", "OL", "LI", "A", "IMG", "FIGURE", "FIGCAPTION", "BR", "SPAN"]);
  const safeRichUrl = (value, { image = false } = {}) => {
    const url = String(value || "").trim();
    if (!url) return "";
    if (url.startsWith("/")) return url;
    try {
      const parsed = new URL(url, location.origin);
      if (parsed.protocol === "http:" || parsed.protocol === "https:" || (!image && parsed.protocol === "mailto:")) return url;
    } catch {}
    return "";
  };

  const sanitizeEditorHtml = (html) => {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    for (const node of [...template.content.querySelectorAll("*")]) {
      if (!allowedRichTags.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        continue;
      }
      for (const attribute of [...node.attributes]) {
        const name = attribute.name.toLowerCase();
        const allowed = name === "style"
          || (node.tagName === "A" && ["href", "target", "rel", "title"].includes(name))
          || (node.tagName === "IMG" && ["src", "alt", "title", "width", "height"].includes(name));
        if (!allowed) node.removeAttribute(attribute.name);
      }
      if (node.tagName === "A") {
        const href = safeRichUrl(node.getAttribute("href"));
        if (href) {
          node.setAttribute("href", href);
          node.setAttribute("rel", "noopener noreferrer");
        } else node.removeAttribute("href");
      }
      if (node.tagName === "IMG") {
        const src = safeRichUrl(node.getAttribute("src"), { image: true });
        if (src) node.setAttribute("src", src);
        else node.remove();
      }
      if (node.hasAttribute("style")) {
        const permitted = new Set(["font-family", "font-size", "text-align", "color", "background-color"]);
        for (const property of [...node.style]) if (!permitted.has(property)) node.style.removeProperty(property);
        if (!node.getAttribute("style")) node.removeAttribute("style");
      }
    }
    return template.innerHTML.trim();
  };

  const syncRichContent = () => {
    for (const [locale, editor] of Object.entries(richEditors)) {
      const key = locale === "en" ? "contentEn" : "contentIt";
      fields[key].value = sanitizeEditorHtml(editor.innerHTML);
    }
  };

  const setStatus = (message = "", state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const postLabel = (post) => ({ libri: "Libro", racconti: "Racconto", articoli: "Articolo", blog: "Blog" }[post.category] || post.category);

  const readForm = () => {
    syncRichContent();
    return ({
    category: fields.category.value,
    status: fields.status.value,
    year: fields.year.value.trim(),
    titleIt: fields.titleIt.value.trim(),
    titleEn: fields.titleEn.value.trim(),
    metadataIt: fields.metadataIt.value.trim(),
    metadataEn: fields.metadataEn.value.trim(),
    excerptIt: fields.excerptIt.value.trim(),
    excerptEn: fields.excerptEn.value.trim(),
    contentIt: fields.contentIt.value.trim(),
    contentEn: fields.contentEn.value.trim(),
    url: fields.url.value.trim(),
    imageUrl: fields.imageUrl.value.trim(),
    imageAltIt: fields.imageAltIt.value.trim(),
    imageAltEn: fields.imageAltEn.value.trim(),
    featured: fields.featured.checked,
    });
  };

  const updatePreview = () => {
    const post = readForm();
    const suffix = previewLocale === "en" ? "En" : "It";
    previewTitle.textContent = post[`title${suffix}`] || (previewLocale === "en" ? "New publication" : "Nuova pubblicazione");
    previewMeta.textContent = [post.year, post[`metadata${suffix}`]].filter(Boolean).join(" · ");
    previewExcerpt.textContent = post[`excerpt${suffix}`] || "";
    previewBody.innerHTML = sanitizeEditorHtml(post[`content${suffix}`] || "");
    if (post.imageUrl) {
      previewImage.src = post.imageUrl;
      previewImage.alt = post[`imageAlt${suffix}`] || "";
      previewImage.hidden = false;
    } else {
      previewImage.removeAttribute("src");
      previewImage.hidden = true;
    }
  };

  const writeForm = (post) => {
    selectedId = post.id || "";
    idInput.value = selectedId;
    for (const [key, field] of Object.entries(fields)) {
      if (field.type === "checkbox") field.checked = Boolean(post[key]);
      else field.value = post[key] ?? "";
    }
    richEditors.it.innerHTML = sanitizeEditorHtml(post.contentIt || "");
    richEditors.en.innerHTML = sanitizeEditorHtml(post.contentEn || "");
    form.hidden = false;
    empty.hidden = true;
    deleteButton.hidden = !selectedId;
    setStatus(selectedId ? `Modifica: ${post.titleIt}` : "Nuova scheda non ancora salvata.");
    updatePreview();
    renderList();
  };

  const filteredPosts = () => {
    const query = search.value.trim().toLocaleLowerCase("it");
    return posts.filter((post) => {
      if (categoryFilter.value && post.category !== categoryFilter.value) return false;
      if (statusFilter.value && post.status !== statusFilter.value) return false;
      if (!query) return true;
      return [post.titleIt, post.titleEn, post.excerptIt, post.excerptEn, post.metadataIt, post.metadataEn]
        .some((value) => String(value || "").toLocaleLowerCase("it").includes(query));
    });
  };

  const renderList = () => {
    const matching = filteredPosts();
    count.textContent = `${matching.length} di ${posts.length} schede`;
    list.replaceChildren();
    for (const post of matching) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `writing-library__item${post.id === selectedId ? " is-active" : ""}`;
      button.dataset.writingSelect = post.id;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", post.id === selectedId ? "true" : "false");
      const title = document.createElement("strong");
      const meta = document.createElement("span");
      const state = document.createElement("em");
      title.textContent = post.titleIt || post.titleEn || "Bozza senza titolo";
      meta.textContent = `${postLabel(post)}${post.year ? ` · ${post.year}` : ""}`;
      state.dataset.status = post.status;
      state.textContent = post.status === "published" ? "Pubblicato" : "Bozza";
      button.append(title, meta, state);
      list.appendChild(button);
    }
  };

  const refresh = async ({ keepSelection = true } = {}) => {
    posts = await loadWritingPosts();
    if (!keepSelection || !posts.some((post) => post.id === selectedId)) selectedId = "";
    renderList();
    if (selectedId) writeForm(posts.find((post) => post.id === selectedId));
  };

  const open = async () => {
    pageWorkspace.hidden = true;
    dashboard.hidden = false;
    document.body.classList.add("is-writing-dashboard");
    openButton.classList.add("is-active");
    pageSaveButton.hidden = true;
    publicLink.href = "/scritture-esplorazioni/g1-revisione.html?lang=it";
    history.replaceState(null, "", "/__editor/?dashboard=scritture");
    if (loaded) return;
    setStatus("Carico l’archivio…");
    try {
      await refresh({ keepSelection: false });
      loaded = true;
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Dashboard non disponibile", "error");
    }
  };

  const close = () => {
    dashboard.hidden = true;
    pageWorkspace.hidden = false;
    document.body.classList.remove("is-writing-dashboard");
    openButton.classList.remove("is-active");
    pageSaveButton.hidden = false;
    const page = document.querySelector("[data-page-select]").value;
    const path = { contatti: "/contatti/", bio: "/bio/", uccelli: "/uccelli/", miscellanea: "/miscellanea/", cv: "/cv/", collage: "/collage/" }[page] || "/scritture-esplorazioni/g1-revisione.html";
    publicLink.href = `${path}?lang=it`;
    history.replaceState(null, "", `/__editor/?page=${encodeURIComponent(page)}`);
  };

  const newPost = () => writeForm({
    id: "", category: categoryFilter.value || "racconti", status: "draft", year: String(new Date().getFullYear()),
    titleIt: "", titleEn: "", metadataIt: "", metadataEn: "", excerptIt: "", excerptEn: "",
    contentIt: "", contentEn: "",
    url: "", imageUrl: "", imageAltIt: "", imageAltEn: "", featured: false,
  });

  const save = async (nextStatus) => {
    fields.status.value = nextStatus;
    const post = readForm();
    if (nextStatus === "published" && (!post.titleIt || !post.titleEn)) {
      setStatus("Per pubblicare inserisci sia il titolo italiano sia quello inglese.", "error");
      return;
    }
    if (nextStatus === "draft" && !post.titleIt && !post.titleEn) {
      setStatus("Per salvare la bozza inserisci almeno un titolo.", "error");
      return;
    }
    setStatus(nextStatus === "published" ? "Pubblico la scheda…" : "Salvo la bozza…");
    try {
      const saved = selectedId ? await updateWritingPost(selectedId, post) : await createWritingPost(post);
      selectedId = saved.id;
      await refresh();
      setStatus(nextStatus === "published" ? "Pubblicata nel sito." : "Bozza salvata e non visibile al pubblico.", "success");
    } catch (error) {
      setStatus(error.message || "Salvataggio non riuscito", "error");
    }
  };

  openButton.addEventListener("click", () => void open());
  closeButton.addEventListener("click", close);
  newButton.addEventListener("click", newPost);
  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-writing-select]");
    const post = posts.find((item) => item.id === button?.dataset.writingSelect);
    if (post) writeForm(post);
  });
  [search, categoryFilter, statusFilter].forEach((input) => input.addEventListener("input", renderList));
  form.addEventListener("input", updatePreview);
  form.addEventListener("submit", (event) => { event.preventDefault(); void save("published"); });
  draftButton.addEventListener("click", () => void save("draft"));
  deleteButton.addEventListener("click", async () => {
    if (!selectedId || !window.confirm("Eliminare definitivamente questa scheda? Se è pubblicata scomparirà subito dal sito.")) return;
    setStatus("Elimino la scheda…");
    try {
      await deleteWritingPost(selectedId);
      selectedId = "";
      form.hidden = true;
      empty.hidden = false;
      await refresh({ keepSelection: false });
      setStatus("Scheda eliminata.", "success");
    } catch (error) {
      setStatus(error.message || "Eliminazione non riuscita", "error");
    }
  });
  imageFile.addEventListener("change", async () => {
    const file = imageFile.files?.[0];
    if (!file) return;
    setStatus("Carico l’immagine…");
    try {
      fields.imageUrl.value = await uploadEditorImage("scritture-home", file);
      updatePreview();
      setStatus("Immagine caricata. Salva la scheda per confermare.", "success");
    } catch (error) {
      setStatus(error.message || "Caricamento non riuscito", "error");
    } finally {
      imageFile.value = "";
    }
  });
  for (const [locale, editor] of Object.entries(richEditors)) {
    editor.addEventListener("focus", () => { activeRichLocale = locale; });
    editor.addEventListener("input", () => { syncRichContent(); updatePreview(); });
    editor.addEventListener("paste", (event) => {
      event.preventDefault();
      document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") || "");
    });
  }
  document.querySelectorAll("[data-rich-toolbar]").forEach((toolbar) => {
    const locale = toolbar.dataset.richToolbar;
    const editor = richEditors[locale];
    const focusEditor = () => { activeRichLocale = locale; editor.focus(); document.execCommand("styleWithCSS", false, true); };
    toolbar.querySelectorAll("[data-rich-command]").forEach((button) => button.addEventListener("click", () => {
      focusEditor();
      document.execCommand(button.dataset.richCommand, false);
      syncRichContent(); updatePreview();
    }));
    toolbar.querySelector("[data-rich-block]").addEventListener("change", (event) => {
      focusEditor(); document.execCommand("formatBlock", false, event.target.value); syncRichContent(); updatePreview();
    });
    toolbar.querySelector("[data-rich-font]").addEventListener("change", (event) => {
      focusEditor(); document.execCommand("fontName", false, event.target.value); syncRichContent(); updatePreview();
    });
    toolbar.querySelector("[data-rich-size]").addEventListener("change", (event) => {
      focusEditor(); document.execCommand("fontSize", false, event.target.value); syncRichContent(); updatePreview();
    });
    toolbar.querySelector("[data-rich-link]").addEventListener("click", () => {
      focusEditor();
      const url = window.prompt(locale === "en" ? "Link address" : "Indirizzo del link", "https://");
      const safeUrl = safeRichUrl(url);
      if (safeUrl) document.execCommand("createLink", false, safeUrl);
      syncRichContent(); updatePreview();
    });
    toolbar.querySelector("[data-rich-image-upload]").addEventListener("click", () => {
      activeRichLocale = locale;
      richImageFile.click();
    });
  });
  richImageFile.addEventListener("change", async () => {
    const file = richImageFile.files?.[0];
    if (!file) return;
    setStatus("Carico l’immagine nel testo…");
    try {
      const url = await uploadEditorImage("scritture-home", file);
      richEditors[activeRichLocale].focus();
      document.execCommand("insertImage", false, url);
      syncRichContent(); updatePreview();
      setStatus("Immagine inserita nel testo. Salva la scheda per confermare.", "success");
    } catch (error) {
      setStatus(error.message || "Caricamento non riuscito", "error");
    } finally {
      richImageFile.value = "";
    }
  });
  document.querySelectorAll("[data-writing-preview-locale]").forEach((button) => button.addEventListener("click", () => {
    previewLocale = button.dataset.writingPreviewLocale;
    document.querySelectorAll("[data-writing-preview-locale]").forEach((item) => item.classList.toggle("is-active", item === button));
    updatePreview();
  }));

  if (new URLSearchParams(location.search).get("dashboard") === "scritture") void open();
}
