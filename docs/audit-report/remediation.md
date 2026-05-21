# Plan de remédiation

Séquencé par effort/impact. La plupart des constats haute priorité se règlent **sans toucher au code
du site** (DNS, proxy edge) — l'essentiel du risque se traite vite.

## Vague 1 — DNS & e-mail (rapide, fort impact, hors code)

<StatRow :items="[
  { num: '3', label: 'constats', color: 'var(--sev-critical)' },
  { num: '~1 h', label: 'effort estimé', color: 'var(--sev-high)' },
  { num: 'DNS only', label: 'aucun déploiement', color: 'var(--sev-ok)' }
]" />

1. **#1042 — SPF + DMARC.** <StatusBadge state="todo" /> Ajouter `v=spf1 -all` et `_dmarc`
   `v=DMARC1; p=reject; rua=…`. Bloque l'usurpation immédiatement.
2. **#1044 — contact e-mail.** <StatusBadge state="todo" /> Mettre en place une redirection
   (Cloudflare Email Routing, gratuit) → crée les MX manquants et rend `contact@` fonctionnel.
3. **Re-tester.** <StatusBadge state="todo" /> Envoyer un vrai e-mail + `mail-tester` / MXToolbox.

## Vague 2 — En-têtes de sécurité (décision d'architecture)

<StatRow :items="[
  { num: '3', label: 'constats', color: 'var(--sev-high)' },
  { num: '1', label: 'décision (ADR)', color: 'var(--sev-medium)' }
]" />

Trancher d'abord la voie (idéalement un **ADR**) :

- **Option A (recommandée)** — placer **Cloudflare** (gratuit) devant le domaine et définir tous les
  en-têtes au edge : CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (#1032),
  HSTS `includeSubDomains; preload` (#1033). Couverture complète + reporting.
- **Option B (repli)** — `<meta http-equiv>` pour CSP + Referrer-Policy seulement ; les autres
  en-têtes restent impossibles via meta.

- **#1032 — en-têtes** <StatusBadge state="todo" /> · **#1033 — HSTS** <StatusBadge state="todo" /> · **#1034 — security.txt** <StatusBadge state="todo" />

Préalable à une CSP stricte : refactorer le `<script>` inline et l'`onclick` inline hors du HTML.

## Vague 3 — Confidentialité & SEO (dans le code du site)

1. **#1035 — auto-héberger les polices** <StatusBadge state="todo" /> (woff2 same-origin) : supprime
   le transfert RGPD vers Google *et* le blocage de rendu (corrige le CLS de #1039).
2. **#1045 — Open Graph** <StatusBadge state="todo" /> sur les 9 pages manquantes + cohérence
   canonical/hreflang ; étendre le quality gate pour l'imposer partout.
3. **#1036 — Formspree** <StatusBadge state="todo" /> : honeypot/captcha + mention RGPD dans `privacy.html`.

## Vague 4 — Garde-fous CI & finitions

1. **#1037** <StatusBadge state="todo" /> — `html-validate` + `stylelint` en CI.
2. **#1038** <StatusBadge state="todo" /> — Lighthouse CI (seuils) + link-checker.
3. **#1039** <StatusBadge state="todo" /> — captures PNG → WebP/AVIF (le volet polices est traité en vague 3).
4. **#1043** <StatusBadge state="todo" /> — `404.html` de marque.

## Différé (décision produit)

- **#1046 — i18n / pages EN.** <StatusBadge state="todo" /> Choisir la direction (FR-only maintenant
  vs vraie i18n plus tard) avant de toucher à la surface anglaise.

---

::: info Suivi
Tous les constats sont tracés comme issues sous l'[epic #1031](https://github.com/benoit-bremaud/brasse-bouillon/issues/1031),
labellisés (`security` / `priority:high` pour la sécurité, niveaux ajustés pour la qualité) et
ajoutés au board projet.
:::
