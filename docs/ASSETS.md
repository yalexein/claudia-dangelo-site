# Asset (immagini) su GitHub

Questo progetto può contenere immagini in `public/images/`.

## Regole pratiche (consigliate)

- Preferisci **WebP/AVIF** (con fallback solo se serve).
- Esporta alla **dimensione massima reale** usata a schermo (evita 6000px se sul sito ne servono 1600px).
- Evita di mettere in repo sorgenti enormi (TIFF/PSD) se non sono indispensabili per il sito.

## Limiti importanti da considerare

- **100 MB per singolo file**: limite tipico per file nel repo senza Git LFS.
- Repo troppo grandi diventano scomodi da clonare/aggiornare (anche se “funzionano”).
- GitHub Pages ha anche limiti di pubblicazione/banda: prima di caricare molto materiale, verifica i limiti attuali nella documentazione GitHub.

## Strategie quando le immagini sono tante

1) **Ottimizzazione aggressiva** (spesso basta)
2) **Git LFS** per i file pesanti
3) **Storage esterno/CDN** (S3/R2/Cloudinary/…): il repo resta leggero, il sito carica immagini via URL

## Checklist per stimare “quanto spazio serve”

- Numero totale di immagini (e quante per pagina “tipica”)
- Dimensione media (MB) e dimensione massima
- Formato attuale (JPG/PNG/TIFF/…)
- Serve anche una versione “full-res” scaricabile?

