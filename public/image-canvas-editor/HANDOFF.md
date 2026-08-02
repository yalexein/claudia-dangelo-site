# Handoff tecnico - Canvas immagini portabile

## Obiettivo

Questo editor serve a consegnare una pagina-canvas bianca per immagini PNG/JPG, indipendente dall'editor principale del sito Claudia.

La versione portabile deve funzionare anche se l'altra persona ha modificato file del server Claudia. Per questo motivo la cartella `public/image-canvas-editor` contiene tutto quello che serve localmente e non importa codice da Astro, `shared-advanced-editor.js`, `editor-sync.js` o API server.

## File principali

- `public/image-canvas-editor/index.html`: app portabile.
- `public/image-canvas-editor/image-canvas-core.js`: regole pure condivise tra app portabile, `/immagini/` ed exporter.
- `public/image-canvas-editor/public-page-exporter.js`: generatore condiviso per esportare HTML pubblico self-contained.
- `public/image-canvas-editor/README.md`: istruzioni per utente finale.
- `image-canvas-editor-portable.zip`: pacchetto pronto da inviare, generato zippando la cartella `public/image-canvas-editor`.

Nel sito Claudia integrato esiste anche una pagina piu legata al sito:

- `src/pages/immagini/index.astro`
- `src/styles/image-board.css`
- `public/shared-advanced-editor.js`

La pagina portabile e la pagina `/immagini/` hanno UI e runtime editor separati. Condividono pero un piccolo core di normalizzazione dati: `public/image-canvas-editor/image-canvas-core.js`.

## Core condiviso

`image-canvas-core.js` non tocca il DOM e non dipende da Astro. Espone `window.ImageCanvasCore` con funzioni pure per:

- liste valori supportati: hover, click, blend, movimento, sprite, trigger e gradiente;
- `normalizeBlendMode(...)`, `normalizeHoverEffect(...)`, `normalizeClickEffect(...)`;
- `normalizeOpacity(...)` e `normalizeLink(...)`;
- `normalizeCanvasBackground(...)` e `buildCanvasBackgroundCss(...)`;
- `normalizeLayerTrigger(...)`.

Il core viene caricato prima di `public-page-exporter.js` e prima degli editor:

- `/immagini/`: `src/pages/immagini/index.astro`;
- portabile: `public/image-canvas-editor/index.html`.

Gli editor mantengono fallback locali per sicurezza, ma quando `window.ImageCanvasCore` e presente usano quello. Questo e il punto da estendere prima di aggiungere nuove regole dati condivise.

Nota importante: l'HTML pubblico esportato resta self-contained. L'exporter usa il core mentre genera il file, ma nel file finale scrive direttamente dati normalizzati e runtime necessario, senza dipendere da `image-canvas-core.js`.

## Funzioni disponibili

- Import PNG/JPG multiplo.
- Import sprite PNG/JPG multiplo come singolo layer animato.
- Scontorno locale di JPEG/PNG con finta scacchiera o sfondo uniforme.
- Box per ogni immagine.
- Multi-selezione immagini con mouse e tastiera.
- Selezione di tutti i layer con bottone `Sposta tutto`.
- Centratura automatica della composizione con bottone `Centra tutto`.
- Spostamento con drag.
- Resize proporzionale.
- Rotazione.
- Layer/z-index con slider e pulsanti avanti/indietro.
- Opacita per layer.
- Fusione per layer con `mix-blend-mode` sul box esterno.
- Visibile/nascosto.
- Bloccato/sbloccato.
- Effetti hover per singola immagine.
- Effetti click per singola immagine.
- Movimento animato per singola immagine.
- Mini timeline/percorso keyframe per singola immagine.
- Pannello Movimento separato dalla toolbar.
- Parallasse per singola immagine.
- Camera preview controllabile con frecce tastiera.
- Drag pubblico per singola immagine, con inerzia runtime.
- Pannello Sprite con play/pausa, FPS, loop, modalita avanti/ping-pong e frame manuale.
- Pannello Scontorna con tolleranza, sfumatura, bordo e ripristino originale.
- Link per singola immagine.
- Sfondo canvas con colore base, gradiente, tre punti gradiente, carta ruvida e griglia solo-editor.
- Menu contestuale con tasto destro per azioni rapide su immagine o multi-selezione.
- Pannelli editor trasparenti, scalabili, collassabili, ridimensionabili e spostabili.
- Trim automatico della trasparenza PNG per posizionare hover, click e maniglie.
- Hit-test pixel-perfect sul canale alpha per scegliere l'immagine cliccata.
- Vista pubblica che nasconde toolbar, pannello livelli e maniglie.
- Export/import JSON.
- Export HTML pubblico finale senza editor/marker/maniglie.
- Export HTML pubblico con runtime sprite incluso.
- Salvataggio automatico del layout in `localStorage`, con asset immagine grandi in `IndexedDB`.
- Cronologia `undo/redo` leggera: gli snapshot salvano riferimenti agli asset invece di duplicare base64.

## Multi-selezione immagini

