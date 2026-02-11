# Gouvernance repository — Brasse-Bouillon Website

Ce document formalise la gouvernance opérationnelle du repo website.

---

## 1) Source de vérité backlog

- Les epics/issues GitHub font foi.
- L’ordre de traitement suit l’ordre de priorité défini dans les issues ouvertes.
- Une issue est clôturée uniquement après merge de la PR associée.

---

## 2) Cycle standard issue → branche → PR → merge

1. Créer une branche dédiée (`feature/*`, `docs/*`, `bugfix/*`).
2. Implémenter le périmètre de l’issue uniquement.
3. Committer avec Conventional Commits.
4. Push + ouverture PR vers `develop`.
5. Vérifier CI verte + retours review pertinents.
6. Merge PR vers `develop`.
7. Commenter puis fermer l’issue avec traçabilité (numéro PR + merge commit).

## 2bis) Promotion `develop` → `main` et déploiement GitHub Pages

1. `develop` est la branche d’intégration continue ; `main` est la branche de production déployée par GitHub Pages.
2. À la fin d’une epic (ou lorsqu’un incrément est prêt), ouvrir une PR de release de `develop` vers `main`.
3. Vérifier que la CI est verte sur la PR de release.
4. Faire relire et approuver la PR de release selon les mêmes règles que les PR vers `develop`.
5. Merger la PR de release vers `main` avec une stratégie de merge explicite (merge commit recommandé pour la traçabilité).
6. Lier la PR de release aux issues/epics concernées pour assurer la traçabilité `issue` → `PR develop` → `PR main`.
7. Le déploiement GitHub Pages est déclenché automatiquement sur push vers `main`; vérifier ensuite que la production est à jour.

---

## 3) Politique de qualité

- Les checks CI doivent être verts avant merge.
- Aucun marqueur de conflit ne doit subsister.
- Les changements docs doivent rester cohérents avec la structure réelle du repo.

---

## 4) Politique de documentation

À maintenir à jour en priorité :
- `README.md`
- `CONTRIBUTING.md`
- `docs/ROADMAP.md`
- `docs/GOVERNANCE.md`

Critère d’acceptation : pas de référence à des fichiers inexistants ni à des workflows obsolètes.

---

## 5) Runbook de fin d’epic

Après merge :
1. Vérifier que la PR est bien en état `MERGED`.
2. Commenter l’issue avec le lien PR et le merge commit.
3. Fermer l’issue.
4. Nettoyer la branche locale et distante.
5. Revenir sur `develop` à jour.
6. Confirmer l’issue suivante à traiter.
