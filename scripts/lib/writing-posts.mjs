import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sanitizeHtml from "sanitize-html";

export const writingCategories = new Set(["libri", "racconti", "articoli", "blog"]);
export const writingStatuses = new Set(["draft", "published"]);

function cleanText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function cleanUrl(value) {
  const candidate = cleanText(value, 1200);
  if (!candidate) return "";
  if (candidate.startsWith("/")) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function cleanDate(value, fallback = "") {
  const candidate = cleanText(value, 40);
  if (!candidate) return fallback;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function textAsHtml(value) {
  const escaped = String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
  return escaped ? `<p>${escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : "";
}

export function cleanRichText(value, fallbackText = "") {
  const source = String(value || "").trim() || textAsHtml(fallbackText);
  return sanitizeHtml(source.slice(0, 120_000), {
    allowedTags: ["p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption", "br", "span"],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    allowedStyles: {
      "*": {
        "font-family": [/^[\w\s,'"-]{1,120}$/],
        "font-size": [/^(?:[1-9]|[1-9]\d|100)(?:px|pt|%|rem|em)$/, /^(?:xx-small|x-small|small|medium|large|x-large|xx-large)$/],
        "text-align": [/^(?:left|right|center|justify)$/],
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,.%]+\)$/i],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,.%]+\)$/i],
      },
    },
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, rel: "noopener noreferrer" },
      }),
    },
  }).trim();
}

export function cleanWritingPost(input, previous = null) {
  const now = new Date().toISOString();
  const preservingStoredPost = previous && input === previous;
  const category = writingCategories.has(input?.category) ? input.category : previous?.category || "racconti";
  const status = writingStatuses.has(input?.status) ? input.status : previous?.status || "draft";
  const titleIt = cleanText(input?.titleIt, 220);
  const titleEn = cleanText(input?.titleEn, 220);
  if (status === "published" && (!titleIt || !titleEn)) throw new Error("Per pubblicare servono il titolo italiano e quello inglese");
  if (status === "draft" && !titleIt && !titleEn) throw new Error("Inserisci almeno un titolo per salvare la bozza");

  const excerptIt = cleanText(input?.excerptIt, 6000);
  const excerptEn = cleanText(input?.excerptEn, 6000);

  const publishedAt = status === "published"
    ? cleanDate(input?.publishedAt, previous?.publishedAt || now)
    : "";

  return {
    id: previous?.id || cleanText(input?.id, 100) || randomUUID(),
    category,
    status,
    titleIt,
    titleEn,
    excerptIt,
    excerptEn,
    contentIt: cleanRichText(input?.contentIt, excerptIt),
    contentEn: cleanRichText(input?.contentEn, excerptEn),
    metadataIt: cleanText(input?.metadataIt, 700),
    metadataEn: cleanText(input?.metadataEn, 700),
    year: cleanText(input?.year, 30),
    url: cleanUrl(input?.url),
    imageUrl: cleanUrl(input?.imageUrl),
    imageAltIt: cleanText(input?.imageAltIt, 500),
    imageAltEn: cleanText(input?.imageAltEn, 500),
    featured: Boolean(input?.featured),
    createdAt: previous?.createdAt || cleanDate(input?.createdAt, now),
    updatedAt: preservingStoredPost ? cleanDate(input?.updatedAt, input?.createdAt || now) : now,
    publishedAt,
  };
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const dateA = a.publishedAt || a.updatedAt || a.createdAt || "";
    const dateB = b.publishedAt || b.updatedAt || b.createdAt || "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return String(b.year || "").localeCompare(String(a.year || ""), "it", { numeric: true });
  });
}

async function readJsonFile(filePath) {
  const parsed = JSON.parse(await readFile(filePath, "utf8"));
  return Array.isArray(parsed?.posts) ? parsed.posts : [];
}

export function createWritingPostsStorage({ dataDir, defaultPath }) {
  const runtimePath = path.join(dataDir, "writing-posts.json");
  const tempPath = `${runtimePath}.tmp`;
  let writeQueue = Promise.resolve();

  const readPosts = async () => {
    let rawPosts;
    try {
      rawPosts = await readJsonFile(runtimePath);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      rawPosts = await readJsonFile(defaultPath);
    }
    const cleaned = [];
    for (const post of rawPosts) {
      try {
        cleaned.push(cleanWritingPost(post, post));
      } catch {}
    }
    return sortPosts(cleaned);
  };

  const writePosts = async (posts) => {
    await mkdir(dataDir, { recursive: true });
    await writeFile(tempPath, `${JSON.stringify({ version: 1, posts: sortPosts(posts) }, null, 2)}\n`, "utf8");
    await rename(tempPath, runtimePath);
  };

  const mutate = async (operation) => {
    let result;
    writeQueue = writeQueue.then(async () => {
      const posts = await readPosts();
      const next = await operation(posts);
      await writePosts(next.posts);
      result = next.result;
    });
    await writeQueue;
    return result;
  };

  return {
    async list({ publishedOnly = false } = {}) {
      const posts = await readPosts();
      return publishedOnly ? posts.filter((post) => post.status === "published") : posts;
    },
    async create(input) {
      return mutate(async (posts) => {
        const post = cleanWritingPost(input);
        return { posts: [post, ...posts], result: post };
      });
    },
    async update(id, input) {
      return mutate(async (posts) => {
        const index = posts.findIndex((post) => post.id === id);
        if (index < 0) throw Object.assign(new Error("Pubblicazione non trovata"), { statusCode: 404 });
        const post = cleanWritingPost(input, posts[index]);
        const nextPosts = [...posts];
        nextPosts[index] = post;
        return { posts: nextPosts, result: post };
      });
    },
    async remove(id) {
      return mutate(async (posts) => {
        const nextPosts = posts.filter((post) => post.id !== id);
        if (nextPosts.length === posts.length) throw Object.assign(new Error("Pubblicazione non trovata"), { statusCode: 404 });
        return { posts: nextPosts, result: { id } };
      });
    },
  };
}
