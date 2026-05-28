import pkg from "../package.json" with { type: "json" };

const outputsPrefix = "/outputs";
const referencesPrefix = "/references";
const debriefPrefix = "/debrief";

const siteVersion = pkg.version;

/** @type {import('vitepress').UserConfig} */
export default {
  title: "Brasse-Bouillon",
  description: "Documentation de préparation de la soutenance Ydays du 27 mai 2026.",
  head: [
    ["meta", { name: "robots", content: "noindex, nofollow" }],
    ["meta", { name: "googlebot", content: "noindex, nofollow" }]
  ],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  lang: "fr-FR",
  themeConfig: {
    siteTitle: "Soutenance Ydays",
    logo: "/logo-primary-512x512.png",
    nav: [
      { text: "Accueil", link: "/" },
      { text: "Lire d'abord", link: "/read-first" },
      { text: "Statut", link: `${outputsPrefix}/soutenance-27-mai-status-checklist` },
      { text: "Q&A", link: `${outputsPrefix}/pitch-anticipated-qa` },
      { text: `v${siteVersion}`, link: "/changelog" }
    ],
    sidebar: [
      {
        text: "Prise en main",
        items: [
          { text: "Accueil", link: "/" },
          { text: "Lire d'abord", link: "/read-first" },
          { text: "Faire un bon retour", link: "/feedback-guide" },
          { text: "Statut opérationnel", link: `${outputsPrefix}/soutenance-27-mai-status-checklist` },
          { text: "Changelog du site", link: "/changelog" }
        ]
      },
      {
        text: "Soutenance",
        items: [
          { text: "Plan finalisé — fiche de scène J-0", link: `${outputsPrefix}/plan-de-soutenance-finalise` },
          { text: "Audit décisions 2026-05-05 (Garde/Update/Réétudie)", link: `${outputsPrefix}/audit-decisions-2026-05-05` },
          { text: "Matrice conformité grille + coach 25 mars (objective)", link: `${outputsPrefix}/matrice-conformite-grille-coach` },
          { text: "Audit backlog 50 épiques (2026-05-05)", link: `${outputsPrefix}/backlog-audit-2026-05-05` },
          { text: "Feature Couronnes (#739, roadmap v0.2+)", link: `${outputsPrefix}/feature-couronnes-roadmap-v02` },
          { text: "Influenceurs et canaux FR brassicoles", link: `${outputsPrefix}/influenceurs-canaux-fr` },
          { text: "Options de financement public FR (12 aides)", link: `${outputsPrefix}/financement-options-fr` },
          { text: "Tâches équipe 2026-05-06 (distribution par domaine)", link: `${outputsPrefix}/team-tasks-2026-05-06` },
          { text: "Plan de soutenance (stratégie + décisions)", link: `${outputsPrefix}/plan-presentation-27-mai` },
          { text: "Stratégie d'hébergement", link: `${outputsPrefix}/hosting-strategy` },
          { text: "Risques overview", link: "/risks-overview" },
          { text: "Risques et mitigations", link: `${outputsPrefix}/risk-analysis` },
          { text: "Q&A overview", link: "/qa-overview" },
          { text: "Q&A anticipées", link: `${outputsPrefix}/pitch-anticipated-qa` },
          { text: "Audit MVP", link: `${outputsPrefix}/audit-features-mvp` }
        ]
      },
      {
        text: "Slides et narration",
        items: [
          { text: "Pitch overview", link: "/pitch-overview" },
          { text: "Deck Canva — fichier de travail", link: `${outputsPrefix}/canva-working-deck` },
          { text: "Deck overview", link: "/slides-overview" },
          { text: "Squelette du deck", link: `${outputsPrefix}/slide-deck-outline` },
          { text: "Détail Canva v2 (post-restructure 2026-05-06) ⭐", link: `${outputsPrefix}/canva-slides-detail-v2` },
          { text: "Saynète V2 longue (4:30 Path C) ⭐", link: `${outputsPrefix}/pitch-hook-saynete-v2-long` },
          { text: "Tâches équipe 2026-05-06 ⭐", link: `${outputsPrefix}/team-tasks-2026-05-06` },
          { text: "Détail Canva v1 (archive)", link: `${outputsPrefix}/canva-slides-detail` },
          { text: "Scripts overview", link: "/scripts-overview" },
          { text: "Bloc 1 — cadrage", link: `${outputsPrefix}/pitch-script-bloc1-cadrage` },
          { text: "Bloc 2 — avant brassage", link: `${outputsPrefix}/pitch-script-bloc2-avant-brassage` },
          { text: "Bloc 3 — démo live", link: `${outputsPrefix}/pitch-script-bloc3-demo-live` },
          { text: "Bloc 4 — après brassage (ABSORBÉ saynète V2)", link: `${outputsPrefix}/pitch-script-bloc4-apres-brassage` },
          { text: "Bloc 5 — BM + perspectives", link: `${outputsPrefix}/pitch-script-bloc5-bm-perspectives` },
          { text: "Bloc 6 — conclusion", link: `${outputsPrefix}/pitch-script-bloc6-conclusion` },
          { text: "Transitions", link: `${outputsPrefix}/pitch-transitions` }
        ]
      },
      {
        text: "Ouverture et support",
        items: [
          { text: "Saynète — version courte", link: `${outputsPrefix}/pitch-hook-saynete-v1-cut` },
          { text: "Saynète — storyboard", link: `${outputsPrefix}/pitch-hook-saynete-storyboard` },
          { text: "Business model canvas", link: `${outputsPrefix}/business-model-canvas` },
          { text: "SMART par pôle", link: `${outputsPrefix}/smart-objectives-par-pole` },
          { text: "Web studio", link: `${outputsPrefix}/web-studio-brainstorming` }
        ]
      },
      {
        text: "Stratégie business approfondie",
        items: [
          { text: "Statut juridique — analyse et décision (Zone D)", link: `${outputsPrefix}/statut-juridique-analyse` },
          { text: "Recherche concurrentielle exhaustive (Zone B) ⭐", link: `${outputsPrefix}/recherche-concurrentielle-exhaustive` },
          { text: "Audit concurrence approfondi", link: `${outputsPrefix}/competitive-deep-dive` },
          { text: "Personas & monétisation", link: `${outputsPrefix}/personas-monetization` },
          { text: "Funnel & projection", link: `${outputsPrefix}/funnel-projection` },
          { text: "Paliers tarifaires", link: `${outputsPrefix}/pricing-tiers-definition` },
          { text: "Leviers de rétention", link: `${outputsPrefix}/retention-levers` },
          { text: "Stratégie IA", link: `${outputsPrefix}/ai-strategy` },
          { text: "Projections financières", link: `${outputsPrefix}/financial-projections` },
          { text: "CAPEX & financement", link: `${outputsPrefix}/capex-financement` },
          { text: "KPIs détaillés", link: `${outputsPrefix}/kpi-details` },
          { text: "Scénarios alternatifs", link: `${outputsPrefix}/scenarios-alternatifs` }
        ]
      },
      {
        text: "Références et historique",
        items: [
          { text: "Références overview", link: "/references-overview" },
          { text: "Index références", link: `${referencesPrefix}/README` },
          { text: "Grille pitch entrepreneurial", link: `${referencesPrefix}/grille-pitch-entrepreneurial` },
          { text: "Résumé session coach", link: `${referencesPrefix}/2026-03-25_coach-session-summary` },
          { text: "Historique overview", link: "/history-overview" },
          { text: "Débrief 2026-04-15", link: `${debriefPrefix}/2026-04-15_session-decisions` },
          { text: "Débrief 2026-04-16", link: `${debriefPrefix}/2026-04-16_session-decisions` },
          { text: "Débrief 2026-04-19", link: `${debriefPrefix}/2026-04-19_session-decisions` }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/benoit-bremaud/brasse-bouillon" }
    ],
    footer: {
      message: `Documentation de travail pour la soutenance Ydays du 27 mai 2026. <a href="/changelog">Version ${siteVersion}</a>`,
      copyright: "Brasse-Bouillon"
    },
    search: {
      provider: "local"
    },
    outline: {
      level: [2, 3]
    }
  }
};
