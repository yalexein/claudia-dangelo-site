# Canvas immagini portabile

Questa cartella contiene una versione self-contained dell'editor immagini:

- `index.html` contiene HTML, CSS e JavaScript dell'app.
- `image-canvas-core.js` contiene regole pure condivise per effetti, trigger, opacita, link e sfondo.
- `public-page-exporter.js` genera l'HTML pubblico finale self-contained.
- Non dipende da Astro, dall'editor Claudia, da `shared-advanced-editor.js` o da API server.
- Salva il layout nel `localStorage` del browser e gli asset immagine grandi in `IndexedDB`.
- Permette import/export JSON per spostare il layout da un computer o dominio all'altro.
- Permette di esportare una pagina HTML pubblica senza editor, marker o maniglie.

## Uso standalone

Apri direttamente `index.html` nel browser.

Funziona per:

- importare PNG/JPG;
- importare piu immagini e tenerle selezionate insieme;
- importare una sequenza PNG/JPG come sprite animato;
- scontornare JPEG/PNG con finta scacchiera o sfondo colorato uniforme;
- selezionare piu immagini con `Shift`/`Cmd`/`Ctrl` + click;
- selezionare tutte le immagini con `Cmd`/`Ctrl` + `A`;
- usare `Sposta tutto` per selezionare tutti i layer e trascinare la composizione;
- usare `Centra tutto` per portare la composizione al centro della pagina;
- spostare immagini;
- ridimensionare mantenendo le proporzioni;
- ruotare;
- cambiare layer/z-index;
- impostare opacita, fusione, visibilita e blocco;
- usare hover, click e maniglie sull'area visibile anche quando una PNG ha margini trasparenti;
- cliccare attraverso i pixel trasparenti di una PNG verso immagini visibili sotto;
- animare immagini con preset di movimento, velocita e ampiezza;
- costruire percorsi/keyframe con una mini timeline per immagine;
- usare parallasse per singola immagine e muovere la camera con le frecce;
- rendere singole immagini trascinabili in `Vista pubblica`, con inerzia;
- controllare sprite con pannello `Sprite`: play/pausa, FPS, loop, avanti/ping-pong e frame manuale;
- usare il menu tasto destro per azioni rapide su immagine o selezione;
- assegnare link per immagine;
- impostare sfondo con colore, gradiente, punti gradiente, carta ruvida e griglia solo-editor;
- passare a vista pubblica;
- rendere toolbar, livelli, movimento, sprite e sfondo trasparenti, scalabili, collassabili, ridimensionabili e spostabili;
- esportare e importare il JSON del layout;
- esportare un HTML pubblico self-contained con effetti e link.

## Salvataggio e cronologia

Il layout viene salvato automaticamente in `localStorage`; quando PNG/JPG o frame sprite sono grandi, l'editor li mette in `IndexedDB` e nel layout conserva solo un riferimento locale. Questo evita errori di quota del browser.

Anche `Annulla` / `Ripeti` usa riferimenti leggeri agli asset: la stessa immagine non viene duplicata decine di volte nella cronologia mentre sposti, ridimensioni o modifichi layer e sprite.

## Link per immagine

1. Selezionare un'immagine nel canvas o nel pannello `Livelli`.
2. Usare il campo `Link` per scrivere il percorso.
3. In alternativa usare il menu `Pagine`, che compila il campo `Link` con una pagina gia nota.
4. Entrare in `Vista pubblica`.
5. Cliccare l'immagine: parte l'effetto click, poi il browser apre il link impostato.

Formati validi:

- `/bio/` per una pagina interna;
- `bio/` viene trasformato in `/bio/`;
- `#sezione` resta un link alla sezione della pagina corrente;
- `https://esempio.it/pagina` apre un URL esterno.

Per cambiare le pagine proposte nel menu `Pagine`, modificare l'array `siteLinks` dentro `index.html`.

## File condivisi

`image-canvas-core.js` e un piccolo core senza DOM. Normalizza valori come hover, click, fusione, opacita, link, trigger layer e sfondo canvas. Viene usato dalla portabile, dalla pagina `/immagini/` integrata e dall'exporter.

