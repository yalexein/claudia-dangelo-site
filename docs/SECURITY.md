# Sicurezza del sito e dell’editor

## Confini di fiducia

Il sito pubblico è leggibile senza autenticazione. L’editor, le API di configurazione e l’upload degli asset sono superfici riservate e vengono esposte soltanto sul dominio editor dedicato o su loopback locale.

## Token e sessioni

Il token principale non deve comparire in repository, plist, log o cookie. Su macOS è conservato nel Portachiavi con:

- account: utente macOS corrente;
- servizio: `claudia-editor-token`.

`launch-preview-service.sh editor` legge il token al momento dell’avvio. Il parametro `access` viene accettato una sola volta e sostituito da un cookie di sessione firmato che non contiene il token. Il parametro viene rimosso immediatamente dall’URL.

## Protezione delle mutazioni

Le richieste `POST`, `PUT`, `PATCH` e `DELETE` alle route protette richiedono:

- sessione valida, salvo accesso loopback;
- `Origin` corrispondente al dominio editor;
- assenza di `Sec-Fetch-Site: cross-site`.

Le route protette restituiscono `404` quando manca l’autorizzazione, così non rivelano l’interfaccia.

## Sanitizzazione

La configurazione accetta soltanto:

- selettori dell’editor esplicitamente ammessi;
- tre scope responsive: `base`, `tablet`, `mobile`;
- proprietà CSS in whitelist;
- variabili CSS in whitelist;
- URL immagine HTTPS o root-relative;
- URL Google Fonts dal dominio ufficiale previsto.

I valori contenenti delimitatori CSS pericolosi vengono scartati. Le immagini `data:` non vengono salvate.

## Asset

Gli upload accettano PNG, JPEG, WebP e GIF fino a 5 MB sul server, con limite UI di 2 MB. Il server ignora il nome originale, genera un identificatore casuale e salva fuori dal repository. Gli asset sono serviti da una route virtuale con percorso normalizzato.

## Intestazioni

L’editor usa CSP restrittiva, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` e `X-Robots-Tag`.

## Operazioni vietate

- inserire il token in un comando versionato o in un plist;
- committare credenziali Cloudflare o cookie;
- permettere URL `javascript:` o immagini Base64 nella configurazione;
- rendere pubblica la porta editor sullo stesso host del sito;
- disattivare i controlli di origine per risolvere problemi UI.
