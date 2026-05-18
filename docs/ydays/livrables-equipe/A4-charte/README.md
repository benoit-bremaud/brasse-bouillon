# A4 — Charte officielle Brasse-Bouillon

> **Pour** : Fabio **ou** Liam (un.e des deux suffit)
> **Effort estimé** : 10-15 minutes
> **Deadline** : vendredi 22 mai 2026 (J-5)

## Ce qu'on attend de toi

**3 éléments** déposés dans ce dossier :

1. **`charte.md`** — Document texte court avec :
   - **Hex codes** des couleurs officielles BB (jaune principal, accents secondaires, texte, fond, etc.)
   - **Typographie** officielle (nom de la fonte + poids utilisés) — si on n'est pas sur Inter
   - **Logo principal** : nom de fichier dans ce dossier
   - **Logo monochrome / variante sombre** : si existe

2. **`logo-bb.png`** — Logo Brasse-Bouillon en **PNG transparent haute résolution** (1024 × 1024 minimum). **Obligatoire** (format directement importable dans Canva).

3. **`logo-bb.svg`** *(optionnel mais bienvenu)* — Même logo en **SVG vectoriel** si tu en as la source — sert d'archive pour les futurs supports print/grand format.

4. **`logo-bb-dark.png`** *(optionnel mais utile)* — Variante du logo sur fond sombre (pour la slide S14 conclusion qui sera sur fond noir).

## Format attendu pour `charte.md`

Trame à compléter :

```markdown
# Brasse-Bouillon — Charte officielle

## Couleurs

| Usage | Hex | Aperçu |
|---|---|---|
| Jaune principal (fond slides) | #?????? | (couleur dominante du logo BB) |
| Accent secondaire | #?????? | (orange du chef ? brun du houblon ?) |
| Texte foncé (sur fond jaune) | #?????? | (typiquement #1A1A1A ou #2D2D2D) |
| Texte clair (sur fond sombre) | #?????? | (typiquement #FFFFFF ou #F5F5F5) |
| Fond sombre (slide finale) | #1A1A1A | (par défaut, à confirmer) |

## Typographie

- **Police principale** : [Inter ? Autre ?]
- **Poids utilisés** : Regular / Medium / Bold
- **Tailles** : titre ≥ 36 pt · sous-titre ≥ 24 pt · texte courant ≥ 18 pt

## Logo

- Fichier principal : `logo-bb.png` (PNG transparent 1024 × 1024)
- Variante sombre : `logo-bb-dark.png` (si dispo)
- Source vectorielle : [lien Figma / Adobe / dossier repo si dispo]
```

## Critères techniques

- **PNG transparent** obligatoire (pas de fond blanc)
- **Résolution minimale** : 1024 × 1024 (sera redimensionné dans Canva)
- **Pas de compression abusive** : on veut un logo net à grande taille

## Comment livrer

**Option 1 — Git (recommandé)** :

```bash
cd brasse-bouillon
git checkout -b a4-charte
# Copier tes fichiers dans le dossier
cp charte.md docs/ydays/livrables-equipe/A4-charte/
cp logo-bb.png docs/ydays/livrables-equipe/A4-charte/
git add docs/ydays/livrables-equipe/A4-charte/
git commit -m "docs(ydays): A4 — livre la charte officielle"
git push -u origin a4-charte
```

Puis PR vers `main`.

**Option 2 — Discord** :

Drop les fichiers sur canal `#ydays-soutenance` avec `@Benoît`.

## Ce qu'il NE faut PAS faire

- Pas de logo JPG (transparent obligatoire)
- Pas le logo orange/ancien (on est sur la charte jaune définitive)
- Pas d'inventer des couleurs nouvelles — référer à ce qui existe déjà dans le repo (cherche dans [packages/mobile-app/docs/design-system.md](../../../../packages/mobile-app/docs/design-system.md) ou dans le code des thèmes)

## À quoi ça sert

Cette charte est la **référence unique** que Benoît va appliquer sur **les 15 slides du deck** pour garantir la cohérence visuelle (vs le draft actuel qui mélange jaune + orange/crème = pas pro).

C'est aussi la base pour :
- S0 Titre muet
- S14 Conclusion (fond sombre avec logo)
- Background de toutes les slides intermédiaires
- Cartes de visite (cohérence print/digital)

## Si tu ne peux pas livrer

Ping `@Benoît` sur Discord. Plan B : il utilise les couleurs déclarées dans [packages/mobile-app/docs/design-system.md](../../../../packages/mobile-app/docs/design-system.md) + extrait le logo depuis le repo. ~30 min de boulot supplémentaire.
