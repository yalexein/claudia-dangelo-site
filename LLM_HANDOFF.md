# LLM Handoff

Questo progetto contiene un sito Astro con un editor condiviso locale chiamato `CLAUDIA`.

Questo file serve a chi apre il progetto dopo, soprattutto altri LLM o collaboratori tecnici. Leggilo prima di fare modifiche.

## Obiettivo del progetto

- Sito personale/editoriale di Claudia.
- Alcune pagine sono statiche o semi-statiche.
- Molte pagine sono gestite da un editor browser condiviso che salva lo stato localmente sul Mac che ospita il server `CLAUDIA`.

## Comandi principali

- `npm install`
- `npm run dev`
  Avvia il sito in sviluppo Astro.
- `npm run build`
  Rigenera `dist/`.
- `npm run editor`
  Rigenera `dist/` e poi avvia il server condiviso `CLAUDIA`.

## Server CLAUDIA

Il server è implementato in:
[scripts/editor-server.mjs](/Users/yalexein/Desktop/Sito Web Claudia/scripts/editor-server.mjs)

Il server:
- serve il sito statico da `dist/`
- salva i contenuti dell’editor in `data/editor-state.json`
- mantiene backup locali e cronologia
- espone anche gli upload, soprattutto per `uccelli`

## File critici: non toccare alla leggera

Questi file e cartelle sono dati vivi del server:

- [data/editor-state.json](/Users/yalexein/Desktop/Sito Web Claudia/data/editor-state.json)
- [data/editor-state.backup.json](/Users/yalexein/Desktop/Sito Web Claudia/data/editor-state.backup.json)
- `data/editor-backups/`
- `data/editor-manual-saves/`
- `data/editor-history.json`
- `public/uploads/uccelli/`

Regola fondamentale:

- Non cancellare, svuotare, rigenerare o “ripulire” questi file/cartelle senza richiesta esplicita dell’utente.
- Non sostituire `data/editor-state.json` con versioni “più pulite” o “più semplici”.
- Non fare reset dei contenuti dell’editor solo perché nel sorgente Astro c’è un contenuto diverso.
- Non rimuovere backup vecchi per fare ordine.
- Non cancellare `public/uploads/uccelli/` anche se sembra materiale derivato.

Se serve modificare un contenuto editoriale attualmente visibile nel server condiviso, spesso bisogna aggiornare:

1. il sorgente Astro, per il default del progetto
2. `data/editor-state.json`, per lo stato attuale che `CLAUDIA` sta servendo

## Cosa non fare

- Non usare `git reset --hard`.
- Non cancellare `data/`.
- Non cancellare `dist/` se l’utente sta usando il server `CLAUDIA`, a meno che tu non stia immediatamente rigenerando con `npm run build` o `npm run editor`.
- Non assumere che una pagina editor-backed prenda il contenuto dal file `.astro`: spesso il contenuto reale arriva dallo stato salvato in `data/editor-state.json`.
- Non “normalizzare” manualmente il JSON dell’editor cambiando struttura o chiavi.
- Non rinominare namespace delle pagine senza migrare anche i dati associati.

## Struttura importante

### Pagine editor-backed generiche

Queste usano:
[src/components/EditableBlankPage.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/components/EditableBlankPage.astro)

Esempi:
- [src/pages/blog/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/blog/index.astro)
- [src/pages/link/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/link/index.astro)
- [src/pages/eventi/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/eventi/index.astro)
- [src/pages/ispirazioni/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/ispirazioni/index.astro)
- [src/pages/sketches/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/sketches/index.astro)
- [src/pages/collages/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/collages/index.astro)
- [src/pages/radio/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/radio/index.astro)
- [src/pages/scritture/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/scritture/index.astro)

Queste pagine usano un `namespace` che si riflette nelle chiavi dentro `data/editor-state.json`.

### Pagine editor-backed custom

Queste hanno schema e layout propri, ma dipendono comunque dal sistema di editing:

- [src/pages/bio/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/bio/index.astro)
- [src/pages/uccelli/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/uccelli/index.astro)
- [src/pages/contatti/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/contatti/index.astro)
- [src/pages/ricerche/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/ricerche/index.astro)
- [src/pages/newsletter/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/newsletter/index.astro)
- [src/pages/il-vizio-della-scrittura/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/il-vizio-della-scrittura/index.astro)

