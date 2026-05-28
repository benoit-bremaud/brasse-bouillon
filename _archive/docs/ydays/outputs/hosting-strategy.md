# Stratégie d'hébergement backend — soutenance 27 mai 2026

**Finalité** : garantir que l'API Brasse-Bouillon (NestJS + SQLite)
est **joignable depuis internet** pendant la démo live du 27/05, pour
que le téléphone qui scanne un code-barre puisse interroger le
backend via le wifi de la salle ou la 4G, sans dépendre du laptop.

## Contexte

Jusqu'en avril 2026, le backend était hébergé sur **Klouders** — le
serveur étudiant de l'école. En avril, un incident matériel (disques
grillés) a mis le service hors ligne. L'équipe serveur annonce une
remise en route, mais cet incident expose un risque : si Klouders
retombe avant le 27/05, la démo live est cassée.

D'où la définition d'un **plan A + plan B** formellement activable,
documenté ici, et tracé dans l'analyse de risques (risque D1 — API
injoignable pendant la démo).

## Plan A — Klouders (cible prioritaire)

- **Nature** : serveur Docker de l'école, déjà utilisé précédemment.
- **Coût** : gratuit.
- **Avantage** : solution déjà connue, déjà déployée par le passé.
- **Inconvénient** : fiabilité récente dégradée (panne avril 2026).

**Action** : vérifier avec l'équipe serveur de l'école que le
service est de nouveau opérationnel avant le **2026-05-20**.

**Critère de validation** : requête HTTP sur l'URL publique retourne
`200` pendant 3 jours consécutifs sans interruption.

## Plan B — Fly.io (filet de sécurité)

- **Nature** : plateforme d'hébergement Docker managée (région `cdg`
  à Paris).
- **Coût** : gratuit dans l'enveloppe utilisée (1× `shared-cpu-1x`
  512 MB, 1 GB volume).
- **Avantage** : indépendant de l'école, toujours allumé
  (`min_machines_running=1` pour éviter les cold start).
- **Inconvénient** : nécessite une carte bancaire (pas de facturation
  dans l'enveloppe gratuite, mais carte obligatoire à l'inscription).

**État de la préparation** :

- Config Fly complète : [packages/api/fly.toml](../../../packages/api/fly.toml)
- Runbook complet : [packages/api/docs/fly-deploy.md](../../../packages/api/docs/fly-deploy.md)
- Le Dockerfile de l'API existe déjà sur `main`.
- Rien n'est encore déployé — activation en 1 commande `fly deploy`
  le jour où on en a besoin.

**Critère d'activation du plan B** : si Klouders ne répond plus au
**2026-05-22 (J-5)**, lancer `fly deploy` depuis `packages/api/` et
pointer l'app mobile sur `https://brasse-bouillon-api.fly.dev`.

## Cloudflare — écarté pour l'API

Cloudflare héberge déjà deux projets Brasse-Bouillon connexes
(`brasse-bouillon-ydays`, `audit-nvnc`), mais **ne peut pas héberger
l'API NestJS** telle qu'elle est :

- **Cloudflare Pages** sert du statique uniquement — pas de serveur
  Node long-running.
- **Cloudflare Workers** n'est pas compatible avec NestJS + TypeORM
  + SQLite sur fichier — migration vers D1 nécessiterait une
  réécriture lourde, hors périmètre avant le 27/05.

Cloudflare reste utilisé pour le **site vitrine Brasse-Bouillon**
(statique) et ce **site VitePress de soutenance** (statique).
C'est deux rôles différents.

## Checklist J-5 (2026-05-22)

- [ ] Plan A : `curl https://<klouders-url>/` retourne 200
- [ ] Plan A : pas d'erreurs dans les logs Klouders sur 72 h
- [ ] Plan A validé **OU** plan B activé
- [ ] Si plan B activé : `curl https://brasse-bouillon-api.fly.dev/`
      retourne 200
- [ ] Si plan B activé : app mobile pointée sur l'URL Fly via
      `EXPO_PUBLIC_API_URL`
- [ ] Backup DB : copie locale du fichier SQLite datée
- [ ] Décision tracée dans [PROJECT_LOG.md](../../../PROJECT_LOG.md)

## Lien avec l'analyse de risques

- **Risque D1** — API injoignable pendant la démo : couvert par
  plan A + plan B + vidéo backup.
- **Risque L** — incident logistique pendant la démo : bascule
  plan A → plan B < 5 minutes (commande unique).

Le plan B reste **passif** : rien n'est dépensé, rien n'est déployé
tant que Klouders tient. C'est un filet, pas un remplacement.
