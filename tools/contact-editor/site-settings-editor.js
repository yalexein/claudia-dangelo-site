import { loadSiteSettings, saveSiteSettings } from "./editor-api.js";

export function initializeSiteSettingsEditor() {
  const dialog = document.querySelector("[data-site-settings-dialog]");
  const openButton = document.querySelector("[data-site-settings-open]");
  const form = document.querySelector("[data-site-settings-form]");
  const fontFamily = document.querySelector("[data-site-font-family]");
  const fontUrl = document.querySelector("[data-site-font-url]");
  const preview = document.querySelector("[data-site-font-preview]");
  const status = document.querySelector("[data-site-settings-status]");

  const setStatus = (message = "", state = "") => {
    status.textContent = message;
    status.dataset.state = state;
  };

  const updatePreview = () => {
    preview.style.fontFamily = fontFamily.value || "Optima, Candara, sans-serif";
  };

  const open = async () => {
    setStatus("Carico le impostazioni…");
    dialog.showModal();
    try {
      const settings = await loadSiteSettings();
      fontFamily.value = settings.fontFamily || "Optima, Candara, 'Noto Sans', sans-serif";
      fontUrl.value = settings.fontUrl || "";
      updatePreview();
      setStatus("");
    } catch (error) {
      setStatus(error.message || "Impostazioni non disponibili", "error");
    }
  };

  openButton.addEventListener("click", () => void open());
  dialog.querySelectorAll("[data-site-settings-close]").forEach((button) => button.addEventListener("click", () => dialog.close()));
  fontFamily.addEventListener("input", updatePreview);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("Salvo il font per tutte le pagine…");
    try {
      const settings = await saveSiteSettings({ fontFamily: fontFamily.value, fontUrl: fontUrl.value });
      fontFamily.value = settings.fontFamily;
      fontUrl.value = settings.fontUrl;
      updatePreview();
      setStatus("Salvato. Le pagine pubbliche ora usano questo font.", "success");
      document.querySelector("[data-preview]")?.contentWindow?.location.reload();
    } catch (error) {
      setStatus(error.message || "Salvataggio non riuscito", "error");
    }
  });
}
