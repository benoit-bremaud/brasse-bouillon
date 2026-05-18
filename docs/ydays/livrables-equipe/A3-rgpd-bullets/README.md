# A3 — Bullets RGPD / Cybersécurité

> **Pour** : Fabien
> **Effort estimé** : 30 minutes
> **Deadline** : dimanche 24 mai 2026 (J-3)

## Ce qu'on attend de toi

**Un fichier `rgpd-bullets.md`** au format **Markdown uniquement** (rendu propre sur GitHub, zéro conversion côté Benoît) de **1 page A4 maximum**, contenant des bullets factuels sur ce qu'on a fait côté conformité.

## Trame proposée (copier-coller, complète chaque section)

```markdown
# Brasse-Bouillon — Conformité RGPD & sécurité

## Documents produits / en cours

- [ ] Mentions légales — statut : [À démarrer / En cours / Prêt]
- [ ] CGU (Conditions Générales d'Utilisation) — statut : [...]
- [ ] Politique de protection des données — statut : [...]
- [ ] Document de conformité RGPD/OWASP — statut : [...]

## Mesures techniques en place

- Authentification : [méthode utilisée — JWT / sessions / OAuth ?]
- Stockage mots de passe : [bcrypt / argon2 / autre ?]
- Communications réseau : [HTTPS partout / HTTPS frontend uniquement / autre ?]
- Stockage données utilisateur : [chiffré au repos ? localisation FR/EU ?]
- Logs et données personnelles : [anonymisation prévue ? durée conservation ?]

## Droits utilisateurs implémentés ou prévus

- Droit d'accès : [implémenté / à faire]
- Droit de rectification : [implémenté / à faire]
- Droit à l'effacement (RGPD art. 17) : [implémenté / à faire]
- Droit à la portabilité : [implémenté / à faire / différé v0.2]

## Différé en v0.2 (à mentionner en transparence)

- Tests de pénétration (pentest) — non réalisés
- Audit OWASP Top 10 formel — non réalisé
- Certification ISO 27001 — non visée à court terme
- [Autres choses honnêtement non couvertes]

## Estimation OWASP Top 10 (couverture déclarative)

| # | Catégorie OWASP | Couvert ? | Note |
|---|---|---|---|
| A01 | Broken Access Control | [oui/non/partiel] | [commentaire] |
| A02 | Cryptographic Failures | [...] | [...] |
| A03 | Injection | [...] | [...] |
| A07 | Identification & Auth Failures | [...] | [...] |
| (compléter ce qui est pertinent) | | | |
```

## Critères de qualité

- **Honnête** : si quelque chose n'est pas fait, écris "à faire" ou "différé v0.2". Le jury déteste les mensonges, il aime la lucidité.
- **Concis** : 1 page A4, pas un mémoire. Bullets > paragraphes.
- **Factuel** : pas de marketing, pas de "nous avons une approche premium de la sécurité". On dit ce qu'on a, point.

## Comment livrer

**Option 1 — Git (recommandé)** :

```bash
cd brasse-bouillon
git checkout -b a3-rgpd-bullets
# Copier ton fichier rgpd-bullets.md dans le dossier
git add docs/ydays/livrables-equipe/A3-rgpd-bullets/rgpd-bullets.md
git commit -m "docs(ydays): A3 — livre la synthèse RGPD"
git push -u origin a3-rgpd-bullets
```

Puis PR vers `main`.

**Option 2 — Discord** :

Drop le fichier sur canal `#ydays-soutenance` avec `@Benoît`.

## À quoi ça sert

Tes bullets servent à 2 livrables :

1. **Slide S13 (quadrant Cyber/RGPD)** du deck soutenance — 4 bullets max sur la slide
2. **Document PDF de conformité 5-10 pages** que Benoît va rédiger à partir de ta synthèse — pour avoir un livrable physique imprimé à montrer au jury en backup Q&A

Tu produis la matière brute, je transforme en deck slide + PDF présentable.

## Ce qu'il NE faut PAS faire

- Pas de prétention sur des tests de sécurité non réalisés (le CR jury du 6 mai dit explicitement : *"Pas de tests de sécurité réalisés sur l'application à ce stade"* — on respecte ça)
- Pas plus d'1 page (la slide n'en mérite pas plus)
- Pas de jargon hermétique (le jury comprend les bases mais n'est pas une autorité de certification)

## Si tu ne peux pas livrer

Ping `@Benoît` sur Discord, je rédige à partir de templates RGPD standards (1 h de boulot). Mais ta connaissance terrain du projet est meilleure que mes templates — si tu peux livrer, c'est mieux.