La selezione multipla e gestita con un set di id immagine:

- click normale su immagine: seleziona una sola immagine;
- `Shift`/`Cmd`/`Ctrl` + click su immagine o riga livelli: aggiunge/toglie dalla selezione;
- `Cmd`/`Ctrl` + `A`: seleziona tutte le immagini;
- `Delete`/`Backspace`: cancella tutte le immagini selezionate;
- drag su una immagine gia selezionata: sposta insieme tutte le immagini selezionate non bloccate.

Quando piu immagini sono selezionate, i controlli applicano lo stesso valore a tutte:

- `Mouse sopra`;
- `Click`;
- `Link` e preset `Pagine`;
- `Opacita`;
- `Fusione`;
- visibilita;
- blocco;
- layer/z-index e pulsanti avanti/indietro.
- movimento, path/percorso, parallasse e drag pubblico.

Dopo un import multiplo, tutte le immagini appena importate restano selezionate. Questo permette di applicare subito impostazioni comuni.

Il bottone `Sposta tutto` chiama la stessa logica di selezione totale: seleziona tutti gli id e lascia all'utente il drag di gruppo. Il bottone `Centra tutto` calcola il bounding box visuale dei layer visibili, lo confronta con il centro del viewport, applica lo stesso delta a tutti gli item e sposta anche `pathMotion.points` per non rompere i percorsi gia impostati.

## Pannelli editor flottanti

Nella versione portabile i cinque pannelli principali sono:

- `.toolbar`
- `.layers`
- `.motion-panel`
- `.sprite-panel`
- `.background-panel`

`.motion-panel` e `.sprite-panel` partono con `hidden` e vengono aperti dai bottoni `Movimento` e `Sprite`; questa scelta evita che coprano `Livelli` sui viewport stretti.

All'avvio `setupPanel(panel, id, fallback)` aggiunge a ciascun pannello:

- mini barra `.panel-controls`;
- bottone drag `[data-panel-drag]`;
- bottone collapse `[data-panel-collapse]`;
- range trasparenza `[data-panel-opacity]`;
- range scala/font `[data-panel-scale]`;
- barra inferiore `.panel-resize-y` per resize verticale;
- maniglia `.panel-resize` per resize larghezza+altezza.

Lo stato dei pannelli viene salvato separatamente dal layout immagini:

```js
const panelStorageKey = "portable-image-canvas-panels-v1";
```

Campi salvati per pannello:

```json
{
  "toolbar": {
    "x": 16,
    "y": 16,
    "width": 900,
    "height": 120,
    "opacity": 92,
    "scale": 100,
    "collapsed": false
  }
}
```

`opacity` va da `35` a `100`. `scale` va da `60` a `130` e usa `--panel-scale`, quindi riduce/aumenta anche testo e controlli. `x` e `y` vengono normalizzati al viewport corrente per evitare pannelli fuori schermo quando si cambia monitor o dispositivo.

Nella pagina integrata `/immagini/` lo stesso concetto vive in `public/shared-advanced-editor.js` con `setupFloatingPanel(...)`, classi CSS `image-board-*` e chiave:

```js
const floatingPanelsKey = `claudia-editor-${namespace}-floating-panels-v1`;
```

Queste preferenze non vanno esportate nel JSON del canvas: sono preferenze locali dell'editor, non dati pubblici della composizione.

### Menu bar integrata

Nella pagina integrata `/immagini/`, la navigazione primaria deve partire dalla menu bar fissa in alto. I menu `Animazione`, `Sprite`, `Scontorna`, `Sfondo` e `Gioco 2D` contengono comandi rapidi contestuali con `data-image-board-menu-action`; i pannelli flottanti restano come inspector completi apribili dal rispettivo menu, non come unico punto di ingresso. Lo status del layer e separato in una riga sotto la menu bar per non comprimere i menu.

## Salvataggio asset e cronologia

Il layout JSON operativo resta in `localStorage`, ma PNG/JPG, frame sprite e originali di scontorno possono superare rapidamente la quota del browser. Per questo la versione portabile usa:

```js
const imageAssetDbName = "portable-image-canvas-assets-v1";
const localImageAssetPrefix = "portable-local-image-asset://canvas/";
```

La pagina integrata usa lo stesso concetto con:

```js
const imageAssetDbName = "claudia-editor-image-assets-v1";
const localImageAssetPrefix = `claudia-local-image-asset://${encodeURIComponent(namespace)}/`;
```

Quando viene salvato il layout, le immagini inline `data:image/...` vengono scritte in `IndexedDB` e sostituite con un riferimento locale. All'apertura, `hydrateItemsFromLocalAssets(...)` nella portabile e `hydrateImageBoxesFromLocalAssets(...)` nell'integrata risolvono quei riferimenti.

Nell'integrata `/immagini/`, anche gallerie e immagine di sfondo caricata dall'utente seguono lo stesso principio: il valore in `localStorage` deve restare un manifest leggero, non un base64 pesante. Se `IndexedDB` fallisce, l'editor salva comunque i metadati e avvisa di esportare un pacchetto.

Per spostare il lavoro tra browser o server, usare `Esporta pacchetto` nell'integrata. Il file usa:

```json
{
  "kind": "claudia-image-canvas-package",
  "version": 3,
  "manifest": {},
  "assets": []
}
```

Nel `manifest` restano metadati, layer, gallerie, sfondo e stanza gioco. Gli asset pesanti stanno in `assets[]` e i campi immagine puntano a `claudia-package-image-asset://...`. L'import integrato capisce questo formato e rimane compatibile con vecchi JSON ad array, `items` o `images`.

