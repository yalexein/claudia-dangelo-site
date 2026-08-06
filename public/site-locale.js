(function () {
  const storageKey = "claudia-site-locale";
  const supported = new Set(["it", "en"]);
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("lang");
  let stored = "";

  try {
    stored = window.localStorage.getItem(storageKey) || "";
  } catch {}

  const detected = navigator.language.toLowerCase().startsWith("en") ? "en" : "it";
  const locale = supported.has(requested) ? requested : supported.has(stored) ? stored : detected;

  if (supported.has(requested)) {
    try {
      window.localStorage.setItem(storageKey, requested);
    } catch {}
  }

  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;

  const localized = (value, fallback = "") => {
    if (value && typeof value === "object") return value[locale] || value.it || value.en || fallback;
    return String(value || fallback);
  };

  const localizedUrl = (rawHref, nextLocale = locale) => {
    try {
      const url = new URL(rawHref, window.location.href);
      if (url.origin !== window.location.origin) return rawHref;
      if (!/^https?:$/.test(url.protocol) || (url.hash && url.pathname === window.location.pathname && !url.search)) return rawHref;
      url.searchParams.set("lang", nextLocale);
      return url.pathname + url.search + url.hash;
    } catch {
      return rawHref;
    }
  };

  window.ClaudiaLocale = Object.freeze({ locale, localized, localizedUrl });

  window.addEventListener("DOMContentLoaded", () => {
    const switcher = document.querySelector(".site-language-switcher");
    if (switcher) switcher.setAttribute("aria-label", locale === "en" ? "Language" : "Lingua");

    document.querySelectorAll("[data-locale-option]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement)) return;
      const option = link.dataset.localeOption;
      if (!supported.has(option)) return;
      link.href = localizedUrl(window.location.href, option);
      if (option === locale) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    document.querySelectorAll("a[href]").forEach((link) => {
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("data-locale-option")) return;
      const rawHref = link.getAttribute("href") || "";
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;
      link.href = localizedUrl(rawHref);
    });

    document.querySelectorAll("[data-locale-only]").forEach((element) => {
      if (!(element instanceof HTMLElement)) return;
      element.hidden = element.dataset.localeOnly !== locale;
    });

    document.querySelectorAll("[data-locale-content-it][data-locale-content-en]").forEach((element) => {
      const content = locale === "en" ? element.getAttribute("data-locale-content-en") : element.getAttribute("data-locale-content-it");
      if (content !== null) element.setAttribute("content", content);
    });

    document.querySelectorAll("[data-locale-alt-it][data-locale-alt-en]").forEach((element) => {
      const alt = locale === "en" ? element.getAttribute("data-locale-alt-en") : element.getAttribute("data-locale-alt-it");
      if (alt !== null) element.setAttribute("alt", alt);
    });

    document.querySelectorAll("[data-locale-aria-label-it][data-locale-aria-label-en]").forEach((element) => {
      const label = locale === "en" ? element.getAttribute("data-locale-aria-label-en") : element.getAttribute("data-locale-aria-label-it");
      if (label !== null) element.setAttribute("aria-label", label);
    });

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", locale === "en" ? "en_US" : "it_IT");

    document.dispatchEvent(new CustomEvent("claudia:locale-ready", { detail: { locale } }));
  }, { once: true });
})();
