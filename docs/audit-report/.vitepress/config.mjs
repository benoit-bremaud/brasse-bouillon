import pkg from "../package.json" with { type: "json" };

const siteVersion = pkg.version;

/** @type {import('vitepress').UserConfig} */
export default {
  title: "Audit brasse-bouillon.com",
  description:
    "Compte rendu d'audit qualité & sécurité du site brasse-bouillon.com — 2026-05-21 (epic #1031).",
  head: [
    ["meta", { name: "robots", content: "noindex, nofollow" }],
    ["meta", { name: "googlebot", content: "noindex, nofollow" }],
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href:
          "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
      }
    ]
  ],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  lang: "fr-FR",
  themeConfig: {
    siteTitle: "Audit · brasse-bouillon.com",
    nav: [
      { text: "Synthèse", link: "/" },
      { text: "Constats", link: "/findings" },
      { text: "Remédiation", link: "/remediation" },
      { text: "Méthodologie", link: "/methodology" },
      { text: "Historique", link: "/historique" },
      { text: `v${siteVersion}`, link: "/historique" }
    ],
    sidebar: [
      {
        text: "Audit du 2026-05-21 (dernier)",
        collapsed: false,
        items: [
          { text: "Synthèse exécutive", link: "/" },
          { text: "Constats détaillés", link: "/findings" },
          { text: "Plan de remédiation", link: "/remediation" },
          { text: "Méthodologie & périmètre", link: "/methodology" }
        ]
      },
      {
        text: "Historique",
        items: [{ text: "Tous les audits", link: "/historique" }]
      }
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1031"
      }
    ],
    footer: {
      message:
        'Audit qualité & sécurité — périmètre site live + <code>packages/website</code>. Suivi des constats sur <a href="https://github.com/benoit-bremaud/brasse-bouillon/issues/1031">epic #1031</a>.',
      copyright: "Brasse-Bouillon · 2026-05-21"
    },
    search: { provider: "local" },
    outline: { level: [2, 3], label: "Sur cette page" }
  }
};
