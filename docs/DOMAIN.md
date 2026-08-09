# Dominio custom (Cloudflare DNS → GitHub Pages)

Dominio: `claudia-dangelo.com`

## Registrar e nameserver

Il dominio resta registrato presso WordPress.com, ma la zona DNS canonica è su Cloudflare.

Nameserver da impostare nel pannello WordPress.com:

- `lilith.ns.cloudflare.com`
- `vern.ns.cloudflare.com`

Non copiare token, credenziali Cloudflare o file di configurazione con segreti nel repository.

## DNS (su Cloudflare)

Per puntare a GitHub Pages:

- `A` record per `@` → `185.199.108.153`
- `A` record per `@` → `185.199.109.153`
- `A` record per `@` → `185.199.110.153`
- `A` record per `@` → `185.199.111.153`
- `CNAME` per `www` → `clahoudini.github.io`

Durante il passaggio iniziale i record GitHub Pages devono restare in modalità **DNS only**. La proxy Cloudflare può essere valutata solo dopo che dominio principale, `www` e certificati risultano tutti corretti.

Conservare senza modifiche i record email esistenti (SPF, DMARC e DKIM) e i record Domain Connect di WordPress.

## GitHub

Repository canonico: `https://github.com/clahoudini/claudia-dangelo-site`

1) Repo → `Settings` → `Pages`
2) `Source`: `GitHub Actions`
3) `Custom domain`: `claudia-dangelo.com`
4) `Enforce HTTPS`: deve restare attivo dopo la propagazione DNS e l'emissione dei certificati per dominio principale e `www`

Verificare anche il dominio nell'account GitHub `clahoudini` tramite il record TXT fornito da GitHub, così un altro repository non può rivendicarlo.

## File nel progetto

- `public/CNAME` contiene il dominio (serve a GitHub Pages).
- `public/robots.txt` indica la sitemap canonica.
- `public/sitemap.xml` elenca le pagine pubbliche principali.
