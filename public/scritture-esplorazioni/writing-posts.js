(() => {
  const categories = ["libri", "racconti", "articoli", "blog"];
  const labels = {
    it: {
      libri: "Libri", racconti: "Racconti", articoli: "Articoli", blog: "Blog",
      archive: "Archivio", writingHome: "prima pagina di Scritture", backTop: "torna su ↑",
      footer: "© Claudia · archivio di scritture", latestBook: "Ultimo libro",
      latestArticle: "Ultimo articolo", allBooks: "Tutti i libri", allStories: "Tutti i racconti",
      allArticles: "Tutti gli articoli", latestNotes: "Ultime note", empty: "Nessuna pubblicazione in questa sezione.",
    },
    en: {
      libri: "Books", racconti: "Stories", articoli: "Articles", blog: "Blog",
      archive: "Archive", writingHome: "Writing front page", backTop: "back to top ↑",
      footer: "© Claudia · writing archive", latestBook: "Latest book",
      latestArticle: "Latest article", allBooks: "All books", allStories: "All stories",
      allArticles: "All articles", latestNotes: "Latest notes", empty: "No publications in this section yet.",
    },
  };

  const locale = () => (document.documentElement.dataset.locale === "en" ? "en" : "it");
  const text = (post, field) => post[`${field}${locale() === "en" ? "En" : "It"}`] || post[`${field}It`] || "";
  const internalPostUrl = (post) => `/scritture-esplorazioni/post.html?id=${encodeURIComponent(post.id)}&lang=${locale()}`;
  const element = (tag, className, content = "") => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  };

  const linkTitle = (post, className = "") => {
    const title = element("h2", className);
    const link = element("a", "", text(post, "title"));
    link.href = internalPostUrl(post);
    title.appendChild(link);
    return title;
  };

  const image = (post) => {
    if (!post.imageUrl) return null;
    const figure = element("figure", "writing-post-image");
    const img = document.createElement("img");
    img.src = post.imageUrl;
    img.alt = text(post, "imageAlt");
    img.loading = "lazy";
    img.decoding = "async";
    figure.appendChild(img);
    return figure;
  };

  const renderArchiveCard = (post) => {
    const article = element("article", `card writing-post-card writing-post-card--${post.category}`);
    article.dataset.writingPostId = post.id;
    if (post.year) article.appendChild(element("p", "year", post.year));
    article.appendChild(linkTitle(post));
    if (text(post, "metadata")) article.appendChild(element("p", "place", text(post, "metadata")));
    const visual = image(post);
    if (visual) article.appendChild(visual);
    if (text(post, "excerpt")) article.appendChild(element("p", "writing-post-excerpt", text(post, "excerpt")));
    return article;
  };

  const renderFeature = (container, post, category) => {
    if (!container || !post) return;
    const copy = container.querySelector(".feature-copy");
    if (!copy) return;
    const copyLabels = labels[locale()];
    const sectionLabel = copy.querySelector(".section-label");
    if (sectionLabel) sectionLabel.textContent = category === "libri" ? copyLabels.latestBook : copyLabels.latestArticle;
    const heading = copy.querySelector("h2");
    if (heading) heading.replaceWith(linkTitle(post));
    const metadata = copy.querySelector(".metadata");
    if (metadata) metadata.textContent = [post.year, text(post, "metadata")].filter(Boolean).join(" · ");
    const excerpt = copy.querySelector(".excerpt");
    if (excerpt) excerpt.textContent = text(post, "excerpt");
    const sectionLink = copy.querySelector(".section-link");
    if (sectionLink) sectionLink.firstChild.textContent = `${category === "libri" ? copyLabels.allBooks : copyLabels.allArticles} `;
    const figure = container.querySelector(".feature-image");
    if (figure && post.imageUrl) {
      const img = figure.querySelector("img");
      img.src = post.imageUrl;
      img.alt = text(post, "imageAlt");
    }
  };

  const renderStories = (container, posts) => {
    if (!container || !posts.length) return;
    container.replaceChildren();
    posts.slice(0, 2).forEach((post, index) => {
      const article = element("article", index === 0 ? "story-card story-card--compact" : "story-card story-card--with-image");
      const copy = element("div", index === 0 ? "" : "story-copy");
      copy.append(element("p", "section-label", labels[locale()].racconti), linkTitle(post));
      copy.appendChild(element("p", "metadata", [post.year, text(post, "metadata")].filter(Boolean).join(" · ")));
      copy.appendChild(element("p", "excerpt", text(post, "excerpt")));
      const allLink = element("a", "section-link", `${labels[locale()].allStories} `);
      allLink.href = "racconti.html";
      allLink.appendChild(element("span", "", "→"));
      copy.appendChild(allLink);
      article.appendChild(copy);
      const visual = image(post);
      if (visual) {
        visual.className = "story-image";
        article.appendChild(visual);
      }
      container.appendChild(article);
    });
  };

  const renderBlog = (container, posts) => {
    if (!container) return;
    container.replaceChildren();
    posts.slice(0, 3).forEach((post, index) => {
      const card = document.createElement("a");
      card.className = `blog-item${index === 0 ? " blog-item--wide" : ""}`;
      card.href = internalPostUrl(post);
      card.append(element("span", "", post.year || labels[locale()].blog));
      const heading = element("h3", "", text(post, "title"));
      card.appendChild(heading);
      card.appendChild(element("b", "", "→"));
      container.appendChild(card);
    });
  };

  const localizeNavigation = (category = "") => {
    const copy = labels[locale()];
    document.querySelectorAll(".categories a, .archive-nav a").forEach((link, index) => {
      link.textContent = copy[categories[index]] || link.textContent;
    });
    const utility = document.querySelector(".utility-links a");
    if (utility) utility.textContent = `← ${copy.writingHome}`;
    const archiveLabel = document.querySelector(".archive-header p");
    if (archiveLabel) archiveLabel.textContent = `${String(categories.indexOf(category) + 1).padStart(2, "0")} · ${copy.archive}`;
    const archiveTitle = document.querySelector(".archive-header h1");
    if (archiveTitle && category) archiveTitle.textContent = copy[category];
    const footer = document.querySelector("footer");
    if (footer) {
      const copyright = footer.querySelector("span");
      const top = footer.querySelector("a[href='#top']");
      if (copyright) copyright.textContent = copy.footer;
      if (top) top.textContent = copy.backTop;
    }
    const blogHeading = document.querySelector(".blog-heading h2");
    if (blogHeading) blogHeading.textContent = copy.latestNotes;
    if (category) document.title = `${copy[category]} — ${locale() === "en" ? "The vice of writing" : "Il vizio della scrittura"}`;
    else if (document.querySelector(".newspaper")) document.title = `${locale() === "en" ? "The vice of writing" : "Il vizio della scrittura"} — Claudia D'Angelo`;
  };

  const loadPosts = async () => {
    try {
      const response = await fetch("/api/writing-posts", { cache: "no-store", headers: { Accept: "application/json" } });
      if (response.ok) return (await response.json()).posts || [];
    } catch {}
    const fallback = await fetch("/writing-posts.json", { cache: "no-store" });
    return fallback.ok ? (await fallback.json()).posts || [] : [];
  };

  const renderDetail = (posts) => {
    const container = document.querySelector("[data-writing-detail]");
    if (!container) return false;
    const post = posts.find((item) => item.id === new URLSearchParams(location.search).get("id"));
    if (!post) {
      container.appendChild(element("p", "writing-detail__missing", locale() === "en" ? "Publication not found." : "Pubblicazione non trovata."));
      return true;
    }
    document.title = `${text(post, "title")} — Claudia D'Angelo`;
    const category = element("p", "writing-detail__category", labels[locale()][post.category] || post.category);
    const title = element("h1", "", text(post, "title"));
    const metadata = element("p", "writing-detail__metadata", [post.year, text(post, "metadata")].filter(Boolean).join(" · "));
    const visual = image(post);
    const body = element("div", "writing-detail__body");
    const richContent = text(post, "content");
    if (richContent) body.innerHTML = richContent;
    else body.appendChild(element("p", "", text(post, "excerpt")));
    container.append(category, title, metadata);
    if (visual) container.appendChild(visual);
    container.appendChild(body);
    if (post.url) {
      const original = element("a", "writing-detail__original", locale() === "en" ? "Open the original publication ↗" : "Apri la pubblicazione originale ↗");
      original.href = post.url;
      original.target = "_blank";
      original.rel = "noreferrer";
      container.appendChild(original);
    }
    return true;
  };

  const start = async () => {
    const posts = (await loadPosts()).filter((post) => post.status === "published");
    if (renderDetail(posts)) return;
    const page = window.ClaudiaCustomizationPage || "";
    const category = page.replace("scritture-", "");
    localizeNavigation(categories.includes(category) ? category : "");

    if (page === "scritture-home") {
      const byCategory = Object.fromEntries(categories.map((name) => [name, posts.filter((post) => post.category === name)]));
      renderFeature(document.querySelector(".feature--book"), byCategory.libri[0], "libri");
      renderStories(document.querySelector(".stories-row"), byCategory.racconti);
      renderFeature(document.querySelector(".feature--article"), byCategory.articoli[0], "articoli");
      renderBlog(document.querySelector(".blog-grid"), byCategory.blog);
      return;
    }

    const list = document.querySelector("[data-writing-list]");
    if (!list || !categories.includes(category)) return;
    list.replaceChildren();
    const matching = posts.filter((post) => post.category === category);
    if (!matching.length) list.appendChild(element("p", "empty", labels[locale()].empty));
    else matching.forEach((post) => list.appendChild(renderArchiveCard(post)));
    document.querySelector(".empty")?.remove();
  };

  window.addEventListener("DOMContentLoaded", () => void start(), { once: true });
})();
