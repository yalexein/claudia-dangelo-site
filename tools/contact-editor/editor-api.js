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