La cronologia `undo/redo` segue lo stesso principio:

- portabile: `cloneItemForHistory(...)`, `resolveHistoryItemAssets(...)`, `historyAssetCache`;
- integrata: `cloneImageForHistory(...)`, `resolveImageHistoryItemAssets(...)`, `imageHistoryAssetCache`.

Gli snapshot della cronologia restano stringhe JSON, ma contengono riferimenti agli asset e non copie ripetute dei base64. La cache in memoria conserva gli asset necessari per la sessione corrente; `IndexedDB` fa da fallback se un riferimento locale deve essere risolto asincronamente.

## Input mapping gioco

Nell'editor integrato `/immagini/`, i tasti della preview gioco non sono hardcodati. Sono salvati dentro `gameRoom.input`:

```json
{
  "input": {
    "bindings": {
      "move-up": ["w", "arrowup"],
      "move-down": ["s", "arrowdown"],
      "move-left": ["a", "arrowleft"],
      "move-right": ["d", "arrowright"],
      "action": ["e", "enter"],
      "cancel": ["escape", "backspace"]
    },
    "mirrorHorizontal": true
  }
}
```

Il runtime usa `normalizeGamePreviewAction(...)` per tradurre un tasto fisico in azione. Non reintrodurre mappe WASD/frecce fisse fuori da quel passaggio. L'opzione `mirrorHorizontal` lavora insieme al flag per-layer `game.autoFlip`: se uno dei due e spento, il player non viene specchiato.

## Sprite animati

Uno sprite e salvato come normale item immagine con un oggetto `sprite`. Il primo frame resta anche in `src` per retrocompatibilita con vecchi renderer:

```json
{
  "id": "sprite-...",
  "src": "data:image/png;base64,...",
  "x": 150,
  "y": 180,
  "width": 180,
  "rotation": 0,
  "z": 48,
  "hoverEffect": "glow",
  "clickEffect": "pulse",
  "linkUrl": "/sketches/",
  "sprite": {
    "enabled": true,
    "name": "idle",
    "frames": [
      { "src": "data:image/png;base64,...", "name": "idle-1" },
      { "src": "data:image/png;base64,...", "name": "idle-2" }
    ],
    "fps": 8,
    "loop": true,
    "mode": "pingpong",
    "playing": true,
    "frameIndex": 0,
    "anchor": "bottom-center",
    "syncMotion": true,
    "onion": {
      "enabled": true,
      "opacity": 0.28
    }
  }
}
```

Regole:

- `frames` deve avere almeno 2 frame per essere uno sprite utile.
- I file importati vengono ordinati per nome con confronto numerico, quindi `walk-2.png` viene prima di `walk-10.png`.
- Lo sprite resta un layer immagine normale: supporta posizione, resize proporzionale, rotazione, z-index, opacita, blend, hover, click, link, movimento, path, parallasse e drag pubblico.
- I controlli `FPS`, `Loop`, `Modo`, `Sync movimento`, `Onion skin`, `Opacita onion` e `Uniforma frame` si applicano a tutti gli sprite nella selezione multipla. Il controllo `Frame` lavora sullo sprite attivo e mette `playing: false`.
- `syncMotion: true` sincronizza il frame sprite con la distanza percorsa nel canvas. Se il layer si ferma, la camminata si ferma; se il movimento accelera, cambia frame piu velocemente.
- `onion.enabled` mostra frame precedente e successivo nell'editor con opacita regolabile. L'onion skin non viene mostrato nella modalita pubblica.

Funzioni chiave nella versione portabile `public/image-canvas-editor/index.html`:

- `normalizeSpriteFrame(...)`
- `normalizeSprite(...)`
- `spriteEnabled(...)`
- `spriteAnimating(...)`
- `spriteFrameIndex(...)`
- `currentSpriteFrame(...)`
- `applySpriteFrame(...)`
- `syncSpriteLoop(...)`
- `defaultSprite(...)`
- `makeSpriteFrames(...)`
- `drawDemoSpriteFrame(...)`
- `renderSpriteStrip(...)`
- `fitSelectedSpriteFrames(...)`

Funzioni equivalenti nella pagina integrata `public/shared-advanced-editor.js`:

- `normalizeSpriteFrame(...)`
- `normalizeSprite(...)`
- `spriteIsEnabled(...)`
- `spriteIsAnimating(...)`
- `getSpriteFrameIndex(...)`
- `getCurrentSpriteFrame(...)`
- `applySpriteFrame(...)`
- `syncSpriteLoop(...)`
- `defaultSpriteBox(...)`
- `makeSpriteFrames(...)`
- `drawDemoSpriteFrame(...)`
- `renderSpriteStrip(...)`
- `fitSelectedSpriteFrames(...)`