La pagina HTML pubblica esportata resta comunque indipendente: al momento dell'export l'editor usa il core per pulire i dati, poi scrive dentro il file finale tutto il runtime necessario.

## Esportare una pagina pubblica finale

Usare `Esporta HTML pubblico` per creare un file `canvas-immagini-pubblica.html`.

Quel file e una pagina web finale:

- contiene le immagini come data URL;
- non contiene toolbar, pannelli, marker, livelli o maniglie;
- non contiene la griglia editor;
- mantiene lo sfondo scelto: colore, gradiente e carta ruvida;
- mantiene hover, click, opacita, fusione, movimento, percorsi, sprite animati, parallasse, drag pubblico e link;
- usa il trim e l'hit-test alpha, quindi i pixel trasparenti delle PNG non bloccano immagini vicine o sotto;
- puo essere aperto direttamente nel browser oppure messo dentro un server statico.

Per integrarlo nel server Claudia, copiare l'HTML esportato dentro una route/pagina statica del sito oppure usarlo come base per una pagina Astro dedicata. I link interni come `/bio/` o `/collages/` funzionano se quelle route esistono nel server dove viene ospitata la pagina.

## Multi-selezione

Usare `Shift`/`Cmd`/`Ctrl` + click su immagini o righe del pannello `Livelli` per aggiungere o togliere immagini dalla selezione. Con piu immagini selezionate, i controlli `Mouse sopra`, `Click`, `Link`, `Fusione`, `Opacita`, visibilita e blocco vengono applicati a tutte.

Scorciatoie:

- `Cmd`/`Ctrl` + `A`: seleziona tutte le immagini;
- `Delete`/`Backspace`: elimina tutte le immagini selezionate.

Il bottone `Sposta tutto` seleziona tutti i layer: dopo averlo premuto, trascina una immagine selezionata per muovere insieme la composizione. Il bottone `Centra tutto` calcola l'ingombro visibile dei layer e lo porta al centro del viewport, spostando anche i punti percorso collegati.

## Sprite animati

Il bottone `Importa Sprite` crea una singola immagine/layer partendo da piu file PNG/JPG ordinati per nome. Usa nomi progressivi come `personaggio-01.png`, `personaggio-02.png`, `personaggio-03.png` per avere l'ordine giusto.

Lo sprite resta una normale immagine del canvas: si puo spostare, ridimensionare, ruotare, mettere su layer diversi, assegnare link, opacita, fusione, hover, click, movimento, percorsi, parallasse e drag pubblico.

Il pannello `Sprite` controlla lo sprite selezionato:

- `Play` / `Pausa`: avvia o ferma la sequenza.
- `FPS`: velocita da 1 a 30 frame al secondo.
- `Loop`: ripete o si ferma all'ultimo frame.
- `Modo`: `Avanti` oppure `Ping-pong`.
- `Sync movimento`: collega i frame alla distanza percorsa nel canvas.
- `Frame`: selezione manuale del frame.
- `Indietro` / `Avanti`: scorre i frame senza riavviare l'animazione.
- `Uniforma frame`: mette tutti i frame nella stessa area per evitare salti.
- `Onion skin`: mostra frame precedente e successivo nell'editor.
- Mini timeline: clic su una miniatura per fermare lo sprite su quel frame.

Con piu sprite selezionati, `FPS`, `Loop`, `Modo`, `Sync movimento`, `Onion skin`, `Opacita onion` e `Uniforma frame` vengono applicati a tutti gli sprite selezionati. Il frame manuale lavora sullo sprite attivo.

L'export JSON salva i frame dentro `sprite.frames`; l'HTML pubblico esportato anima gli sprite senza editor, marker o pannelli.

## Trigger layer

Nel pannello `Movimento`, sezione `Trigger`, ogni layer puo:

- apparire subito, dopo alcuni secondi, con un tasto, dopo click o dopo un altro layer;
- restare visibile ma avviare movimento/sprite solo quando il trigger scatta;
- sincronizzare sprite di cammino e movimento tramite `Sync movimento`.

`Azione: Mostra layer` nasconde il layer finche la condizione non scatta. `Azione: Avvia animazione` lascia il layer visibile ma ferma movimento, percorso e sprite fino al trigger.

