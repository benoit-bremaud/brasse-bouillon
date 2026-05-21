# Constats détaillés

12 constats, classés par domaine. Chaque carte renvoie à son issue GitHub de suivi sous
l'[epic #1031](https://github.com/benoit-bremaud/brasse-bouillon/issues/1031). Niveaux de sévérité :
<SeverityBadge level="critical" /> <SeverityBadge level="high" /> <SeverityBadge level="medium" /> <SeverityBadge level="low" />.

## Sécurité réseau & en-têtes

<FindingCard id="#1032" sev="high" title="En-têtes de sécurité absents"
  :tags="['security', 'priority:high', 'scope:website']"
  evidence="curl -sSI https://brasse-bouillon.com&#10;→ présent : strict-transport-security&#10;→ absents : Content-Security-Policy, X-Content-Type-Options,&#10;            X-Frame-Options, Referrer-Policy, Permissions-Policy">
  Aucune défense en profondeur navigateur au-delà de HSTS. Pas de <strong>CSP</strong> (mitigation XSS),
  pas de <strong>X-Frame-Options</strong> (clickjacking), pas de <strong>nosniff</strong> (MIME sniffing),
  pas de <strong>Referrer-Policy</strong> (fuite de referrer vers Google Fonts / Formspree).
  Préalable CSP : un <code>&lt;script&gt;</code> inline et un <code>onclick</code> inline doivent être
  refactorés avant une CSP stricte.
</FindingCard>

<FindingCard id="#1033" sev="high" title="HSTS sans includeSubDomains ni preload"
  :tags="['security', 'priority:high']"
  evidence="strict-transport-security: max-age=31556952">
  Les sous-domaines ne sont pas couverts par le HTTPS forcé et le domaine n'est pas éligible à la
  liste de préchargement HSTS des navigateurs (fenêtre de downgrade à la première visite).
</FindingCard>

<FindingCard id="#1034" sev="high" title="/.well-known/security.txt absent"
  :tags="['security', 'priority:high']"
  evidence="GET /.well-known/security.txt → 404">
  Aucun canal documenté (RFC 9116) pour qu'un chercheur signale une faille. Correctif simple : un
  fichier statique avec contact, expiration et langues.
</FindingCard>

## Confidentialité & ressources tierces

<FindingCard id="#1035" sev="high" title="Google Fonts servies par le CDN Google (RGPD)"
  :tags="['security', 'priority:high']">
  Fraunces et Inter sont chargées depuis <code>fonts.gstatic.com</code> : l'IP du visiteur est
  transmise à Google <strong>avant tout consentement</strong>. En tension directe avec la discipline
  de confidentialité du package (analytics retirés en PR #817). Remédiation : auto-héberger les
  polices — supprime aussi le blocage de rendu (perf).
</FindingCard>

<FindingCard id="#1036" sev="high" title="Formulaires Formspree — anti-abus & flux tiers"
  :tags="['security', 'priority:high']">
  Newsletter et questionnaire postent vers Formspree, sans anti-abus visible. À ajouter : honeypot /
  captcha, vérification du rate-limit, et mention RGPD du transfert dans les pages de confidentialité.
</FindingCard>

## DNS & e-mail

<FindingCard id="#1042" sev="high" title="SPF & DMARC absents — usurpation possible"
  :tags="['security', 'priority:high']"
  evidence="dig TXT brasse-bouillon.com        → pas de v=spf1&#10;dig TXT _dmarc.brasse-bouillon.com → vide">
  Sans SPF ni DMARC, n'importe qui peut envoyer des e-mails « de » <code>@brasse-bouillon.com</code>
  (phishing au nom de la marque). Verrouiller même un domaine non-émetteur : <code>v=spf1 -all</code>
  + DMARC <code>p=reject</code>.
</FindingCard>

<FindingCard id="#1044" sev="high" title="contact@brasse-bouillon.com ne fonctionne pas"
  :tags="['type:bug', 'priority:high']"
  evidence="dig MX brasse-bouillon.com → vide (aucun serveur mail)&#10;adresse affichée sur les 10 pages du site">
  L'unique canal de contact public, présent partout, est <strong>mort</strong> : aucun enregistrement
  MX. Tout e-mail envoyé rebondit. Remédiation légère : redirection e-mail gratuite (Cloudflare Email
  Routing / ImprovMX) ou remplacer l'adresse par un formulaire.
</FindingCard>

## SEO & métadonnées

<FindingCard id="#1045" sev="medium" title="Open Graph manquant sur 9/10 pages ; canonical/hreflang EN incohérents"
  :tags="['type:fix', 'priority:medium']"
  evidence="og:title présent uniquement sur index.html&#10;manquant : 9 pages (legal/privacy/cookies/terms FR+EN, index-en)&#10;index-en.html : SEO 61 — canonical invalide">
  Violation de la convention SEO documentée du package (chaque page doit exposer og:title /
  og:description / og:image / Twitter Card). Partages sociaux dégradés. À étendre au quality gate.
</FindingCard>

## Outillage CI / qualité

<FindingCard id="#1037" sev="medium" title="Pas de lint HTML/CSS en CI"
  :tags="['type:ci', 'priority:medium']">
  Le gate structurel existe mais aucun <code>html-validate</code> ni <code>stylelint</code> : les
  régressions de balisage / contraste / tokens peuvent passer. Les scores Lighthouse 100 ne sont
  protégés par aucun garde-fou.
</FindingCard>

<FindingCard id="#1038" sev="medium" title="Pas de Lighthouse CI ni link-checker"
  :tags="['type:ci', 'priority:medium']">
  Rien ne détecte une chute de score Lighthouse ou un lien mort introduits par un futur changement.
  Ajouter Lighthouse CI (seuils) + un link-checker sur le <code>_site/</code> construit.
</FindingCard>

## Performance & UX {#q-perf}

<FindingCard id="#1039" sev="low" title="Images PNG non optimisées + polices bloquant le rendu (CLS 0.75 sur privacy)"
  :tags="['type:fix', 'priority:low']"
  evidence="privacy.html (mobile) → CLS 0.75 (mauvais ; bon < 0.1)&#10;cause probable : swap des Google Fonts (FOUT)">
  Préventif (la home est à CLS 0.00). Convertir les captures PNG en WebP/AVIF et supprimer le CSS
  tiers bloquant (auto-héberger les polices avec <code>font-display</code>).
</FindingCard>

<FindingCard id="#1043" sev="low" title="Pas de page 404 personnalisée"
  :tags="['type:fix', 'priority:low']"
  evidence="GET /page-inexistante → 404 GitHub Pages générique">
  Un visiteur égaré tombe sur une impasse non-marquée. Ajouter un <code>404.html</code> stylé avec un
  lien retour.
</FindingCard>

## Constats différés

<FindingCard id="#1046" sev="low" title="Décision i18n / retrait des pages EN à demi câblées"
  :tags="['type:task', 'priority:low']">
  Surface anglaise incohérente : la home n'a pas de lien EN, mais les 4 pages secondaires portent un
  lien « Read in English » + <code>hreflang="en"</code>. Les 5 pages <code>-en.html</code> sont
  requises par le quality gate (non supprimables en l'état). Décision de direction à prendre avant
  tout chantier i18n.
</FindingCard>
