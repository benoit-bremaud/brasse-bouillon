---
layout: doc
aside: true
---

<VerdictHero
  kicker="brasse-bouillon.com · historique d'audits"
  verdict="Historique"
  emphasis="des audits."
  sub="Journal des audits qualité & sécurité du site brasse-bouillon.com. Chaque audit est daté, conserve ses constats et son plan de remédiation, et reste consultable ici. Le plus récent est mis en avant ci-dessous."
  :meta="[
    { label: 'Dernier audit', value: '2026-05-21' },
    { label: 'Audits archivés', value: '1' },
    { label: 'Suivi des constats', value: 'epic #1031' }
  ]"
/>

## Dernier audit — 2026-05-21

<StatRow :items="[
  { num: 'Sain', label: 'verdict global', color: 'var(--sev-ok)' },
  { num: '12', label: 'constats ouverts', color: 'var(--sev-high)' },
  { num: '7', label: 'priorité haute', color: 'var(--sev-critical)' },
  { num: '100', label: 'Lighthouse a11y / SEO / BP', color: 'var(--sev-ok)' }
]" />

→ **[Ouvrir l'audit du 2026-05-21](/)** · [Constats](/findings) · [Remédiation](/remediation) · [Méthodologie](/methodology)

## Tous les audits

| Date | Périmètre | Verdict | Constats | Rapport |
|------|-----------|---------|----------|---------|
| **2026-05-21** | Site live + `packages/website` | Site sain, 12 axes de durcissement | 12 (7 hautes) | [Ouvrir](/) |

::: tip Ajouter un futur audit
Aujourd'hui la structure est **plate** : un seul audit à la racine (`index.md` = synthèse,
`findings.md`, `remediation.md`, `methodology.md`) et ce journal dans `historique.md`. Au **2ᵉ audit**,
on migre vers des **dossiers datés** `docs/audit-report/AAAA-MM-JJ/` (un dossier par campagne, URLs
stables), on ajoute une ligne à ce tableau et un groupe de sidebar dans `.vitepress/config.mjs`. Le
thème et les composants restent partagés — aucun changement de design.
:::
