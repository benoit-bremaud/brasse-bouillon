const fontHead = [
  ["meta", { name: "robots", content: "noindex, nofollow" }],
  ["meta", { name: "googlebot", content: "noindex, nofollow" }],
  ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
  ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
  [
    "link",
    {
      rel: "stylesheet",
      href:
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700;800&display=swap"
    }
  ]
];

// Marketing-study plan order (A → B → C → D), French (root) sidebar.
const sidebarFr = [
  { text: "Rapport", items: [{ text: "Vue d'ensemble", link: "/" }] },
  {
    text: "A — Cadrage",
    collapsed: false,
    items: [{ text: "Objectifs, périmètre & méthode", link: "/00-method" }]
  },
  {
    text: "B — Analyse de marché",
    collapsed: false,
    items: [
      { text: "B1 · Environnement (PESTEL)", link: "/b1-environnement" },
      { text: "B2 · Marché & taille", link: "/03c-desk-market-data" },
      { text: "B2 · Marché français", link: "/03d-desk-french-market" },
      { text: "B3 · Demande & besoins — Reddit", link: "/02-desk-reddit" },
      { text: "B3 · Demande & besoins — Forums", link: "/03-desk-forums" },
      { text: "B3 · Demande & besoins — Sources FR", link: "/03b-desk-french" },
      { text: "B4 · Concurrence", link: "/01-desk-competitors" },
      { text: "B4 · SWOT", link: "/b4-swot" }
    ]
  },
  {
    text: "C — Terrain (recherche primaire)",
    collapsed: false,
    items: [
      { text: "Guide d'entretien", link: "/05-interview-guide" },
      { text: "Sondage (questionnaire)", link: "/c-sondage" },
      { text: "Kit de diffusion", link: "/c-diffusion" },
      { text: "Résultats", link: "/c-resultats" }
    ]
  },
  {
    text: "D — Recommandation",
    collapsed: false,
    items: [
      { text: "Synthèse & positionnement", link: "/04-synthesis" },
      { text: "Backlog priorisé (besoins → features)", link: "/04b-prioritized-backlog" },
      { text: "Lean Canvas", link: "/lean-canvas" },
      { text: "Stratégie & plan d'action", link: "/d-strategie" }
    ]
  }
];

// English (/en/) sidebar — same plan order.
const sidebarEn = [
  { text: "Report", items: [{ text: "Overview", link: "/en/" }] },
  {
    text: "A — Scope",
    collapsed: false,
    items: [{ text: "Objectives, scope & method", link: "/en/00-method" }]
  },
  {
    text: "B — Market analysis",
    collapsed: false,
    items: [
      { text: "B1 · Environment (PESTEL)", link: "/en/b1-environnement" },
      { text: "B2 · Market & sizing", link: "/en/03c-desk-market-data" },
      { text: "B2 · French market", link: "/en/03d-desk-french-market" },
      { text: "B3 · Demand & needs — Reddit", link: "/en/02-desk-reddit" },
      { text: "B3 · Demand & needs — Forums", link: "/en/03-desk-forums" },
      { text: "B3 · Demand & needs — French sources", link: "/en/03b-desk-french" },
      { text: "B4 · Competition", link: "/en/01-desk-competitors" },
      { text: "B4 · SWOT", link: "/en/b4-swot" }
    ]
  },
  {
    text: "C — Field (primary research)",
    collapsed: false,
    items: [
      { text: "Interview guide", link: "/en/05-interview-guide" },
      { text: "Survey (questionnaire)", link: "/en/c-survey" },
      { text: "Distribution kit", link: "/en/c-distribution" },
      { text: "Results", link: "/en/c-resultats" }
    ]
  },
  {
    text: "D — Recommendation",
    collapsed: false,
    items: [
      { text: "Synthesis & positioning", link: "/en/04-synthesis" },
      { text: "Prioritized backlog (needs → features)", link: "/en/04b-prioritized-backlog" },
      { text: "Lean Canvas", link: "/en/lean-canvas" },
      { text: "Strategy & action plan", link: "/en/d-strategie" }
    ]
  }
];

/** @type {import('vitepress').UserConfig} */
export default {
  title: "Brasse-Bouillon — Étude de besoins",
  description:
    "Étude de besoins marketing pour Brasse-Bouillon : cadrage, analyse de marché, terrain et recommandations (epic #1075).",
  head: fontHead,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1075" }
    ],
    search: { provider: "local" }
  },
  locales: {
    root: {
      label: "Français",
      lang: "fr-FR",
      themeConfig: {
        siteTitle: "Étude de besoins · Brasse-Bouillon",
        nav: [
          { text: "Accueil", link: "/" },
          { text: "Synthèse", link: "/04-synthesis" },
          { text: "Backlog", link: "/04b-prioritized-backlog" },
          { text: "Canvas", link: "/lean-canvas" },
          { text: `epic #1075`, link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1075" }
        ],
        sidebar: sidebarFr,
        outline: { level: [2, 3], label: "Sur cette page" },
        docFooter: { prev: "Précédent", next: "Suivant" },
        lastUpdatedText: "Dernière mise à jour",
        footer: {
          message:
            'Étude de besoins marketing — hypothèses à confirmer par le terrain. Suivi sur <a href="https://github.com/benoit-bremaud/brasse-bouillon/issues/1075">epic #1075</a>.',
          copyright: "Brasse-Bouillon · Étude de besoins"
        }
      }
    },
    en: {
      label: "English",
      lang: "en",
      link: "/en/",
      themeConfig: {
        siteTitle: "Needs Study · Brasse-Bouillon",
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Synthesis", link: "/en/04-synthesis" },
          { text: "Backlog", link: "/en/04b-prioritized-backlog" },
          { text: "Canvas", link: "/en/lean-canvas" },
          { text: `epic #1075`, link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1075" }
        ],
        sidebar: sidebarEn,
        outline: { level: [2, 3], label: "On this page" },
        footer: {
          message:
            'Marketing needs study — hypotheses pending field confirmation. Tracked on <a href="https://github.com/benoit-bremaud/brasse-bouillon/issues/1075">epic #1075</a>.',
          copyright: "Brasse-Bouillon · Needs Study"
        }
      }
    }
  }
};
