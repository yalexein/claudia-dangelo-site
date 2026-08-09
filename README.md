# Sito personale (nuovo)

Sito statico costruito con **Astro** e pubblicabile su **GitHub Pages**.

Repository canonico: `https://github.com/clahoudini/claudia-dangelo-site`

Sito pubblico: `https://claudia-dangelo.com`

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

## Editor condiviso da più PC

Per editare e salvare da più computer sulla stessa rete, usa il piccolo server editor locale:

1) Sul Mac principale avvia: `npm run editor`
2) Il terminale mostra un indirizzo tipo `http://192.168.x.x:4321/`
3) Dall’altro PC apri quell’indirizzo, per esempio `http://192.168.x.x:4321/uccelli/`
4) Usa l’editor e premi `Salva`: i dati vengono condivisi nel file locale `data/editor-state.json`

Il server serve il sito compilato da `dist/` e mantiene tutte le impostazioni dell’editor in `data/editor-state.json`.
Il file non va committato: è il salvataggio centrale del Mac che sta facendo da server.
CLAUDIA crea anche un backup locale in `data/editor-state.backup.json`: viene aggiornato a ogni salvataggio riuscito e comunque riscritto ogni 2 minuti. Se il salvataggio principale non è leggibile, CLAUDIA prova a recuperare dal backup.

Nota: su GitHub Pages il sito resta statico, quindi l’editor può funzionare nel browser locale ma non può salvare su `data/editor-state.json`. Per il salvataggio condiviso serve aprire il sito tramite `npm run editor`.

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
