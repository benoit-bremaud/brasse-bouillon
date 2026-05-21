# Méthodologie & périmètre

## Périmètre

- **Site déployé (live)** : `https://brasse-bouillon.com` et ses 10 pages publiques (accueil +
  legal / privacy / cookies / terms, en versions FR et EN).
- **Code source** : `packages/website` du monorepo (HTML/CSS/JS statique, déploiement GitHub Pages).
- **Hors périmètre** : l'application mobile, l'API, et l'implémentation des correctifs (cet audit
  constate et trace ; il ne corrige pas).

Audit en **lecture seule** : aucune action intrusive, aucune modification du site.

## Dimensions couvertes

| Dimension | Outils / méthode |
|---|---|
| En-têtes HTTP & TLS | `curl -sSI`, `openssl s_client` |
| Performance & Core Web Vitals | trace Chrome DevTools (LCP, CLS) |
| Accessibilité / SEO / bonnes pratiques | Lighthouse (mobile) sur home + pages secondaires |
| Validité HTML | validateur W3C Nu (API JSON) sur les 6 pages principales |
| DNS / e-mail | `dig` (MX, TXT/SPF, DMARC, sous-domaines) |
| Confidentialité / cookies | revue source + vérification des écritures cookie/storage |
| Secrets | recherche dans tout le source (`.env`, clés, tokens) |
| Ressources tierces | inventaire des origines externes (fonts, formulaires) |
| Outillage CI | revue des workflows et du quality gate du package |

## Système de sévérité

<SeverityBadge level="critical" /> compromission directe ou exploitation à distance. *(aucun ici)*
<br><SeverityBadge level="high" /> exposition réelle (usurpation, RGPD, défaut fonctionnel public) — à traiter en priorité.
<br><SeverityBadge level="medium" /> écart de conformité ou risque de régression non protégé.
<br><SeverityBadge level="low" /> finition, préventif, UX.
<br><SeverityBadge level="ok" /> vérifié conforme — point fort.

## Points forts confirmés

- HTML **100 % valide** (W3C Nu) sur les 6 pages principales.
- Lighthouse **100** en accessibilité / SEO / bonnes pratiques (home & privacy), **LCP 152 ms**.
- **Aucun secret** ni `.env` dans le source ; **aucun cookie** posé.
- Politique cookies **exacte et honnête** (déclare l'absence de tracking, mentionne Google Fonts).
- Liens externes déjà en `rel="noopener noreferrer"` ; TLS valide ; redirection HTTPS en place.

## Traçabilité

Chaque constat est une issue GitHub sous l'[epic #1031](https://github.com/benoit-bremaud/brasse-bouillon/issues/1031),
avec preuve (sortie `curl`/`dig`/Lighthouse), impact, remédiation et critères d'acceptation. Une
entrée a été ajoutée au `PROJECT_LOG.md` du dépôt.

> Audit réalisé le **2026-05-21**. Le certificat TLS observé expire le 2026-08-01 ; les résultats
> live reflètent l'état du site à cette date.
