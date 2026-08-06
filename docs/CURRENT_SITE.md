# Sito Claudia corrente

## Sorgente canonica

La sola sorgente di sviluppo e di anteprima è:

`/Users/yalexein/.devspace/worktrees/Sito-Web-Claudia-4f797b38`

Il checkout `/Users/yalexein/Desktop/Sito Web Claudia` è conservato come rollback storico e non deve ricevere sincronizzazioni manuali. Il prototipo `/Users/yalexein/Desktop/Sito web di Claudia` resta separato.

## Superfici pubbliche

- Home: `/`
- Bio: `/bio/`
- Contatti e guestbook: `/contatti/`
- Uccelli: `/uccelli/`
- Miscellanea: `/miscellanea/`
- CV: `/cv/`
- Collage: `/collage/`
- Scritture: `/scritture-esplorazioni/g1-revisione.html` e pagine interne

La build Astro genera inoltre le route sperimentali già presenti nel repository; una route generata non diventa automaticamente parte della navigazione canonica.

## Editor protetto

L’editor è servito a `/__editor/` e gestisce undici superfici:

1. Contatti
2. Bio
3. Uccelli
4. Miscellanea
5. CV
6. Collage
7. Scritture — prima pagina
8. Scritture — Libri
9. Scritture — Racconti
10. Scritture — Articoli
11. Scritture — Blog

L’interfaccia è suddivisa in:

- `tools/contact-editor/editor-registry.js`: pagine, profili responsive e palette predefinite;
- `tools/contact-editor/editor-api.js`: caricamento, salvataggio e upload asset;
- `tools/contact-editor/editor.js`: selezione, anteprima e controlli visuali.

Il server è suddiviso in:

- `scripts/lib/editor-registry.mjs`: registro e sanitizzazione;
- `scripts/lib/editor-auth.mjs`: sessioni firmate e controllo origine;
- `scripts/lib/editor-storage.mjs`: stato runtime, backup e asset;
- `scripts/lib/http-utils.mjs`: parsing e intestazioni HTTP;
- `scripts/public-preview-server.mjs`: routing, guestbook e file statici.

## Stato e asset runtime

I JSON sotto `public/*-customization.json` sono default versionati. Lo stato modificabile viene salvato fuori dal repository:

`~/Library/Application Support/ClaudiaSite/editor-config/`

Gli asset caricati dall’editor vengono salvati in:

`~/Library/Application Support/ClaudiaSite/editor-assets/`

Il server pubblica questi asset sotto `/uploads/editor/`. I file immagine non vengono incorporati come Base64 nei JSON.

## Sicurezza editor

- dominio dedicato: `claudia-editor.alessandroguardascione.com`;
- token conservato nel Portachiavi macOS con servizio `claudia-editor-token`;
- token usato una sola volta per creare una sessione firmata;
- cookie `HttpOnly`, `Secure`, `SameSite=Strict`, con scadenza;
- mutazioni ammesse soltanto dalla stessa origine;
- editor non autorizzato nascosto con risposta `404`;
- CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY` e `noindex`.

## Servizi

- porta `4322`: sito pubblico;
- porta `4324`: editor protetto;
- tunnel pubblico: `https://claudia-preview.alessandroguardascione.com`;
- tunnel editor: `https://claudia-editor.alessandroguardascione.com`.

I LaunchAgent invocano `scripts/launch-preview-service.sh public|editor` dalla root canonica. I processi Cloudflare sono separati e non devono essere riavviati durante aggiornamenti ordinari del server Node.

## Comandi

```bash
npm ci
npm run check
npm run test:integration
npm run playwright:install
npm run test:e2e
npm run verify
```

Per avviare manualmente il server pubblico:

```bash
PUBLIC_PREVIEW_PORT=4322 npm run preview:public
```

La checklist completa è in `docs/QUALITY_GATES.md`; deploy e rollback sono descritti in `docs/DEPLOYMENT.md`; il modello di sicurezza è descritto in `docs/SECURITY.md`.
