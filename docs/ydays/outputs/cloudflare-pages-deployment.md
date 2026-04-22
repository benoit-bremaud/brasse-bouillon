# Déploiement Cloudflare Pages — site VitePress Ydays

## Objectif

Publier le site VitePress `docs/ydays/` sur **Cloudflare Pages** avec
une configuration simple, reproductible et cohérente avec la stratégie
retenue :

- **site public**
- **non indexé**
- **partagé par lien direct**
- **retours via Discord** tant que le widget feedback n'est pas intégré

## Configuration cible

### Source

- dépôt : `benoit-bremaud/brasse-bouillon`
- branche de travail actuelle : `docs/soutenance-27-mai`
- racine projet Cloudflare : `docs/ydays`

### Build

- commande d'installation : `npm install`
- commande de build : `npm run docs:build`
- dossier de sortie : `.vitepress/dist`

## Garde-fous de diffusion

Le site n'est **pas protégé** à ce stade, mais il ne doit pas être
traité comme un site public promotionnel.

Garde-fous attendus :

- `_headers` déployé avec `X-Robots-Tag: noindex`
- meta tags `robots` et `googlebot` configurés en `noindex, nofollow`
- aucun lien depuis le site principal Brasse-Bouillon
- diffusion limitée au lien envoyé à l'équipe projet

## Vérifications après déploiement

1. ouvrir l'URL Cloudflare Pages
2. vérifier que la home charge correctement
3. vérifier que la navigation latérale fonctionne
4. vérifier que les pages clés s'ouvrent :
   - `/`
   - `/read-first`
   - `/outputs/plan-presentation-27-mai`
   - `/outputs/pitch-anticipated-qa`
   - `/outputs/soutenance-27-mai-status-checklist`
5. vérifier que le fichier `_headers` est bien présent dans le build
6. partager ensuite le lien sur Discord à l'équipe Ydays

## Suite prévue après mise en ligne

1. faire relire le site par les 8 membres du projet
2. récolter les retours sur Discord
3. corriger les points de friction de lecture
4. intégrer ensuite le widget feedback si le temps le permet
