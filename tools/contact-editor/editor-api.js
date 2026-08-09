async function readError(response, fallback) {
  try {
    const payload = await response.json();
    return payload.error || fallback;
  } catch {
    return fallback;
  }
}

export async function loadPageConfiguration(pageName) {
  const response = await fetch(`/api/site-editor?page=${encodeURIComponent(pageName)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Editor non disponibile"));
  return response.json();
}

export async function savePageConfiguration(pageName, configuration) {
  const response = await fetch(`/api/site-editor?page=${encodeURIComponent(pageName)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(configuration),
  });
  if (!response.ok) throw new Error(await readError(response, "Salvataggio non riuscito"));
  return response.json();
}

export async function uploadEditorImage(pageName, file) {
  const response = await fetch(`/api/editor-assets?page=${encodeURIComponent(pageName)}`, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error(await readError(response, "Caricamento non riuscito"));
  const payload = await response.json();
  if (!payload.url) throw new Error("Il server non ha restituito l’indirizzo dell’immagine");
  return payload.url;
}

export async function loadGuestbookEntries() {
  const response = await fetch("/api/editor-guestbook", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Guestbook non disponibile"));
  const payload = await response.json();
  return Array.isArray(payload.entries) ? payload.entries : [];
}

export async function deleteGuestbookEntry(id) {
  const response = await fetch(`/api/editor-guestbook?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Eliminazione non riuscita"));
  const payload = await response.json();
  return Array.isArray(payload.entries) ? payload.entries : [];
}

export async function loadWritingPosts() {
  const response = await fetch("/api/editor-writing-posts", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Archivio editoriale non disponibile"));
  const payload = await response.json();
  return Array.isArray(payload.posts) ? payload.posts : [];
}

export async function createWritingPost(post) {
  const response = await fetch("/api/editor-writing-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(post),
  });
  if (!response.ok) throw new Error(await readError(response, "Creazione non riuscita"));
  return (await response.json()).post;
}

export async function updateWritingPost(id, post) {
  const response = await fetch(`/api/editor-writing-posts?id=${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(post),
  });
  if (!response.ok) throw new Error(await readError(response, "Salvataggio non riuscito"));
  return (await response.json()).post;
}

export async function deleteWritingPost(id) {
  const response = await fetch(`/api/editor-writing-posts?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Eliminazione non riuscita"));
  return (await response.json()).id;
}

export async function loadSiteSettings() {
  const response = await fetch("/api/site-settings", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(await readError(response, "Impostazioni del sito non disponibili"));
  return response.json();
}

export async function saveSiteSettings(settings) {
  const response = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(await readError(response, "Salvataggio delle impostazioni non riuscito"));
  return response.json();
}