## Scontorno immagini

Il bottone `Scontorna` apre un pannello per trasformare sfondi finti in trasparenza reale. Funziona localmente nel browser su JPEG/PNG con:

- scacchiera finta tipo PNG esportato male;
- sfondo colorato uniforme;
- bordi con 1-2 colori dominanti.

Il pannello campiona automaticamente i colori di fondo dai bordi dell'immagine. `Tolleranza` decide quanto fondo rimuovere, `Sfumatura` ammorbidisce la maschera, `Bordo` contrae o espande il taglio. `Ritaglia risultato` taglia il canvas attorno alla sagoma opaca; `Margine` conserva spazio attorno al soggetto. `Applica` riscrive l'immagine come PNG trasparente; `Ripristina` torna alla versione originale finche l'originale e ancora salvato nel layout.

## Sfondo canvas

Il bottone `Sfondo` apre un pannello dedicato.

- `Base`: colore pieno di fondo.
- `Griglia editor`: mostra/nasconde la griglia solo mentre si lavora. La griglia non viene esportata nell'HTML pubblico.
- `Gradiente`: abilita un gradiente lineare o radiale.
- `Angolo`: direzione del gradiente lineare.
- `P1`, `P2`, `P3`: punti gradiente con colore e posizione percentuale.
- `Carta ruvida`: aggiunge una texture procedurale tipo carta.
- `Intensita`: forza della texture.
- `Scala`: dimensione/frequenza della fibra.
- `Reset sfondo`: torna allo sfondo chiaro standard.

Lo sfondo viene salvato nel JSON esportato dentro `background`, quindi puo essere importato su un altro computer e viene incluso anche nell'HTML pubblico self-contained.

## Pannelli editor

Toolbar, `Livelli`, `Movimento`, `Sprite` e `Sfondo` hanno una mini barra di controllo propria.

- `↕`: trascina il pannello dove vuoi nel canvas.
- `+` / `-`: collassa o riapre il pannello.
- `Op`: regola la trasparenza del pannello.
- `Size`: riduce o aumenta la scala dei controlli, incluso il testo.
- Bordo inferiore: ridimensiona l'altezza del pannello.
- Angolo in basso a destra: ridimensiona larghezza e altezza del pannello.

Le impostazioni vengono salvate nel browser in `localStorage` con la chiave `portable-image-canvas-panels-v1`. Non entrano nel JSON esportato del canvas: il JSON resta dedicato alle immagini e ai loro effetti.

## Menu tasto destro

Click destro su un'immagine apre un menu contestuale collegato alla selezione corrente. Se piu immagini sono selezionate, le azioni valgono per tutte.

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

`Copia stile` salva hover, click, link, opacita e fusione dell'immagine attiva. `Incolla stile` applica quei valori alla selezione corrente.

## Pannello Movimento

Il bottone `Movimento` nella toolbar apre un pannello dedicato, separato dai controlli principali. Il pannello parte chiuso per non coprire `Livelli` sui viewport stretti. Il pannello contiene:

- animazione per singola immagine;
- percorso/keyframe per singola immagine;
- parallasse per singola immagine;
- drag pubblico per singola immagine;
- lettura e reset della camera.

### Animazione immagine

La sezione `Animazione` aggiunge animazioni leggere per ogni immagine:

- `Fermo`;
- `Fluttua`;
- `Onda X`;
- `Onda Y`;
- `Orbita`;
- `Dondola`;
- `Scorre`.

`Velocita` controlla quanto rapidamente gira il loop. `Ampiezza` controlla la distanza dello spostamento, o l'intensita della rotazione nel preset `Dondola`.

Le animazioni funzionano anche in `Vista pubblica`. Il click/hover usa la posizione animata, quindi l'immagine resta cliccabile dove viene vista.

### Percorsi e mini timeline

La sezione `Percorso` permette di registrare punti di movimento per una o piu immagini selezionate.

Flusso consigliato:

1. Selezionare una o piu immagini.
2. Portare l'immagine nella posizione iniziale e premere `Aggiungi punto`.
3. Spostare l'immagine nella posizione successiva e premere ancora `Aggiungi punto`.
4. Ripetere fino a un massimo di 12 punti.
5. Attivare `Attiva` o premere `Play`.
6. Regolare `Durata`.

