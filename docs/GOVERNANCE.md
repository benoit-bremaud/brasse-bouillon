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
3. Commiter avec Conventional Commits.
4. Push + ouverture PR vers `develop`.
5. Vérifier CI verte + retours review pertinents.
6. Merge PR.
7. Commenter puis fermer l’issue avec traçabilité (numéro PR + merge commit).

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
