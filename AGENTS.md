# Sito Claudia — istruzioni operative

## Progetto canonico

Questa cartella è il progetto pulito e canonico del sito attuale di Claudia.

Percorso corrente:
`/Users/yalexein/.devspace/worktrees/Sito-Web-Claudia-4f797b38`

Il checkout precedente è conservato soltanto come copia di rollback:
`/Users/yalexein/Desktop/Sito Web Claudia`

I servizi pubblici devono essere avviati dalla root canonica. Non sincronizzare manualmente codice o `dist/` verso il checkout precedente.

Non confondere questi percorsi con il prototipo sperimentale:
`/Users/yalexein/Desktop/Sito web di Claudia`

Il prototipo contiene proposte di layout isolate e non è la sorgente canonica del sito.

## Ambito del sito attuale

Le superfici canoniche sono:

- Home: `src/pages/index.astro`, `src/styles/home-collage.css`, `public/home-collage-runtime.js`, `src/data/home-collage.json`.
- Bio: `src/pages/bio/index.astro`, `src/layouts/BioLayout.astro`, `src/styles/bio.css`.
- Contatti: `src/pages/contatti/index.astro`, `src/styles/contatti.css`.
- Uccelli: `src/pages/uccelli/index.astro`, `src/styles/uccelli-public.css`.
- Miscellanea: `src/pages/miscellanea/index.astro`, `src/styles/miscellanea.css`.
- CV: `src/pages/cv/index.astro`, `src/styles/cv.css`, `public/cv-customization.json`.
- Collage: `src/pages/collage/index.astro`, `src/data/collage-images.json`, `public/collage-poster-mockups/`.
- Scritture — pagina pubblica ufficiale: `public/scritture-esplorazioni/g1-revisione.html`, collegata dalla tessera Scritture della Home; pagine interne nella stessa cartella.
- Editor nero: `tools/contact-editor/`, `public/contact-customizer.js`, `scripts/public-preview-server.mjs`.

Le pagine `uccelli-proposte` e gli altri mockup sperimentali non fanno parte del progetto canonico, salvo richiesta esplicita.

## Editor nero

L’editor gestisce undici superfici:

- Contatti
- Bio
- Uccelli
- Miscellanea
- CV
- Collage
- Scritture — prima pagina
- Scritture — Libri
- Scritture — Racconti
- Scritture — Articoli
- Scritture — Blog

I file di stato dell’editor sono:

- `public/contact-customization.json`
- `public/bio-customization.json`
- `public/uccelli-customization.json`
- `public/miscellanea-customization.json`
- `public/cv-customization.json`
- `public/collage-customization.json`
- `public/scritture-home-customization.json`
- `public/scritture-libri-customization.json`
- `public/scritture-racconti-customization.json`
- `public/scritture-articoli-customization.json`
- `public/scritture-blog-customization.json`

Questi file sono configurazioni predefinite versionate. Le modifiche effettuate nell’editor vengono salvate fuori dal repository in `~/Library/Application Support/ClaudiaSite/editor-config/`; il server le serve in precedenza rispetto ai default e ne conserva backup limitati. Gli asset caricati dall’editor sono salvati in `~/Library/Application Support/ClaudiaSite/editor-assets/`, mai come Base64 nei JSON.

La route dell’editor è `/__editor/`. L’accesso remoto usa host dedicato, token conservato nel Portachiavi macOS e cookie di sessione firmato. Ogni mutazione richiede la stessa origine. Non inserire token, credenziali Cloudflare, cookie o plist con segreti nel repository.

## Build e verifica

Comandi canonici:

- Installazione riproducibile: `npm ci`
- Controlli rapidi: `npm run check`
- Test completi locali: `npm run verify`
- Build: `npm run build`
- Anteprima con API e editor: `npm run preview:public`

Prima di dichiarare conclusa una modifica:

1. eseguire `npm run check`;
2. eseguire `npm run test:integration` quando cambia server, storage o API;
3. eseguire `npm run test:e2e` quando cambia una superficie pubblica o l’editor;
4. verificare Home, Bio, Contatti, Uccelli, Miscellanea, CV, Collage e Scritture;
5. verificare desktop, tablet e mobile per modifiche responsive;
6. verificare che l’editor carichi e salvi la pagina interessata senza introdurre dati Base64.

## Servizi e porte

Servizi avviati dalla root canonica tramite `scripts/launch-preview-service.sh`:

- anteprima pubblica locale: porta `4322`;
- editor protetto locale: porta `4324`;
- anteprima pubblica: `https://claudia-preview.alessandroguardascione.com`;
- editor protetto: `https://claudia-editor.alessandroguardascione.com`.

Tunnel Cloudflare dedicati:

- `claudia-preview` per il sito;
- `claudia-editor-preview` per l’editor.

Non fermare, riavviare o riconfigurare servizi e tunnel già attivi senza una richiesta esplicita. Per test paralleli usare porte e nomi distinti.

## Sicurezza e dati locali

Non committare:

- token dell’editor;
- credenziali Cloudflare;
- file `.env` reali;
- plist contenenti segreti;
- `node_modules`, `dist`, `.astro`, log, cache Playwright, backup o file temporanei;
- dati sotto `~/Library/Application Support/ClaudiaSite/` e stati editor locali non destinati al controllo versione.

Non cancellare backup, stato editor o dati del guestbook durante operazioni di pulizia.

## Mockup web e pubblicazione preventiva

Quando l’utente chiede mockup, proposte o alternative di layout per una nuova pagina:

1. creare vere pagine HTML navigabili, non soltanto immagini;
2. raccoglierle in un percorso stabile `/<nome-pagina>-mockups/` con un indice comparativo;
3. mantenere i mockup separati dalle route canoniche del sito finché l’utente non sceglie una proposta;
4. pubblicare sempre i mockup sull’anteprima Cloudflare esistente `https://claudia-preview.alessandroguardascione.com/` prima di dichiarare il lavoro concluso;
5. eseguire la build nella root canonica; il servizio sulla porta `4322` legge direttamente il suo `dist/`;
6. verificare via HTTPS l’indice, almeno una variante e il CSS, tutti con stato HTTP 200;
7. fornire nella risposta finale il link HTTPS completo e cliccabile;
8. integrare la pagina definitiva nel progetto canonico soltanto dopo la scelta esplicita dell’utente.

Non usare `/Users/yalexein/Desktop/Sito web di Claudia` come destinazione del tunnel `claudia-preview`: quella cartella è un prototipo separato servito sulla porta `8765`.
