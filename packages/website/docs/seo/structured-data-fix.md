# Structured Data fix — GSC “Extraits d’avis”

## 1) Contexte

GSC remontait : **“Extraits d’avis : 1 élément non valide”** sur `https://brasse-bouillon.com/`, historiquement lié à un ancien balisage `SoftwareApplication` + `aggregateRating`.

Le code courant a déjà été nettoyé côté pages publiques. Cette intervention verrouille le repo pour éviter toute régression.

---

## 2) Date/heure des vérifications techniques

- Timestamp run: `2026-02-23T16:08:58+01:00`

---

## 3) Résultat `git grep` (copie)

Commande exécutée :

```bash
git grep -nE 'SoftwareApplication|aggregateRating|ratingValue|ratingCount|Review' -- index.html index-en.html site.js
```

Sortie :

```text
(aucune occurrence)
```

Interprétation :

- `index.html` ✅ propre
- `index-en.html` ✅ propre
- `site.js` ✅ propre

---

## 4) Vérification source live (production)

Commande exécutée :

```bash
curl -sL https://brasse-bouillon.com/ \
  | grep -Ei 'SoftwareApplication|aggregateRating|ratingValue|ratingCount|Review'
```

Sortie :

```text
(aucune occurrence)
```

Conclusion : le HTML servi en production ne contient plus les champs problématiques.

---

## 5) Safety net repo ajouté/renforcé

### 5.1 Quality gate (`scripts/quality_gate.py`)

Ajout de règles d’échec si présence, sur `index.html` / `index-en.html`, de :

- `"@type": "SoftwareApplication"`
- `"@type": "Review"`
- `"aggregateRating"`
- `"ratingValue"`
- `"ratingCount"`

### 5.2 Tests anti-régression (`tests/test_quality_gate.py`)

Ajout du test :

- `test_detects_disallowed_aggregate_rating_fields`

Ce test injecte artificiellement `aggregateRating`/`ratingValue`/`ratingCount` et vérifie que `collect_errors()` échoue bien.

---

## 6) Résultat tests CI/local

Commande exécutée :

```bash
python3 -m unittest -v tests/test_quality_gate.py
python3 scripts/quality_gate.py
```

Résultat :

```text
Ran 7 tests ... OK
✅ Quality gate passed
```

---

## 7) Actions manuelles GSC (à compléter avec captures)

> Ces étapes nécessitent l’accès au compte Search Console.

1. URL Inspection → `https://brasse-bouillon.com/`
2. **Tester l’URL en direct**
3. Capturer :
   - Screenshot #1 : résumé du test live
   - Screenshot #2 : détail “Extraits d’avis” (sans erreur)
4. Cliquer **Demander une indexation**
5. Capturer :
   - Screenshot #3 : confirmation de demande d’indexation

### Bloc preuves

- Screenshot live summary: _à insérer_
- Screenshot review snippets detail: _à insérer_
- Screenshot indexing request confirmation: _à insérer_

---

## 8) Suivi monitoring

### J+2

- Vérifier URL Inspection de `/`
- État attendu : “En attente de traitement” ou “Aucun problème détecté”

### J+7

- Re-vérifier URL Inspection de `/`
- DoD final : alerte “Extraits d’avis” disparue

---

## 9) Notes de conformité

- ✅ **Aucun faux rating** ajouté (`ratingValue=1`, `ratingCount=1` interdit)
- ✅ `robots.txt` n’empêche pas Google d’explorer la home (`Allow: /`)
- ✅ La preuve technique la plus fiable reste le **test live GSC**