Il renderer usa `img[data-sprite-frame-target]` e cambia solo `img.src` a ogni frame. Le dimensioni e l'hit-test continuano a usare il box del layer, quindi gli sprite funzionano con alpha hit-test, hover e link. Per qualita migliore, usare `Uniforma frame` dopo l'import o tenere tutti i frame della stessa dimensione e con lo stesso margine trasparente.

L'export pubblico vive in `public/image-canvas-editor/public-page-exporter.js`. Li lo sprite viene normalizzato e animato nel runtime esportato con `requestAnimationFrame`; non serve l'editor per farlo funzionare nella pagina finale.

## Trigger e sequenza layer

Ogni layer immagine puo avere un oggetto `trigger`:

```json
{
  "trigger": {
    "action": "show",
    "mode": "delay",
    "delay": 2.5,
    "key": "Space",
    "targetId": "image-..."
  }
}
```

Campi:

- `action: "show"` nasconde il layer finche il trigger non scatta.
- `action: "play"` lascia il layer visibile ma ferma movimento, path e sprite finche il trigger non scatta.
- `mode: "immediate"` parte subito.
- `mode: "delay"` scatta dopo `delay` secondi in modalita pubblica.
- `mode: "click"` scatta quando il layer viene cliccato. E utile soprattutto con `action: "play"`, perche un layer `show` nascosto non puo essere cliccato.
- `mode: "key"` scatta quando viene premuto `key` in modalita pubblica.
- `mode: "after-layer"` scatta quando il layer `targetId` e gia scattato.

Funzioni chiave: `normalizeLayerTrigger(...)`, `resetLayerTriggers(...)`, `setLayerTriggered(...)`, `layerVisibleByTrigger(...)`, `layerAnimationAllowed(...)`. L'export pubblico replica la stessa logica in `public-page-exporter.js`.

## Scontorno immagini

Il pannello `Scontorna` converte uno sfondo finto in alpha reale direttamente nel browser. Non usa API esterne.

Target supportati:

- JPEG/PNG con scacchiera finta tipo trasparenza esportata male.
- JPEG/PNG con sfondo colorato uniforme.
- Casi semplici in cui i colori di fondo sono dominanti sui bordi dell'immagine.

Algoritmo:

1. `sampleCheckerColors(...)` campiona i colori dominanti sui bordi.
2. `createCheckerCutout(...)` confronta ogni pixel con quei colori.
3. `Tolleranza` decide quanto vicino al fondo diventa trasparente.
4. `Sfumatura` sfoca la maschera alpha.
5. `Bordo` sposta la soglia per contrarre/espandere il taglio.
6. Il risultato viene salvato come data URL `image/png`.

Campi dati aggiunti agli item:

```json
{
  "cutoutOriginalSrc": "data:image/jpeg;base64,...",
  "cutoutOriginalSpriteFrames": [
    { "src": "data:image/png;base64,...", "name": "walk-01" }
  ],
  "cutoutSettings": {
    "tolerance": 38,
    "feather": 3,
    "edge": 0,
    "crop": true,
    "margin": 8,
    "smooth": true
  }
}
```

`crop: true` ritaglia fisicamente il risultato al bounding box opaco; `margin` conserva un bordo in pixel attorno alla sagoma. Per gli sprite il crop usa l'unione dei bounding box di tutti i frame, cosi l'animazione non salta.

`Ripristina` usa `cutoutOriginalSrc`, `cutoutOriginalSpriteFrames` e `cutoutOriginalGeometry`, poi elimina questi campi. Dopo ogni scontorno o reset bisogna azzerare `trim`, `naturalWidth`, `naturalHeight` e le pixel mask, per forzare il ricalcolo dell'hit-test alpha.

Sugli sprite, `Applica` processa tutti i frame salvati in `sprite.frames` e aggiorna anche `item.src` al primo frame scontornato. L'export pubblico non ha logica speciale per lo scontorno: vede solo PNG con alpha reale.

## Sfondo canvas

La versione portabile salva lo sfondo dentro lo stesso payload del canvas:

```json
{
  "background": {
    "baseColor": "#fbfaf7",
    "editorGrid": true,
    "gradient": {
      "enabled": true,
      "type": "linear",
      "angle": 132,
      "stops": [
        { "color": "#fbfaf7", "position": 0 },
        { "color": "#f6e6a8", "position": 46 },
        { "color": "#b9c7ef", "position": 100 }
      ]
    },
    "paper": {
      "enabled": true,
      "strength": 42,
      "scale": 1.2
    }
  }
}
```

La pagina integrata `/immagini/` salva invece lo stesso oggetto in:

```js
const canvasBackgroundKey = `claudia-editor-${namespace}-canvas-background-v1`;
```

Funzioni rilevanti:

