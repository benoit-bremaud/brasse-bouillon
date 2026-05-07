# Risques — vue d'ensemble

Cette section sert d'entrée vers l'analyse de risques complète et la
mitigation associée, sans tomber directement sur le tableau brut.

## Catégories de risques

La soutenance expose **28 risques identifiés**, répartis en 4 familles.

| Code | Famille | Nombre | Exemple type |
|---|---|---|---|
| **S** | Support (slides, deck) | 7 | Export PDF planté, visuel qui ne charge pas |
| **D** | Démo live | 8 | Scanner qui échoue, wifi instable |
| **C** | Contenu / pitch | 7 | Chiffre fragile, formulation agressive |
| **L** | Logistique / équipe | 6 | Horaire mal tenu, matériel manquant |

## Lire dans cet ordre

1. [Analyse de risques complète](/outputs/risk-analysis) — le tableau
   exhaustif avec sévérité, probabilité et mitigation par risque.
2. [Stratégie d'hébergement](/outputs/hosting-strategy) — plan A
   Klouders / plan B Fly.io pour couvrir le risque D1 (API
   injoignable pendant la démo).
3. [Checklist de statut](/outputs/soutenance-27-mai-status-checklist) —
   ce qui est déjà mitigé vs ce qui reste ouvert.

## Top 3 à surveiller

- **D1 — API backend injoignable pendant la démo** → mitigé par vidéo
  backup + plan B Fly.io activable avant J-5.
- **D7 — Seed démo non validé** → bière test A/B/C à choisir avant la
  première répétition chronométrée.
- **C3 — Dépassement du chrono** → mitigé par répétition complète
  chronométrée avant l'oral blanc du 2026-05-06.

## Checklist J-7 / J-3 / J-1

La checklist matérielle finale (export PDF offline, copie USB,
Google Drive, test HDMI, miroir téléphone, mode avion) est dans le
document complet, section "Checklist matériel J-1".

::: warning Filet de sécurité
La **vidéo backup** à tourner avant le 2026-05-20 est la mitigation
unique qui couvre le plus large spectre de risques D (démo live). À
ne pas repousser.
:::
