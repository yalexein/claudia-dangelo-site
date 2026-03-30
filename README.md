# Sito personale (nuovo)

Sito statico costruito con **Astro** e pubblicabile su **GitHub Pages**.

## Struttura

- `src/pages/index.astro`: landing
- `src/pages/scrittrice/index.astro`: sezione “Scrittrice”
- `src/pages/collagista/index.astro`: sezione “Collagista”
- `src/layouts/`: layout separati (tema/typography indipendenti)
- `src/styles/`: CSS separati per ogni “mondo”
- `public/images/`: immagini (collage, foto, etc.)

## Sviluppo locale

1) Installa dipendenze: `npm install`
2) Avvia: `npm run dev`

## Deploy su GitHub Pages

È inclusa una GitHub Action in `.github/workflows/deploy.yml`.

Note:
- È predisposto per un **dominio custom** (file `public/CNAME`).
- Se invece userai le **project pages** (`https://<user>.github.io/<repo>/`), rimuovi `ASTRO_BASE: ""` da `.github/workflows/deploy.yml` e lascia il `base` automatico in `astro.config.mjs`.

## Immagini e “spazio” su GitHub (in breve)

In genere:
- GitHub ha un **limite di 100 MB per singolo file** nel repo (senza Git LFS).
- La dimensione totale del repo non ha un “hard limit” unico semplice, ma GitHub **sconsiglia repo molto grandi** (ordine dei GB) perché clonare/aggiornare diventa lento.

Se la parte “collagista” avrà molte immagini pesanti, opzioni tipiche:
- **Ottimizzare** (WebP/AVIF, dimensioni corrette).
- Usare **Git LFS** per i file grandi.
- Tenere le immagini su uno storage/CDN esterno e servire via URL.

Consiglio: prima di decidere, stimiamo quante immagini (numero, dimensione media, max).

Dettagli e strategie: `docs/ASSETS.md`.

Dominio custom (DNS + Pages): `docs/DOMAIN.md`.