- `normalizeCanvasBackground(...)`: compatibilita con JSON vecchi o incompleti.
- `buildCanvasBackgroundCss(...)`: compone colore, gradiente, carta e opzionalmente griglia.
- `applyCanvasBackground(...)`: applica CSS variables al canvas editor.
- `syncCanvasBackgroundControls(...)`: aggiorna input, output e stato disabled.

La griglia e solo un aiuto editoriale: `buildCanvasBackgroundCss(..., { includeGrid: false })` viene usato in Vista pubblica e in export HTML pubblico. Quindi l'HTML finale mantiene colore/gradiente/carta ma non esporta la griglia.

## Menu contestuale tasto destro

Il click destro usa lo stesso hit-test alpha del click normale, quindi ignora i pixel trasparenti delle PNG e apre il menu per l'immagine realmente sotto il cursore.

Azioni disponibili:

- `Duplica`;
- `Porta davanti`;
- `Porta dietro`;
- `Nascondi` / `Mostra`;
- `Blocca` / `Sblocca`;
- `Copia stile`;
- `Incolla stile`;
- `Copia movimento`;
- `Incolla movimento`;
- `Ferma movimento`;
- `Aggiungi punto percorso`;
- `Attiva percorso` / `Disattiva percorso`;
- `Pulisci percorso`;
- `Attiva parallasse` / `Disattiva parallasse`;
- `Attiva drag pubblico` / `Disattiva drag pubblico`;
- `Seleziona tutte`;
- `Elimina`.

Il menu lavora sulla selezione corrente. Se l'utente fa click destro su un'immagine non selezionata, quella immagine diventa la selezione. Se fa click destro su un'immagine gia inclusa in una selezione multipla, la selezione viene preservata.

`Copia stile` salva solo proprieta editoriali trasferibili:

- `hoverEffect`;
- `clickEffect`;
- `linkUrl`;
- `opacity`;
- `blendMode`.

Non copia posizione, dimensione, rotazione, visibilita o blocco.

## Movimento immagine

I controlli di movimento stanno nel pannello `Movimento`, aperto dal bottone in toolbar. Questo pannello e separato dalla toolbar principale per non affollare i controlli di editing base.

Ogni item puo avere un oggetto opzionale `motion`:

```json
{
  "motion": {
    "preset": "float",
    "speed": 1,
    "distance": 40
  }
}
```

Preset supportati:

- `none`: fermo;
- `float`: movimento verticale morbido;
- `drift-x`: onda orizzontale;
- `drift-y`: onda verticale;
- `orbit`: piccolo movimento ellittico;
- `sway`: rotazione morbida;
- `scroll-left`: scorrimento orizzontale ciclico.

Il runtime usa `requestAnimationFrame` e aggiorna il `transform` del box immagine, non solo della superficie interna. Per questo hover/click e hit-test alpha restano allineati alla posizione vista dall'utente.

Quando nessuna immagine ha movimento attivo, il loop si spegne. Se il JSON non contiene `motion`, `normalizeItem` usa `{ preset: "none", speed: 1, distance: 40 }`, quindi i vecchi JSON restano compatibili.

Il menu contestuale ha azioni separate per movimento:

- `Copia movimento`;
- `Incolla movimento`;
- `Ferma movimento`.

Queste azioni non toccano hover, click, link, opacita o fusione.

## Percorsi e mini timeline

Ogni item puo avere un oggetto opzionale `pathMotion`:

```json
{
  "pathMotion": {
    "enabled": true,
    "duration": 7,
    "points": [
      { "x": 88, "y": 210 },
      { "x": 164, "y": 258 },
      { "x": 112, "y": 326 }
    ]
  }
}
```

Significato:

- `enabled`: abilita/disabilita il percorso.
- `duration`: durata del loop completo avanti/indietro, da `1` a `30` secondi.
- `points`: massimo 12 punti assoluti del canvas. I punti salvano `item.x` / `item.y`, cioe l'ancora tecnica del box.

Il pannello `Movimento` contiene la sezione `Percorso`:

- `Attiva`: abilita il path per la selezione.
- `Durata`: applica la stessa durata a tutte le immagini selezionate.
- `Aggiungi punto`: registra la posizione corrente di ogni immagine selezionata.
- `Play` / `Pausa`: abilita o disabilita `pathMotion.enabled`.
- `Pulisci`: svuota `points` e spegne il path.

Il runtime interpola tra i punti con easing morbido e usa un andamento ping-pong. Questo evita lo scatto dall'ultimo punto al primo.

Formula concettuale del path:

```js
pathOffset.x = interpolatedPoint.x - item.x;
pathOffset.y = interpolatedPoint.y - item.y;
```

L'overlay editoriale disegna linee e punti numerati solo in modalita editor. L'overlay e un SVG con `pointer-events: none`, quindi non intercetta hover, click, menu contestuale o drag. In `Vista pubblica` viene rimosso.

`normalizeItem` usa `{ enabled: false, duration: 6, points: [] }` quando il JSON non contiene `pathMotion`, quindi i vecchi JSON restano compatibili.

