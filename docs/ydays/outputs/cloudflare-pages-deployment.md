# Déploiement Cloudflare Pages — site VitePress Ydays

## État du déploiement

- **URL de production** : <https://brasse-bouillon-ydays.pages.dev>
- **Projet Cloudflare** : `brasse-bouillon-ydays`
- **Production branch** : `docs-soutenance-27-mai` (miroir du nom Git
  `docs/soutenance-27-mai` — slash transformé en tiret par Cloudflare)
- **Méthode retenue** : Wrangler Direct Upload (CLI local)
- **Premier déploiement** : 2026-04-22
- **Statut** : live, noindex actif, 6/6 pages clés en 200

## Objectif

Publier le site VitePress `docs/ydays/` sur **Cloudflare Pages** avec
une configuration simple, reproductible et cohérente avec la stratégie
retenue :

- **site public**
- **non indexé**
- **partagé par lien direct**
- **retours via Discord** tant que le widget feedback n'est pas intégré

## Méthode retenue — Wrangler Direct Upload

Au 2026-04-22, le dashboard Cloudflare "Workers & Pages" tombe par
défaut dans le flow **Workers** (projet avec `wrangler deploy`, sans
champ "Build output directory"). Ce flow ne convient pas à un site
statique VitePress.

On passe donc par le **CLI wrangler** en Direct Upload :

- aucune connexion Git vers le monorepo (Cloudflare ne voit ni le
  repo ni les autres packages) ;
- on uploade uniquement le contenu de `docs/ydays/.vitepress/dist/` ;
- `_headers` et meta `robots` noindex embarqués dans le build.

### Première configuration (one-shot)

```bash
cd docs/ydays
npx wrangler@latest login                 # OAuth navigateur, une seule fois
npx wrangler@latest pages project create brasse-bouillon-ydays \
  --production-branch=docs-soutenance-27-mai
```

### Déploiement (à relancer à chaque itération)

```bash
cd docs/ydays
npm run docs:build
npx wrangler@latest pages deploy .vitepress/dist \
  --project-name=brasse-bouillon-ydays \
  --branch=docs-soutenance-27-mai \
  --commit-dirty=true
```

Durée : ~30 secondes par redeploy. Sortie :

- **URL de production stable** (alias) :
  `https://brasse-bouillon-ydays.pages.dev` — bascule automatiquement
  sur le dernier build, c'est **celle qu'on partage à l'équipe**.
- **URL de déploiement immuable** :
  `https://<hash>.brasse-bouillon-ydays.pages.dev` — version figée
  de ce build précis, utile pour partager un état figé ou comparer.

## Source

- dépôt : `benoit-bremaud/brasse-bouillon`
- branche de travail : `docs/soutenance-27-mai`
- racine projet Cloudflare : `docs/ydays`

## Garde-fous de diffusion

Le site n'est **pas protégé** à ce stade, mais il ne doit pas être
traité comme un site public promotionnel.

Garde-fous en place :

- `_headers` déployé avec `X-Robots-Tag: noindex` (vérifié via
  `curl -sI` sur la home)
- meta tags `robots` et `googlebot` configurés en `noindex, nofollow`
  dans `.vitepress/config.mjs`
- aucun lien depuis le site principal Brasse-Bouillon
- diffusion limitée au lien envoyé à l'équipe projet

## Vérifications après déploiement

1. `curl -sI https://brasse-bouillon-ydays.pages.dev/` →
   `HTTP/2 200` + `x-robots-tag: noindex`
2. home charge, sidebar fonctionne
3. pages clés ouvrent en 200 :
   - `/`
   - `/read-first`
   - `/feedback-guide`
   - `/outputs/plan-presentation-27-mai`
   - `/outputs/pitch-anticipated-qa`
   - `/outputs/soutenance-27-mai-status-checklist`
4. recherche locale (barre en haut à droite) trouve du contenu
5. partager le lien sur Discord à l'équipe Ydays

## Suite prévue

1. faire relire le site par les 8 membres du projet
2. récolter les retours sur Discord (thread dédié)
3. corriger les points de friction de lecture
4. ajouter plus tard une GitHub Action auto-deploy sur push vers
   `docs/soutenance-27-mai` (secret `CLOUDFLARE_API_TOKEN`) quand la
   cadence de commits sur la doc soutenance s'accélère
5. intégrer le widget feedback si le temps le permet

## Hors scope à ce stade

- domaine personnalisé (type `ydays.brasse-bouillon.com`) — report
  post-oral blanc
- protection par mot de passe / Access policy — le noindex + partage
  par lien suffit
- intégration Git via dashboard Cloudflare — bloquée par le flow
  Workers par défaut, sera retentée si/quand Cloudflare réactive un
  chemin Pages classique clair
