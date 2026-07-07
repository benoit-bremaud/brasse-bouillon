import { AcademyCorpus } from "../../domain";

// This file is generated from docs/academy by the Academy content generator.
// Do not edit manually.

export const academyCorpus: AcademyCorpus = {
  articles: [
    {
      slug: "introduction",
      metadata: {
        title: "Introduction au brassage",
        summary:
          "Carte d'ensemble du brassage pour relier ingredients, process, mesures et hygiene.",
        category: "getting-started",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["beginner", "process", "hygiene"],
        updatedAt: "2026-07-07",
        relatedArticles: ["houblons", "levures", "eau"],
        relatedGlossaryTerms: ["ibu", "profil-mineral"],
        relatedCalculators: [],
        learningObjectives: [
          "Understand the global brewing flow before optimizing details.",
          "Identify the four fundamental brewing ingredients.",
          "Recognize the main measurements followed during a batch.",
        ],
        prerequisites: [],
        teaches: [
          "brewing-overview",
          "brewing-ingredients",
          "sanitation-basics",
        ],
        sensitive: true,
        riskTopics: ["sanitation"],
        sources: [
          {
            id: "palmer-2017",
            kind: "book",
            title: "How to Brew",
            authors: ["John J. Palmer"],
            publisher: "Brewers Publications",
            url: "https://www.howtobrew.com/",
            accessedAt: "2026-07-03",
            year: 2017,
            notes: "General homebrewing reference for ingredients and process.",
          },
        ],
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-07",
          notes: ["Migrated from the legacy mobile Academy introduction."],
        },
      },
      body: {
        sections: [
          {
            id: "pourquoi-commencer",
            title: "Pourquoi commencer par l'introduction",
            blocks: [
              {
                id: "pourquoi-commencer-paragraph-1",
                type: "paragraph",
                text: "Cette fiche donne la carte d'ensemble du brassage : les ingredients, les etapes cles et les indicateurs a suivre. L'objectif est d'avoir une base solide avant d'entrer dans les chapitres techniques.",
                sourceIds: [],
              },
              {
                id: "definition-brassage",
                type: "definition",
                term: "Brassage",
                definition:
                  "Ensemble des operations qui transforment des ingredients, principalement eau, malt, houblon et levure, en biere fermentee et conditionnee.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-bonne-progression",
                type: "example",
                title: "Bonne progression",
                body: "Avant d'optimiser une recette, commence par comprendre ce que chaque etape change : extraction des sucres, sterilisation, fermentation, puis conditionnement.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "ingredients-fondamentaux",
            title: "Les 4 ingredients fondamentaux",
            blocks: [
              {
                id: "ingredients-fondamentaux-paragraph-1",
                type: "paragraph",
                text: "L'eau donne le volume et influence le pH ainsi que le profil gustatif. Le malt apporte les sucres fermentescibles, la couleur et une partie de la structure. Le houblon equilibre l'amertume et construit l'aromatique. La levure transforme les sucres en alcool, en dioxyde de carbone et en composes aromatiques.",
                sourceIds: [],
              },
              {
                id: "related-houblons",
                type: "relatedArticle",
                articleSlug: "houblons",
                sectionId: "role-du-houblon",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "related-levures",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "vue-ensemble-process",
            title: "Vue d'ensemble du process",
            blocks: [
              {
                id: "vue-ensemble-process-paragraph-1",
                type: "paragraph",
                text: "Un brassin suit une logique simple : empater pour convertir l'amidon en sucres, filtrer et rincer pour recuperer ces sucres, faire bouillir pour stabiliser le mout et ajouter le houblon, refroidir, ensemencer la levure, fermenter, puis conditionner.",
                sourceIds: [],
              },
              {
                id: "example-process",
                type: "example",
                title: "Lecture rapide du process",
                body: "Si une etape semble floue dans l'assistant de brassage, reviens a cette vue d'ensemble pour comprendre son role avant de suivre les details operationnels.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes-brassin",
            title: "Reperes a suivre sur chaque brassin",
            blocks: [
              {
                id: "reperes-brassin-paragraph-1",
                type: "paragraph",
                text: "Les reperes de base sont OG et FG pour suivre la fermentation, ABV pour estimer le taux d'alcool, IBU et EBC pour lire l'equilibre amertume/couleur, et le pH d'empatage pour surveiller l'extraction.",
                sourceIds: [],
              },
              {
                id: "ibu-reference",
                type: "glossaryReference",
                termSlug: "ibu",
                label: "IBU",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "hygiene",
            title: "Hygiene : regle non negociable",
            blocks: [
              {
                id: "hygiene-paragraph-1",
                type: "paragraph",
                text: "Tout ce qui touche le mout refroidi ou la biere doit etre nettoye puis desinfecte. Une contamination peut ruiner un brassin meme avec une recette parfaitement calculee.",
                sourceIds: [],
              },
              {
                id: "definition-nettoyer-desinfecter",
                type: "definition",
                term: "Nettoyer puis desinfecter",
                definition:
                  "Nettoyer retire les salissures visibles et les depots. Desinfecter reduit ensuite la charge microbienne sur un materiel deja propre.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "continuer",
            title: "Par ou continuer ensuite ?",
            blocks: [
              {
                id: "continuer-paragraph-1",
                type: "paragraph",
                text: "Continue avec les fermentescibles pour maitriser OG, FG et ABV, avec l'eau pour stabiliser pH et profil mineral, avec les levures pour fiabiliser la fermentation, puis avec le glossaire pour securiser le vocabulaire technique.",
                sourceIds: [],
              },
              {
                id: "related-eau",
                type: "relatedArticle",
                articleSlug: "eau",
                sectionId: "profil-mineral",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "houblons",
      metadata: {
        title: "Houblons",
        summary: "Reference guide for hop roles in brewing.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 6,
        tags: ["ingredients", "bitterness", "aroma"],
        updatedAt: "2026-07-03",
        relatedArticles: ["levures"],
        relatedGlossaryTerms: ["ibu", "acide-alpha"],
        relatedCalculators: [
          {
            slug: "houblons",
            label: "Hop calculator",
            reason: "Estimate bitterness from hop additions.",
            target: {
              type: "calculator",
              slug: "houblons",
            },
          },
        ],
        learningObjectives: [
          "Identify the main brewing roles of hops.",
          "Distinguish bitterness additions from aroma additions.",
        ],
        prerequisites: [],
        teaches: ["hop-bitterness", "hop-aroma"],
        sensitive: false,
        riskTopics: [],
        sources: [
          {
            id: "palmer-2017",
            kind: "book",
            title: "How to Brew",
            authors: ["John J. Palmer"],
            publisher: "Brewers Publications",
            url: "https://www.howtobrew.com/",
            accessedAt: "2026-07-03",
            year: 2017,
            notes: "General homebrewing reference for ingredients and process.",
          },
        ],
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-03",
          notes: ["Initial pilot article review."],
        },
      },
      body: {
        sections: [
          {
            id: "role-du-houblon",
            title: "Role du houblon",
            blocks: [
              {
                id: "role-du-houblon-paragraph-1",
                type: "paragraph",
                text: "Le houblon apporte principalement de l'amertume, des aromes, des saveurs et une part de stabilite microbiologique. Pour un debutant, la premiere distinction a retenir est simple : plus l'ajout est long pendant l'ebullition, plus il sert l'amertume ; plus il est tardif, plus il preserve les aromes.",
                sourceIds: [],
              },
              {
                id: "definition-acide-alpha",
                type: "definition",
                term: "Acide alpha",
                definition:
                  "Compose du houblon qui se transforme pendant l'ebullition et contribue a l'amertume mesuree en IBU.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-ajout-tardif",
                type: "example",
                title: "Ajout tardif",
                body: "Un ajout dans les dernieres minutes d'ebullition ou en whirlpool favorisera davantage l'expression aromatique qu'un ajout de debut d'ebullition.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "ibu-reference",
                type: "glossaryReference",
                termSlug: "ibu",
                label: "IBU",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "hop-calculator",
                type: "calculatorCta",
                calculatorSlug: "houblons",
                title: "Calculer une amertume cible",
                description:
                  "Utiliser le calculateur houblons pour estimer les IBU d'une recette.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "levures",
      metadata: {
        title: "Levures",
        summary:
          "Reference guide for fermentation, yeast roles, pitch rate, and temperature control.",
        category: "fermentation",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["fermentation", "yeast", "temperature"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "houblons"],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "levures",
            label: "Yeast calculator",
            reason: "Estimate pitch rate and fermentation planning.",
            target: {
              type: "calculator",
              slug: "levures",
            },
          },
        ],
        learningObjectives: [
          "Explain what yeast changes during fermentation.",
          "Identify the main levers of a healthy fermentation.",
          "Understand why pitch rate and temperature matter.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: [
          "fermentation-basics",
          "yeast-pitch-rate",
          "fermentation-temperature",
        ],
        sensitive: true,
        riskTopics: ["fermentation-health", "sanitation"],
        sources: [
          {
            id: "palmer-2017",
            kind: "book",
            title: "How to Brew",
            authors: ["John J. Palmer"],
            publisher: "Brewers Publications",
            url: "https://www.howtobrew.com/",
            accessedAt: "2026-07-03",
            year: 2017,
            notes: "General homebrewing reference for ingredients and process.",
          },
        ],
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-07",
          notes: ["Migrated from the legacy mobile Academy yeast topic."],
        },
      },
      body: {
        sections: [
          {
            id: "fermentation",
            title: "Pourquoi la levure est critique",
            blocks: [
              {
                id: "fermentation-paragraph-1",
                type: "paragraph",
                text: "La levure transforme le mout sucre en alcool, en dioxyde de carbone et en composes aromatiques. C'est elle qui fait passer une recette correcte a une biere propre, expressive et stable.",
                sourceIds: [],
              },
              {
                id: "definition-attenuation",
                type: "definition",
                term: "Attenuation",
                definition:
                  "Part des sucres fermentescibles consommee par la levure. Elle influence directement la densite finale, le corps et la sensation de secheresse.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-yeast-impact",
                type: "example",
                title: "Impact concret",
                body: "Deux recettes identiques peuvent donner des bieres tres differentes si l'une fermente proprement dans la plage de temperature de la souche et l'autre trop chaud.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "piliers-fermentation",
            title: "Les 4 piliers d'une fermentation reussie",
            blocks: [
              {
                id: "piliers-fermentation-paragraph-1",
                type: "paragraph",
                text: "Une fermentation fiable repose sur quatre leviers : une quantite suffisante de cellules au depart, une levure viable, une temperature adaptee a la souche, et un mout correctement prepare pour permettre un bon depart de fermentation.",
                sourceIds: [],
              },
              {
                id: "definition-pitch-rate",
                type: "definition",
                term: "Pitch rate",
                definition:
                  "Quantite de cellules de levure ensemencees par volume de mout et par degre Plato. Un pitch rate adapte reduit les risques de fermentation lente ou incomplete.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "yeast-calculator",
                type: "calculatorCta",
                calculatorSlug: "levures",
                title: "Estimer la quantite de levure",
                description:
                  "Utiliser le calculateur levures pour relier volume, densite initiale et besoin en cellules.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes-rapides",
            title: "Reperes rapides",
            blocks: [
              {
                id: "reperes-rapides-paragraph-1",
                type: "paragraph",
                text: "Pour une Ale, un repere courant est environ 0,75 million de cellules par mL et par degre Plato. Pour une Lager, le besoin est souvent plus eleve, autour de 1,5 million de cellules par mL et par degre Plato. Ces valeurs restent des reperes pratiques : la souche, la fraicheur et le fabricant comptent aussi.",
                sourceIds: [],
              },
              {
                id: "example-ipa-20l",
                type: "example",
                title: "IPA de 20 L",
                body: "Avec une OG proche de 1,065, le besoin peut approcher plusieurs centaines de milliards de cellules pour une Ale. En pratique, cela conduit souvent a verifier le nombre de sachets ou l'interet d'un starter.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "temperature",
            title: "Temperature et impact aromatique",
            blocks: [
              {
                id: "temperature-paragraph-1",
                type: "paragraph",
                text: "La temperature est un levier majeur sur les esters, les phenols et les off-flavors. Plus bas ne veut pas toujours dire meilleur : il faut surtout rester dans la plage utile de la souche. Trop chaud augmente les risques d'aromes de solvant ou d'alcools superieurs ; trop froid peut ralentir ou bloquer la fermentation.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "pieges",
            title: "Pieges frequents a eviter",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes sont le sous-pitch, une levure trop vieille, un mauvais controle de temperature, une oxygenation insuffisante du mout avant ensemencement, et l'oubli d'une phase de repos adaptee sur certaines Lagers.",
                sourceIds: [],
              },
              {
                id: "related-hops",
                type: "relatedArticle",
                articleSlug: "houblons",
                sectionId: "role-du-houblon",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "eau",
      metadata: {
        title: "Eau de brassage",
        summary: "Reference guide for the main brewing water concepts.",
        category: "water",
        level: "beginner",
        status: "draft",
        version: "0.1.0",
        estimatedReadTimeMinutes: 7,
        tags: ["water", "minerals", "mash"],
        updatedAt: "2026-07-03",
        relatedArticles: [],
        relatedGlossaryTerms: ["profil-mineral"],
        relatedCalculators: [
          {
            slug: "eau",
            label: "Water calculator",
            reason: "Adjust a water profile for a recipe.",
            target: {
              type: "calculator",
              slug: "eau",
            },
          },
        ],
        learningObjectives: [
          "Understand why water composition matters for brewing.",
          "Identify the main mineral families used in brewing water adjustments.",
        ],
        prerequisites: [],
        teaches: ["water-profile"],
        sensitive: true,
        riskTopics: ["chemical-dosage"],
        sources: [
          {
            id: "brun-water-knowledge",
            kind: "website",
            title: "Bru'n Water Knowledge",
            authors: ["Martin Brungard"],
            publisher: "Bru'n Water",
            url: "https://www.brunwater.com/water-knowledge",
            accessedAt: "2026-07-03",
            year: null,
            notes: "Practical brewing water chemistry reference.",
          },
        ],
        review: null,
      },
      body: {
        sections: [
          {
            id: "profil-mineral",
            title: "Profil mineral",
            blocks: [
              {
                id: "profil-mineral-paragraph-1",
                type: "paragraph",
                text: "L'eau de brassage contient des ions qui influencent le pH d'empatage, la perception de l'amertume et la rondeur de la biere. Les ajustements chimiques doivent rester progressifs, mesures et sources.",
                sourceIds: [],
              },
              {
                id: "water-profile-reference",
                type: "glossaryReference",
                termSlug: "profil-mineral",
                label: "Profil mineral",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
        ],
      },
    },
  ],
  glossaryTerms: [
    {
      slug: "ibu",
      label: "IBU",
      aliases: ["International Bitterness Units"],
      shortDefinition: "Bitterness estimate used for beer recipes.",
      detailedDefinition:
        "IBU estimates the concentration of bittering compounds contributed mostly by hops after boiling.",
      relatedTerms: ["acide-alpha"],
      sources: [
        {
          id: "palmer-2017",
          kind: "book",
          title: "How to Brew",
          authors: ["John J. Palmer"],
          publisher: "Brewers Publications",
          url: "https://www.howtobrew.com/",
          accessedAt: "2026-07-03",
          year: 2017,
          notes: "General homebrewing reference for ingredients and process.",
        },
      ],
    },
    {
      slug: "acide-alpha",
      label: "Acide alpha",
      aliases: ["alpha acid"],
      shortDefinition: "Hop resin contributing to beer bitterness.",
      detailedDefinition:
        "Alpha acids are hop compounds that isomerize during boiling and contribute bitterness.",
      relatedTerms: ["ibu"],
      sources: [
        {
          id: "palmer-2017",
          kind: "book",
          title: "How to Brew",
          authors: ["John J. Palmer"],
          publisher: "Brewers Publications",
          url: "https://www.howtobrew.com/",
          accessedAt: "2026-07-03",
          year: 2017,
          notes: "General homebrewing reference for ingredients and process.",
        },
      ],
    },
    {
      slug: "profil-mineral",
      label: "Profil mineral",
      aliases: ["water profile"],
      shortDefinition: "Mineral composition of brewing water.",
      detailedDefinition:
        "A mineral profile summarizes ions such as calcium, sulfate, chloride, sodium, magnesium, and bicarbonate.",
      relatedTerms: [],
      sources: [
        {
          id: "brun-water-knowledge",
          kind: "website",
          title: "Bru'n Water Knowledge",
          authors: ["Martin Brungard"],
          publisher: "Bru'n Water",
          url: "https://www.brunwater.com/water-knowledge",
          accessedAt: "2026-07-03",
          year: null,
          notes: "Practical brewing water chemistry reference.",
        },
      ],
    },
  ],
  sources: [
    {
      id: "palmer-2017",
      kind: "book",
      title: "How to Brew",
      authors: ["John J. Palmer"],
      publisher: "Brewers Publications",
      url: "https://www.howtobrew.com/",
      accessedAt: "2026-07-03",
      year: 2017,
      notes: "General homebrewing reference for ingredients and process.",
    },
    {
      id: "bjcp-2021",
      kind: "standard",
      title: "BJCP Beer Style Guidelines",
      authors: ["Beer Judge Certification Program"],
      publisher: "BJCP",
      url: "https://www.bjcp.org/bjcp-style-guidelines/",
      accessedAt: "2026-07-03",
      year: 2021,
      notes: "Style and sensory reference.",
    },
    {
      id: "brun-water-knowledge",
      kind: "website",
      title: "Bru'n Water Knowledge",
      authors: ["Martin Brungard"],
      publisher: "Bru'n Water",
      url: "https://www.brunwater.com/water-knowledge",
      accessedAt: "2026-07-03",
      year: null,
      notes: "Practical brewing water chemistry reference.",
    },
  ],
  calculatorSlugs: ["houblons", "levures", "eau"],
};
