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
          "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..900&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
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
      { text: "Historique", link: "/" },
      { text: "Dernier audit (2026-05-21)", link: "/2026-05-21/" },
      { text: `v${siteVersion}`, link: "/" }
    ],
    sidebar: [
      {
        text: "Historique",
        items: [{ text: "Tous les audits", link: "/" }]
      },
      {
        text: "Audit du 2026-05-21",
        collapsed: false,
        items: [
          { text: "Synthèse exécutive", link: "/2026-05-21/" },
          { text: "Constats détaillés", link: "/2026-05-21/findings" },
          { text: "Plan de remédiation", link: "/2026-05-21/remediation" },
          { text: "Méthodologie & périmètre", link: "/2026-05-21/methodology" }
        ]
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