## Parallasse e camera

Ogni item puo avere un oggetto opzionale `parallax`:

```json
{
  "parallax": {
    "enabled": true,
    "depth": 0.7
  }
}
```

Significato:

- `enabled`: abilita la risposta di quel layer alla camera.
- `depth`: intensita della risposta, da `0` a `2.5`.

Valori bassi producono layer piu lenti e lontani. Valori alti producono layer piu veloci e vicini.

La camera e uno stato runtime, non viene salvata nel JSON portabile:

```js
const camera = { x: 0, y: 0 };
```

Nella pagina integrata lo stesso concetto e chiamato `parallaxCamera`.

Keyboard:

- `ArrowRight`: aumenta `camera.x`; i layer parallasse si spostano a sinistra per simulare camera verso destra.
- `ArrowLeft`: diminuisce `camera.x`.
- `ArrowDown`: aumenta `camera.y`.
- `ArrowUp`: diminuisce `camera.y`.
- `Shift` + freccia: passo piu grande.

La trasformazione renderizzata combina posizione base, `motion`, `pathMotion` e parallasse:

```js
renderX = item.x + motion.x + pathOffset.x - camera.x * parallax.depth;
renderY = item.y + motion.y + pathOffset.y - camera.y * parallax.depth;
```

Il pixel hit-test usa la stessa trasformazione renderizzata, quindi hover/click restano allineati quando la camera si muove.

Per un futuro editor di sfondo 2D, questa e la base minima: i layer hanno gia profondita individuale e la camera puo essere controllata da input tastiera. Un runtime di gioco potra leggere `item.parallax.depth` e pilotare la camera con il proprio stato.

## Drag pubblico con inerzia

Ogni item puo avere un oggetto opzionale `publicDrag`:

```json
{
  "publicDrag": {
    "enabled": true,
    "inertia": 0.9
  }
}
```

Significato:

- `enabled`: abilita il drag dell'immagine in `Vista pubblica`.
- `inertia`: decadimento dell'inerzia, da `0` a `0.98`. Valori piu alti fanno scorrere piu a lungo l'immagine dopo il rilascio.

Questa feature non modifica `item.x` / `item.y` e non salva la posizione trascinata dal visitatore. Il runtime mantiene offset separati:

```js
const publicDragOffsets = new Map();
const publicDragInertiaItems = new Map();
```

La trasformazione renderizzata diventa:

```js
renderX = item.x + motion.x + pathOffset.x - camera.x * parallax.depth + publicDragOffset.x;
renderY = item.y + motion.y + pathOffset.y - camera.y * parallax.depth + publicDragOffset.y;
```

Il drag pubblico usa lo stesso pixel hit-test alpha di hover e click, quindi una PNG grande con margini trasparenti non blocca il drag di immagini piccole vicine o sotto.

Click/link:

- se l'utente fa un click breve su un'immagine con link, parte prima l'effetto click visuale e poi il link si apre;
- se l'utente trascina oltre la soglia, il click generato al rilascio viene soppresso per evitare navigazioni accidentali.

Blocco:

- se `locked` e true, il drag pubblico non parte anche se `publicDrag.enabled` e true.

La pagina integrata usa gli stessi concetti in `public/shared-advanced-editor.js`; la portabile li contiene inline in `public/image-canvas-editor/index.html`.

## Come funzionano i link per immagine

Il link e una proprieta del singolo item: `linkUrl`.

Flusso utente:

1. Seleziona un'immagine nel canvas o nel pannello `Livelli`.
2. Scrive un valore nel campo `Link`, oppure usa il menu `Pagine`.
3. L'editor salva il valore in `item.linkUrl`.
4. In `Vista pubblica`, un click sull'immagine avvia l'effetto click visuale e poi naviga a `resolveLink(item.linkUrl)`.

Valori supportati:

- `/bio/`: pagina interna assoluta sullo stesso sito.
- `bio/`: normalizzato in `/bio/`.
- `#sezione`: ancora nella pagina corrente.
- `https://...`: URL assoluto esterno.

Il menu `Pagine` e solo una scorciatoia. La lista e configurata nell'array `siteLinks` dentro `index.html`.

## Export HTML pubblico

Il bottone `Esporta HTML pubblico` usa `public/image-canvas-editor/public-page-exporter.js`.

Questo file espone:

```js
window.createImageCanvasPublicHtml(items, options)
window.downloadImageCanvasPublicHtml(items, options)
```

L'HTML generato e self-contained: contiene immagini data URL, CSS e runtime JS inline. Non contiene toolbar, pannelli, marker, livelli o maniglie.

Funzioni mantenute nella pagina pubblica:

- hover effect;
- click effect con link dopo un piccolo delay se l'effetto e visuale;
- sfondo pubblico senza griglia editor, con colore/gradiente/carta ruvida;
- opacita e `mix-blend-mode`;
- movimento, path/percorso, parallasse e drag pubblico;
- sprite animati con FPS, loop, modalita avanti/ping-pong e sync movimento;
- runtime gioco pubblico senza editor: player, WASD/click tramite input mapping, zona camminabile, ostacoli, spawn, depth sort, sprite direzionali e auto-flip;
- trigger layer `show`/`play` con delay, click, tasto e dipendenza da altro layer;
- hit-test alpha per non far cliccare i pixel trasparenti delle PNG.

