# A1 — Screenshots application mobile

> **Pour** : Sara **ou** Thaïs (un.e des deux suffit, vous vous coordonnez)
> **Effort estimé** : 15-20 minutes
> **Deadline** : dimanche 24 mai 2026 (J-3)

## Ce qu'on attend de toi

**Exactement 3 screenshots** de l'application Brasse-Bouillon, dans l'ordre suivant :

1. **`scanner.png`** — Écran scanner de code-barre, idéalement en action (overlay caméra visible, ou viseur centré)
2. **`recette.png`** — Une recette ouverte avec les ingrédients visibles (malts, houblons, levure) et le bouton d'adaptation de volume si possible
3. **`mode-batch.png`** — Mode Batch en cours avec un timer actif (étape empâtage ou ébullition de préférence — quelque chose de "vivant")

## Critères techniques

- **Résolution** : full résolution mobile (1080 × 1920 minimum, ou plus haut si Pixel/iPhone récent)
- **Format** : PNG (préféré) ou JPG haute qualité
- **Statut barres** : peu importe (Benoît crop si besoin)
- **Données affichées** : utilise le mode démo (PR #823 — credentials demo) pour avoir des données propres et cohérentes

## Comment livrer

**Option 1 — Git (recommandé)** :

```bash
cd brasse-bouillon
git checkout -b a1-screenshots
cp ~/Downloads/scanner.png docs/ydays/livrables-equipe/A1-screenshots-app/
cp ~/Downloads/recette.png docs/ydays/livrables-equipe/A1-screenshots-app/
cp ~/Downloads/mode-batch.png docs/ydays/livrables-equipe/A1-screenshots-app/
git add docs/ydays/livrables-equipe/A1-screenshots-app/
git commit -m "docs(ydays): A1 — livre les 3 screenshots app"
git push -u origin a1-screenshots
```

Puis ouvre une PR ciblant `main`, je merge.

**Option 2 — Discord** :

Drop les 3 fichiers sur canal `#ydays-soutenance` en mentionnant `@Benoît` — je les uploade ici.

## Ce qu'il NE faut PAS faire

- Pas de retouche/édition (je m'en occupe pour harmoniser avec la charte)
- Pas de mise en mockup téléphone (juste l'écran brut, je l'encadre côté Canva)
- Pas plus de 3 screenshots (1 par écran demandé suffit)

## À quoi ça sert

Ces 3 screenshots sont le **cœur visuel de la slide S8 "Produit / UX"** du deck soutenance. C'est ce que le jury verra pour comprendre concrètement ce que fait Brasse-Bouillon. La démo live racontera la même histoire, mais les screenshots prouvent que c'est livré.

## Si tu ne peux pas livrer

Ping `@Benoît` sur Discord, je capture moi-même depuis Expo dev en 15 min (plan B prévu).
