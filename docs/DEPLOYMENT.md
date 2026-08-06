# Deploy locale e rollback

## Architettura

I tunnel Cloudflare puntano alle origini loopback:

- `127.0.0.1:4322` — sito pubblico;
- `127.0.0.1:4324` — editor protetto.

I due processi Node leggono direttamente la build `dist/` della root canonica. I tunnel sono indipendenti dai processi Node e non devono essere riavviati per pubblicare una nuova build.

## Pubblicazione ordinaria

1. Aprire la root canonica.
2. Eseguire `npm ci` quando cambia il lockfile.
3. Eseguire `npm run verify`.
4. Riavviare soltanto i LaunchAgent Node:
   - `com.claudia.public-preview`;
   - `com.claudia.editor-preview-server`.
5. Verificare `/api/health`, Home, Collage ed editor tramite HTTPS.
6. Controllare che i PID Cloudflare siano rimasti invariati.

## Portachiavi

Il token deve esistere prima dell’avvio dell’editor:

```bash
security find-generic-password -a "$USER" -s claudia-editor-token -w >/dev/null
```

Per ruotarlo, aggiornare il valore nel Portachiavi e riavviare soltanto il LaunchAgent editor. Le sessioni precedenti diventano invalide perché la firma dipende dal token corrente.

## Dati runtime

Il percorso predefinito dei dati è:

`~/Library/Application Support/ClaudiaSite`

Al primo avvio il server può importare `guestbook.json` e i backup dell’editor dalla vecchia directory indicata da `PUBLIC_PREVIEW_LEGACY_DATA_DIR`, senza sovrascrivere dati già migrati.

## Rollback

La copia storica in `/Users/yalexein/Desktop/Sito Web Claudia` non è una seconda sorgente da mantenere sincronizzata. Può essere usata soltanto come rollback d’emergenza:

1. non modificare i tunnel;
2. ripristinare temporaneamente il `WorkingDirectory` dei due LaunchAgent;
3. riavviare i soli processi Node;
4. verificare gli URL pubblici;
5. correggere la root canonica e riportare i servizi su di essa.

Non cancellare la root canonica, i dati in Application Support o i backup durante un rollback.