La pagina integrata `/immagini/` carica lo stesso exporter prima di `shared-advanced-editor.js` e passa `imageBoxes`, `canvasBackground` e `gameRoom` a `downloadImageCanvasPublicHtml(...)`.

Per esportare una pagina gioco pubblica, il dato minimo richiesto e:

```js
window.downloadImageCanvasPublicHtml(items, {
  title: "Nome pagina",
  filename: "pagina-gioco.html",
  background: canvasBackground,
  gameRoom: normalizeGameRoom(gameRoom),
});
```

Nel file HTML generato non ci sono toolbar, marker, pannelli o overlay editor. Il runtime legge `#canvas-data` e `#game-data`: se un layer ha `game.role = "player"` usa spawn/input/pathfinding, se un layer ha `game.role = "obstacle"` blocca il player, e se `game.depthSort` e attivo lo z-index viene calcolato dal piede/ancora Y. L'auto-flip usa `game.autoFlip` insieme a `gameRoom.input.mirrorHorizontal`; se lo sprite ha frame `walk-left`, il runtime preferisce quelli e non specchia.

Per adattarlo a un altro sito, modificare:

```js
const siteLinks = [
  { label: "Home", value: "/" },
  { label: "Bio", value: "/bio/" },
  { label: "Contatti", value: "/contatti/" },
];
```

Se il sito usa percorsi diversi, cambiare solo `label` e `value`.

## Dati salvati

Storage key:

```txt
portable-image-canvas-v1
```

Formato:

```json
{
  "version": 1,
  "updatedAt": "2026-06-17T00:00:00.000Z",
  "background": {
    "baseColor": "#fbfaf7",
    "editorGrid": true,
    "gradient": {
      "enabled": false,
      "type": "linear",
      "angle": 135,
      "stops": []
    },
    "paper": {
      "enabled": false,
      "strength": 32,
      "scale": 1
    }
  },
  "items": [
    {
      "id": "demo-...",
      "src": "data:image/png;base64,...",
      "x": 120,
      "y": 180,
      "width": 340,
      "rotation": 0,
      "z": 20,
      "opacity": 1,
      "blendMode": "normal",
      "naturalWidth": 800,
      "naturalHeight": 600,
      "trim": {
        "naturalWidth": 800,
        "naturalHeight": 600,
        "x": 120,
        "y": 80,
        "width": 420,
        "height": 360
      },
      "hidden": false,
      "locked": false,
      "hoverEffect": "lift",
      "clickEffect": "pulse",
      "linkUrl": "/bio/",
      "motion": {
        "preset": "none",
        "speed": 1,
        "distance": 40
      },
      "parallax": {
        "enabled": false,
        "depth": 1
      },
      "publicDrag": {
        "enabled": false,
        "inertia": 0.88
      },
      "pathMotion": {
        "enabled": false,
        "duration": 6,
        "points": []
      }
    }
  ]
}
```

Le immagini importate vengono salvate come data URL. Questo rende il JSON trasportabile, ma puo diventare grande con immagini pesanti.

## Trim automatico e hit-test alpha

Alcune PNG importate hanno un canvas sorgente molto piu grande del contenuto visibile, con margini trasparenti. L'editor calcola automaticamente `trim` leggendo il canale alpha dell'immagine e usa quell'area visibile per:

- bordo di selezione;
- maniglie di spostamento, resize, rotazione ed elimina.

Per hover e click l'editor va oltre il trim rettangolare: conserva una maschera alpha in memoria e verifica il pixel esatto sotto il mouse. Se un'immagine sopra ha quel pixel trasparente, viene ignorata e il click puo raggiungere l'immagine sotto.

Il box completo resta solo come contenitore tecnico per mantenere proporzioni, rotazione e blend mode. Ha `pointer-events: none`; anche la superficie `.surface` / `.uccelli-image-box__surface` non intercetta direttamente gli eventi. Gli eventi vengono risolti dal canvas con il pixel-test. Le maniglie restano bottoni reali con `pointer-events: auto`.

Se la maschera non puo essere calcolata, per esempio su immagini remote con canvas non leggibile, l'editor usa il trim rettangolare come fallback. Con le immagini importate come data URL, il pixel-test funziona normalmente.

## Integrazione nel server Claudia

Metodo piu sicuro, senza toccare editor o file modificati:

1. Copiare `image-canvas-editor/` dentro `public/`.
2. Eseguire `npm run build`.
3. Avviare `npm run editor:server`.
4. Aprire `/image-canvas-editor/`.

Se il server di sviluppo non risolve la cartella come directory index, aprire direttamente `/image-canvas-editor/index.html`.

Metodo senza build:

1. Copiare `image-canvas-editor/` direttamente dentro `dist/`.
2. Avviare `npm run editor:server`.
3. Aprire `/image-canvas-editor/`.

