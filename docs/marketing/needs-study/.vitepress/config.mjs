import pkg from "../package.json" with { type: "json" };

const siteVersion = pkg.version;

/** @type {import('vitepress').UserConfig} */
export default {
  title: "Brasse-Bouillon — Needs Study",
  description:
    "Marketing needs study for Brasse-Bouillon: desk research, synthesis, prioritized needs, and primary-research plan (epic #1075).",
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
          "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700;800&display=swap"
      }
    ]
  ],
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  lang: "en",
  themeConfig: {
    siteTitle: "Needs Study · Brasse-Bouillon",
    nav: [
      { text: "Home", link: "/" },
      { text: "Synthesis", link: "/04-synthesis" },
      { text: "Method", link: "/00-method" },
      { text: "Interview guide", link: "/05-interview-guide" },
      { text: `epic #1075`, link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1075" }
    ],
    sidebar: [
      {
        text: "Report",
        collapsed: false,
        items: [
          { text: "Overview", link: "/" },
          { text: "Synthesis & positioning", link: "/04-synthesis" }
        ]
      },
      {
        text: "Secondary research (desk)",
        collapsed: false,
        items: [
          { text: "Method", link: "/00-method" },
          { text: "Competitor reviews", link: "/01-desk-competitors" },
          { text: "r/Homebrewing", link: "/02-desk-reddit" },
          { text: "Forums (EN + FR)", link: "/03-desk-forums" },
          { text: "French sources", link: "/03b-desk-french" },
          { text: "Market / quant data", link: "/03c-desk-market-data" },
          { text: "French market", link: "/03d-desk-french-market" }
        ]
      },
      {
        text: "Primary research",
        collapsed: false,
        items: [{ text: "Interview guide", link: "/05-interview-guide" }]
      }
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/benoit-bremaud/brasse-bouillon/issues/1075"
      }
    ],
    footer: {
      message:
        'Marketing needs study — hypotheses pending primary-research confirmation. Tracked on <a href="https://github.com/benoit-bremaud/brasse-bouillon/issues/1075">epic #1075</a>.',
      copyright: "Brasse-Bouillon · Needs Study"
    },
    search: { provider: "local" },
    outline: { level: [2, 3], label: "On this page" }
  }
};
