# Dominio custom (WordPress.com → GitHub Pages)

Dominio: `claudia-dangelo.com`

## DNS (su WordPress.com)

Per puntare a GitHub Pages:

- `A` record per `@` → `185.199.108.153`
- `A` record per `@` → `185.199.109.153`
- `A` record per `@` → `185.199.110.153`
- `A` record per `@` → `185.199.111.153`
- `CNAME` per `www` → `claudia-dangelo.com` (opzionale ma consigliato)

Non modificare i record email (SPF/DMARC/DKIM) se ti servono.

## GitHub (nel repo)

1) Repo → `Settings` → `Pages`
2) `Source`: `GitHub Actions`
3) `Custom domain`: `claudia-dangelo.com`
4) `Enforce HTTPS`: appare/si abilita solo dopo propagazione DNS e certificato (può richiedere tempo)

## File nel progetto

- `public/CNAME` contiene il dominio (serve a GitHub Pages).

