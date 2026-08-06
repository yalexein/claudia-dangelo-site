---
name: claudia-web-mockup-preview
description: Crea, pubblica e verifica mockup HTML del Sito web di Claudia sul tunnel Cloudflare canonico prima della scelta e dello sviluppo definitivo.
---

# Claudia Web Mockup Preview

Usare questa skill ogni volta che l’utente chiede mockup, proposte, alternative di layout o prototipi per una pagina del Sito web di Claudia.

## Percorsi e servizi

Progetto canonico:
`/Users/yalexein/.devspace/worktrees/Sito-Web-Claudia-4f797b38`

Directory statica servita dall’anteprima pubblica:
`/Users/yalexein/.devspace/worktrees/Sito-Web-Claudia-4f797b38/dist`

Il checkout `/Users/yalexein/Desktop/Sito Web Claudia` è soltanto un rollback storico e non deve ricevere sincronizzazioni.

Dominio:
`https://claudia-preview.alessandroguardascione.com/`

Origine locale:
`http://127.0.0.1:4322`

Il prototipo `/Users/yalexein/Desktop/Sito web di Claudia` sulla porta `8765` non è l’origine del dominio `claudia-preview`.

## Procedura obbligatoria

1. Aprire il progetto canonico e leggere `AGENTS.md`.
2. Ispezionare le pagine pertinenti già realizzate per ricavare palette, tipografia, navigazione e tono visivo.
3. Creare una serie autonoma sotto un percorso stabile come `/<pagina>-mockups/`.
4. La serie deve contenere un `index.html`, una pagina HTML per ogni variante e gli asset condivisi.
5. Ogni proposta deve essere una vera pagina web navigabile e responsive, non un’immagine statica.
6. Non integrare le proposte nelle route canoniche prima della scelta dell’utente.
7. Eseguire `npm run check` e `npm run build` nella root canonica; il servizio sulla porta `4322` legge direttamente quel `dist/`.
8. Non fermare o riconfigurare tunnel e processi preesistenti. Riavviare il solo processo Node pubblico esclusivamente quando necessario e autorizzato.
9. Verificare tramite HTTPS:
   - l’indice della serie;
   - almeno una variante;
   - almeno una risorsa CSS o JavaScript.
10. Tutte le verifiche devono restituire HTTP 200 prima della consegna.
11. Fornire sempre il link HTTPS completo all’indice.
12. Dopo la scelta, implementare la pagina definitiva nel progetto canonico e seguire build e QA ordinari.

## Criterio di completamento

Un lavoro di mockup non è completato finché le pagine non sono raggiungibili dal dominio Cloudflare. Un percorso locale, un server diverso o una cartella omonima non costituiscono pubblicazione valida.
