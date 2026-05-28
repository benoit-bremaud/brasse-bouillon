# A2 — Screenshots organisation GitHub + Discord

> **Pour** : Clément **ou** Catarina (un.e des deux suffit)
> **Effort estimé** : 10-15 minutes
> **Deadline** : dimanche 24 mai 2026 (J-3)

## Ce qu'on attend de toi

**Exactement 2 screenshots** prouvant notre organisation projet :

1. **`github-issues.png`** — Capture de l'onglet **Issues** du repo `benoit-bremaud/brasse-bouillon` avec :
   - Les labels visibles (priority, scope, area, type)
   - Le filtre projet GitHub Projects appliqué si possible
   - Au moins une dizaine d'issues visibles pour montrer le volume de travail

2. **`discord-ci.png`** — Capture du canal Discord `#ci-notifications` (ou équivalent) montrant :
   - Plusieurs notifications GitHub Actions consécutives (succès / pull requests / déploiements)
   - L'horodatage visible pour prouver la fréquence
   - Idéalement un mix de types (front / back / infra / cyber)

## Critères techniques

- **Résolution** : full HD minimum (1920 × 1080)
- **Format** : PNG (préféré) ou JPG haute qualité
- **Lisibilité** : zoom navigateur ~110 % pour que ce soit lisible à 5 m sur la slide
- **Anonymisation** : aucune donnée sensible (token, secret, mail perso) ne doit apparaître

## Comment livrer

**Option 1 — Git (recommandé)** :

```bash
cd brasse-bouillon
git checkout -b a2-screenshots-org
cp ~/Downloads/github-issues.png docs/ydays/livrables-equipe/A2-screenshots-organisation/
cp ~/Downloads/discord-ci.png docs/ydays/livrables-equipe/A2-screenshots-organisation/
git add docs/ydays/livrables-equipe/A2-screenshots-organisation/
git commit -m "docs(ydays): A2 — livre les 2 screenshots organisation"
git push -u origin a2-screenshots-org
```

Puis PR vers `main`.

**Option 2 — Discord** :

Drop les 2 fichiers sur canal `#ydays-soutenance` avec `@Benoît`, je les uploade ici.

## Ce qu'il NE faut PAS faire

- Pas de zoom excessif (le jury doit comprendre que c'est GitHub / Discord du premier coup d'œil)
- Pas de capture avec données personnelles d'autres membres en surimpression
- Pas d'édition / retouche (je crop côté Canva si besoin)

## À quoi ça sert

Ces 2 captures sont le **cœur visuel de la slide S2 "Qui fait quoi"** du deck soutenance. Le CR jury du 6 mai a explicitement demandé : *"montrer captures des salons et notifications"*. C'est notre preuve de coordination outillée.

## Si tu ne peux pas livrer

Ping `@Benoît` sur Discord, je capture moi-même depuis mes accès admin en 10 min (plan B prévu).