Questa pagina non usa `/api/editor-state` e non usa `/api/editor-upload`. Funziona quindi anche su hosting statico.

## Integrazione piu profonda, opzionale

Se un futuro agente vuole integrarla davvero nel sistema Claudia:

1. Creare una pagina Astro, per esempio `src/pages/image-canvas-editor/index.astro`.
2. Spostare CSS e JS in asset separati solo se serve manutenzione.
3. Collegare il salvataggio a `editor-sync.js` o a `/api/editor-state` solo se serve sync multi-browser/server.
4. Lasciare `linkUrl` come proprieta per-item.
5. Mantenere `mix-blend-mode` sul box esterno, non sulla superficie interna.

Non e consigliato fondere subito questa pagina con `shared-advanced-editor.js`, perche il vantaggio della versione portabile e proprio evitare conflitti con editor Claudia modificati.

## Nota su fusione layer

Il blend mode deve stare sull'elemento layer esterno:

```css
.image-box {
  mix-blend-mode: var(--blend-mode, normal);
}
```

Se viene applicato alla superficie interna dell'immagine, puo sembrare non funzionare perche il box trasformato/filtrato crea un contesto di compositing separato.

## QA gia fatto

Comandi eseguiti nel progetto Claudia:

```sh
node --check public/shared-advanced-editor.js
node -e "const fs=require('fs'); const html=fs.readFileSync('public/image-canvas-editor/index.html','utf8'); const scripts=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(m=>m[1]); for (const script of scripts) new Function(script); console.log('standalone inline scripts ok');"
npm run build
```

Verifiche browser:

- `/immagini/`: `mix-blend-mode` risulta applicato al box esterno e demo con sovrapposizioni reali.
- `/image-canvas-editor/`: carica, mostra demo, nessun errore console.
- Controlli testati: opacita, fusione, nascondi/mostra, blocca/sblocca, vista pubblica.
- Pannello Movimento portabile: checkbox parallasse abilita il layer selezionato, `ArrowRight` porta camera X da `0` a `32`, il transform del box si sposta a sinistra, `Reset` riporta camera e transform al valore iniziale.
- Pannello Movimento integrato `/immagini/`: stessa verifica con layer demo a profondita `0.25`; camera X `32` sposta il layer di `8px`, poi `Reset` ripristina.
- Percorso/mini timeline portabile: demo fresca con 8 immagini; primo layer con `pathMotion` attivo e `3 punti`; `Aggiungi punto` porta il conteggio a `4 punti`; il transform cambia durante la riproduzione; `Pausa` disattiva il path e cambia il bottone in `Play`.
- Percorso/mini timeline integrata `/immagini/`: stessa verifica; overlay `.image-board-path-overlay` visibile in editor, conteggio da `3 punti` a `4 punti`, status layer aggiornato con `percorso 4 pt`.
- Vista pubblica con path portabile e integrata: overlay percorso rimosso (`0` overlay), toolbar e pannello Movimento nascosti via CSS.
- Drag pubblico portabile: demo fresca con 8 immagini e 6 layer trascinabili; in `Vista pubblica` il drag su layer `data-public-drag="true"` sposta il box, poi dopo 450ms l'inerzia continua il movimento; URL invariato, quindi il link non si apre per errore.
- Drag pubblico integrato `/immagini/`: demo fresca con 8 immagini e 6 layer trascinabili; in `Vista pubblica` il drag su `data-public-drag-enabled="true"` sposta il box, poi dopo 450ms l'inerzia continua il movimento; URL invariato.
- Vista pubblica integrata e portabile: toolbar, pannello livelli, pannello Movimento e maniglie vengono nascosti; il bottone `Editor` ripristina la modalita editor.
- Layout visuale portabile su viewport `1280x720`: il pannello Movimento sta in basso senza sovrapporsi a toolbar o pannello livelli.
- JSON reale `canvas-immagini(5).json`: immagini caricate, nessun errore console, click nel margine trasparente della PNG grande seleziona l'immagine visibile sotto; click su pixel opaco seleziona la PNG grande.
- Multi-selezione portabile: `Shift`+click seleziona 2 immagini, `Mouse sopra` applicato a entrambe, `Cmd/Ctrl+A` seleziona tutte, `Delete` cancella tutte.
- Sfondo e centratura, integrato e portabile: pannello `Sfondo` apre correttamente, gradiente+carta vengono applicati, griglia editor disattivata sparisce dal CSS, `Sposta tutto` seleziona i layer, `Centra tutto` sposta la composizione, export HTML pubblico contiene sfondo/carta ma non il layer griglia.

## Rischi e limiti

- Il salvataggio e locale al browser/dominio. Per trasferire il lavoro usare `Esporta JSON`.
- JSON con molte immagini grandi puo diventare pesante.
- `Esporta HTML pubblico` genera una pagina statica finale; non la carica automaticamente sul server.
- I link interni funzionano solo se quelle route esistono nel sito dove viene ospitata la pagina.