L'animazione va avanti e indietro tra i punti, quindi non scatta dall'ultimo punto al primo. In editor, i punti vengono mostrati con una linea numerata sulle immagini selezionate. In `Vista pubblica` la linea sparisce e resta solo il movimento.

`Pulisci` cancella i punti e mette il percorso in pausa. `Copia movimento` / `Incolla movimento` copia anche il percorso, non solo il preset `Animazione`.

### Parallasse e camera

La sezione `Parallasse` permette di attivare la risposta alla camera per ogni immagine.

- `Attiva`: abilita/disabilita la parallasse sul layer selezionato.
- `Profondita`: controlla quanto quel layer reagisce alla camera.
- Valori bassi sembrano piu lontani, valori alti sembrano piu vicini.

Con almeno un'immagine con parallasse attiva, le frecce tastiera muovono la camera:

- `Freccia destra`: la camera va a destra e i layer scorrono a sinistra;
- `Freccia sinistra`: movimento opposto;
- `Freccia su/giu`: movimento verticale;
- `Shift` + freccia: passo piu grande;
- `Reset`: riporta la camera a `X 0`, `Y 0`.

La posizione camera non viene salvata nel JSON: e una preview/runtime. Ogni immagine salva invece la propria impostazione `parallax`, quindi il layout resta riusabile.

### Drag pubblico con inerzia

La sezione `Drag pubblico` decide se una immagine puo essere trascinata dall'utente quando la pagina e in `Vista pubblica`.

- `Trascinabile`: abilita/disabilita il drag pubblico per il layer selezionato.
- `Inerzia`: controlla quanto l'immagine continua a scorrere dopo il rilascio.

Il drag pubblico usa lo stesso hit-test alpha del click: una PNG viene presa solo sui pixel visibili, non sul rettangolo trasparente del file.

Le posizioni mosse dal visitatore non vengono salvate nel JSON. Il JSON salva solo:

```json
{
  "publicDrag": {
    "enabled": true,
    "inertia": 0.9
  }
}
```

Se un'immagine ha anche un link, un click breve apre il link. Se invece viene trascinata, il click finale viene ignorato per non aprire la pagina per errore.

## Uso dentro il server Claudia

Metodo consigliato, senza toccare l'editor gia modificato:

1. Copiare tutta la cartella `image-canvas-editor` dentro `public/` del sito Claudia.
2. Eseguire `npm run build`.
3. Avviare il server con `npm run editor:server`.
4. Aprire `/image-canvas-editor/`.

Se in sviluppo la cartella non viene risolta come pagina, aprire `/image-canvas-editor/index.html`.

Questo crea una pagina indipendente, quindi non entra in conflitto con `/immagini/` o con gli altri file dell'editor Claudia.

## Uso diretto dentro `dist`

Se non si vuole ricostruire il sito:

1. Copiare la cartella `image-canvas-editor` dentro `dist/`.
2. Avviare `npm run editor:server`.
3. Aprire `/image-canvas-editor/`.

## Pubblicare il lavoro finale

Per consegnare una composizione:

1. Nell'editor integrato `/immagini/`, fare `Esporta pacchetto`.
2. Conservare il file `canvas-immagini-package.json`.
3. Su un altro browser o server, aprire la stessa pagina e fare `Importa pacchetto/JSON`.

Nota: il salvataggio locale tiene i metadati in `localStorage` e sposta PNG/JPG, frame sprite, gallerie e sfondi caricati in `IndexedDB` quando sono inline. Il pacchetto esportato include invece un `manifest` leggero e una sezione `assets[]` per trasportare gli asset pesanti senza dipendere dal browser originale.

## PNG con margini trasparenti

L'editor calcola automaticamente l'area non trasparente delle PNG e salva il dato `trim` nel JSON. Le maniglie usano quell'area visibile, non tutto il rettangolo trasparente del file originale.

Per hover e click viene usata anche una maschera alpha in memoria: se il pixel sotto il mouse e trasparente, quell'immagine viene ignorata e il click puo raggiungere un'immagine piu piccola sotto o vicina.