### Componenti centrali dell’editor

- [src/components/StyleEditorPanel.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/components/StyleEditorPanel.astro)
- [src/components/EditableBlankPage.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/components/EditableBlankPage.astro)
- [src/components/SharedEditorExtraControls.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/components/SharedEditorExtraControls.astro)
- [src/components/SharedEditorLayers.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/components/SharedEditorLayers.astro)
- [src/lib/sharedEditorConfig.ts](/Users/yalexein/Desktop/Sito Web Claudia/src/lib/sharedEditorConfig.ts)

## Come capire se una modifica va nel sorgente o nei dati

Metti questa regola pratica:

- Se stai cambiando layout, markup base, classi CSS, comportamento JS o struttura della pagina: modifica il sorgente `src/`.
- Se stai cambiando il contenuto già inserito via editor e l’utente vuole vederlo subito nel server condiviso: verifica anche `data/editor-state.json`.
- Se una pagina è già stata personalizzata nell’editor, il contenuto in `src/pages/...` può essere solo il default iniziale e non quello attualmente visualizzato.

## Upload e immagini

Le immagini caricate via editor possono finire in:

- `public/uploads/uccelli/`

Non spostarle o rinominarle senza aggiornare i riferimenti nei dati dell’editor.

## Editor immagini

La pagina [src/pages/immagini/index.astro](/Users/yalexein/Desktop/Sito Web Claudia/src/pages/immagini/index.astro) usa:

- [public/shared-advanced-editor.js](/Users/yalexein/Desktop/Sito Web Claudia/public/shared-advanced-editor.js)
- [src/styles/image-board.css](/Users/yalexein/Desktop/Sito Web Claudia/src/styles/image-board.css)

La menu bar alta è contestuale. Il JS aggiorna classi sul root `.image-board-page`, in particolare `has-active-sprite`, `has-game-player-selection`, `has-game-obstacle-selection` e `has-game-role-selection`. Il CSS usa queste classi per mostrare le sezioni corrette dentro i menu `Sprite` e `Gioco 2D`, più i badge riassuntivi nel menu. La command palette (`Cmd+K`, catalogo `commandDefinitions` in `shared-advanced-editor.js`) riusa gli stessi handler dei menu tramite `runMenuAction()`: quando aggiungi funzioni nuove, registra anche il comando lì invece di creare altri pannelli flottanti permanenti. Gli inspector avanzati supportano modalità `Flottante` e `Dock a destra`: la preferenza è `claudia-editor-immagini-inspector-dock-v1`, il JS aggiorna `is-inspector-docked`/`has-docked-inspector`, e il CSS desktop riserva la colonna destra senza cambiare le coordinate canvas. Il pannello `Livelli` ora include ricerca, filtri (`all/player/obstacle/sprite/web/hidden`) e gruppi/cartelle automatiche; lo stato piccolo di ricerca/filtro/cartelle collassate vive nello stesso `claudia-editor-immagini-layers-panel-v1` usato per posizione e collasso del pannello.

## Build e deploy

- `npm run build` aggiorna `dist/`
- `npm run editor` aggiorna `dist/` e poi accende il server condiviso

Se l’utente usa `CLAUDIA`, è meglio non lasciare `dist/` fuori sync dopo modifiche importanti.

## Workflow consigliato per modifiche sicure

1. Individua la pagina e il suo `namespace`.
2. Controlla se la pagina è editor-backed.
3. Se stai toccando contenuti live, guarda la chiave corrispondente in `data/editor-state.json`.
4. Modifica il minimo indispensabile.
5. Rigenera con `npm run build` quando serve aggiornare `dist/`.
6. Se serve collaborazione su rete locale, usa `npm run editor`.

## Nota sul pacchetto zip

Lo zip completo preparato per passare il progetto a un altro utente include anche:

- sorgente
- `dist/`
- dati del server `CLAUDIA`
- backup
- upload

Quindi chi lo riceve eredita anche lo stato editoriale attuale. Non trattarlo come un repo “pulito”: è una copia operativa completa.
