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
          { text: "Plan de soutenance", link: `${outputsPrefix}/plan-presentation-27-mai` },
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
          { text: "Détail Canva", link: `${outputsPrefix}/canva-slides-detail` },
          { text: "Scripts overview", link: "/scripts-overview" },
          { text: "Bloc 1 — cadrage", link: `${outputsPrefix}/pitch-script-bloc1-cadrage` },
          { text: "Bloc 2 — avant brassage", link: `${outputsPrefix}/pitch-script-bloc2-avant-brassage` },
          { text: "Bloc 3 — démo live", link: `${outputsPrefix}/pitch-script-bloc3-demo-live` },
          { text: "Bloc 4 — après brassage", link: `${outputsPrefix}/pitch-script-bloc4-apres-brassage` },
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
