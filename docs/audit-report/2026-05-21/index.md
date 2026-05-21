---
layout: doc
aside: true
---

<VerdictHero
  kicker="Audit qualité & sécurité · 2026-05-21"
  verdict="Site sain,"
  emphasis="12 axes de durcissement."
  sub="brasse-bouillon.com est solide sur la qualité front (HTML 100 % valide, Lighthouse au plafond, politique cookies honnête, aucun secret exposé). Les faiblesses se concentrent sur la configuration DNS / e-mail, les en-têtes HTTP de sécurité et la complétude des métadonnées SEO."
  :meta="[
    { label: 'Périmètre', value: 'site live + packages/website' },
    { label: 'Pages auditées', value: '10' },
    { label: 'Constats', value: '12' },
    { label: 'Suivi', value: 'epic #1031' }
  ]"
/>

## Verdict en un coup d'œil

<StatRow :items="[
  { num: '12', label: 'constats ouverts (issues)', color: 'var(--sev-high)' },
  { num: '7', label: 'priorité haute', color: 'var(--sev-critical)' },
  { num: '0', label: 'secret / fuite détecté', color: 'var(--sev-ok)' },
  { num: '0', label: 'erreur HTML (W3C)', color: 'var(--sev-ok)' }
]" />

Aucune vulnérabilité exploitable à distance ni fuite de données n'a été trouvée. Les constats
relèvent du **durcissement** (en-têtes, DNS) et de la **conformité** (RGPD polices, métadonnées SEO),
pas d'une compromission. Le risque dominant est l'**usurpation de l'identité e-mail du domaine** et
le fait que l'adresse de contact publiée **ne reçoit pas le courrier**.

## Scores Lighthouse — page d'accueil (mobile)

<ScoreGauge :items="[
  { label: 'Performance (LCP 152 ms)', value: 99 },
  { label: 'Accessibilité', value: 100 },
  { label: 'Bonnes pratiques', value: 100 },
  { label: 'SEO', value: 100 }
]" />

> La page d'accueil est exemplaire : **LCP 152 ms, CLS 0.00**. Le bémol perf se trouve sur les pages
> de texte (CLS 0.75 sur `privacy.html`, dû au *swap* des polices Google) — voir
> [constat #1039](/2026-05-21/findings#q-perf).

## Couverture de l'audit

<CoverageMatrix :cells="[
  { dim: 'En-têtes HTTP de sécurité', state: 'bad', note: 'CSP / X-Frame / nosniff / Referrer / Permissions absents' },
  { dim: 'TLS / HTTPS', state: 'ok', note: 'Let\'s Encrypt valide, redirection 301' },
  { dim: 'HSTS', state: 'warn', note: 'présent mais sans includeSubDomains/preload' },
  { dim: 'DNS e-mail (SPF/DMARC)', state: 'bad', note: 'domaine usurpable' },
  { dim: 'Contact e-mail', state: 'bad', note: 'aucun MX — contact@ ne reçoit rien' },
  { dim: 'Validation HTML (W3C)', state: 'ok', note: '0 erreur sur 6 pages' },
  { dim: 'Accessibilité', state: 'ok', note: 'Lighthouse 100 (home + privacy)' },
  { dim: 'SEO / métadonnées', state: 'warn', note: 'Open Graph manquant sur 9/10 pages' },
  { dim: 'Confidentialité / cookies', state: 'ok', note: 'aucun cookie posé, politique exacte' },
  { dim: 'Polices tierces (RGPD)', state: 'warn', note: 'Google Fonts via CDN Google' },
  { dim: 'Secrets dans le source', state: 'ok', note: 'aucun' },
  { dim: 'Outillage CI qualité', state: 'warn', note: 'pas de lint / Lighthouse CI / link-check' }
]" />

## Répartition des constats

| Domaine | Constats | Priorité |
|---|---|---|
| Sécurité réseau / en-têtes | #1032, #1033, #1034 | <SeverityBadge level="high" /> |
| Confidentialité / tiers | #1035, #1036 | <SeverityBadge level="high" /> |
| DNS / e-mail | #1042, #1044 | <SeverityBadge level="high" /> |
| SEO / métadonnées | #1045 | <SeverityBadge level="medium" /> |
| Outillage CI | #1037, #1038 | <SeverityBadge level="medium" /> |
| Perf / UX | #1039, #1043 | <SeverityBadge level="low" /> |

→ Détail complet dans **[Constats](/2026-05-21/findings)**, plan d'action dans **[Remédiation](/2026-05-21/remediation)**.

::: tip Contrainte structurante
Le site est servi par **GitHub Pages**, qui **ne peut pas définir d'en-têtes de réponse
personnalisés**. La correction des en-têtes (#1032, #1033) passe donc par un **proxy edge
gratuit (Cloudflare)** devant le domaine, ou un repli partiel via `<meta http-equiv>`.
:::
