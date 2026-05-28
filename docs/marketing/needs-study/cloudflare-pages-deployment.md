# Déploiement Cloudflare Pages — site VitePress de l'étude de besoins

## État du déploiement

- **URL de production** : <https://brasse-bouillon-marketing.pages.dev>
- **Projet Cloudflare** : `brasse-bouillon-marketing`
- **Production branch** : `main`
- **Méthodes** : Wrangler Direct Upload (CLI local, bootstrap) + GitHub Actions (auto-deploy sur `main`)
- **Statut** : public, non indexé (`noindex` + `X-Robots-Tag`), diffusion par lien à l'équipe

Calqué sur le runbook éprouvé du site Ydays
([docs/ydays/outputs/cloudflare-pages-deployment.md](../../ydays/outputs/cloudflare-pages-deployment.md)).

## Objectif

Publier le site VitePress `docs/marketing/needs-study/` (étude de besoins
marketing, epic #1075) sur **Cloudflare Pages** :

- **site public**, **non indexé**, **partagé par lien direct** à l'équipe ;
- toujours à jour : chaque mise à jour de l'étude sur `main` se redéploie automatiquement.

## Bootstrap (one-shot, CLI local)

Crée le projet Pages et publie une première fois pour obtenir le lien.
Depuis `docs/marketing/needs-study/` :

```bash
npx wrangler@latest login                 # OAuth navigateur, une seule fois
npx wrangler@latest pages project create brasse-bouillon-marketing \
  --production-branch=main
npm ci
npm run docs:build
npx wrangler@latest pages deploy .vitepress/dist \
  --project-name=brasse-bouillon-marketing \
  --branch=main \
  --commit-dirty=true
```

→ produit l'URL de production stable `https://brasse-bouillon-marketing.pages.dev`.

## Auto-deploy (GitHub Actions)

Une fois le projet créé, le workflow
[.github/workflows/marketing-study-deploy.yml](../../../.github/workflows/marketing-study-deploy.yml)
rebuild et redéploie automatiquement à chaque push sur `main` touchant
`docs/marketing/needs-study/**` (ou via `workflow_dispatch`).

**Secrets requis** (GitHub Actions repo secrets) :

- `CLOUDFLARE_API_TOKEN` — doit inclure la permission **Account → Cloudflare Pages → Edit**.
- `CLOUDFLARE_ACCOUNT_ID` — l'identifiant de compte Cloudflare.

## Redéploiement manuel (si besoin)

Pour publier hors `main` ou en dépannage, depuis `docs/marketing/needs-study/` :

```bash
npm run docs:build
npx wrangler@latest pages deploy .vitepress/dist \
  --project-name=brasse-bouillon-marketing \
  --branch=main \
  --commit-dirty=true
```

## Garde-fous de diffusion

Le site n'est **pas protégé** (pas d'auth) mais ne doit pas être traité
comme un site promotionnel public :

- `_headers` (`.vitepress/public/_headers`) déployé avec `X-Robots-Tag: noindex` ;
- meta `robots` / `googlebot` en `noindex, nofollow` dans `.vitepress/config.mjs` ;
- aucun lien depuis le site vitrine Brasse-Bouillon ;
- diffusion limitée au lien envoyé à l'équipe.

## Vérifications après déploiement

1. `curl -sI https://brasse-bouillon-marketing.pages.dev/` → `HTTP/2 200` + `x-robots-tag: noindex`
2. la home FR (`/`) et la home EN (`/en/`) chargent, sidebars A→D fonctionnelles ;
3. la recherche locale (barre en haut à droite) trouve du contenu ;
4. partager le lien à l'équipe.
