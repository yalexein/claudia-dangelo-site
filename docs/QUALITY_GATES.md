# Quality gates

## Gate rapido

`npm run check`

Deve superare:

- sintassi Zsh e JavaScript;
- test unitari di autenticazione e sanitizzazione;
- build Astro completa.

## Gate server

`npm run test:integration`

Deve verificare in un processo isolato:

- health endpoint;
- Home e Collage;
- editor locale;
- salvataggio e rilettura di una configurazione runtime;
- upload e servizio di un asset immagine;
- ricostruzione finale di `dist/`.

## Gate browser

Dopo `npm run playwright:install`, eseguire `npm run test:e2e`.

La suite deve passare almeno su Chromium desktop e su un viewport Android mobile. Controlla:

- collegamento reale Home → Collage;
- 24 opere nella pagina Collage;
- caricamento dell’editor Collage;
- 66 opzioni nella selezione rapida;
- tre profili responsive;
- stato iniziale salvato.

## Gate live

`npm run verify:live`

Verifica tramite HTTPS che Home e Collage rispondano, che l’editor resti nascosto senza sessione e che bootstrap, interfaccia e API funzionino con una sessione temporanea letta dal Portachiavi. Il comando non stampa né salva il token.

## Gate manuale

Per modifiche visuali aprire e ispezionare realmente:

- Home;
- pagina modificata;
- editor sulla pagina modificata;
- desktop, tablet e mobile;
- console del browser e richieste fallite.

Per modifiche a processi o deploy verificare inoltre:

- porte 4322 e 4324 in ascolto;
- `/api/health` su entrambe le origini;
- URL HTTPS pubblici con stato 200;
- PID Cloudflare invariati;
- working directory dei processi Node uguale alla root canonica.

## Criterio di chiusura

Una modifica non è conclusa quando “sembra funzionare” nel codice. È conclusa soltanto quando i gate pertinenti sono passati e gli eventuali limiti residui sono dichiarati.
