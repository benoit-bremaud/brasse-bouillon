import { AcademyCorpus } from "../../domain";

// This file is generated from docs/academy by the Academy content generator.
// Do not edit manually.

export const academyCorpus: AcademyCorpus = {
  articles: [
    {
      slug: "histoire",
      metadata: {
        title: "Histoire de la bière",
        summary:
          "Repère historique pour comprendre comment céréales, fermentation, houblon, levure, styles et science ont façonné la bière moderne.",
        category: "history",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 10,
        tags: ["history", "culture", "fermentation", "styles"],
        updatedAt: "2026-07-13",
        relatedArticles: [
          "introduction",
          "fermentescibles",
          "houblons",
          "levures",
          "eau",
        ],
        relatedGlossaryTerms: [
          "fermentation",
          "malt",
          "mout",
          "houblon",
          "cervoise",
          "gruit",
          "bappir",
          "reinheitsgebot",
          "lager",
        ],
        relatedCalculators: [],
        learningObjectives: [
          "Comprendre pourquoi la bière moderne ne résulte pas d'une invention unique.",
          "Identifier les grands tournants historiques qui structurent encore le brassage.",
          "Relier histoire, ingrédients, styles et maîtrise technique du brasseur.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: [
          "beer-history-overview",
          "brewing-culture",
          "historical-brewing-turning-points",
        ],
        sensitive: false,
        riskTopics: [],
        sources: [
          {
            id: "liu-raqefet-2018",
            kind: "article",
            title:
              "Fermented beverage and food storage in 13,000 y-old stone mortars at Raqefet Cave, Israel: Investigating Natufian ritual feasting",
            authors: [
              "Li Liu",
              "Jiajing Wang",
              "Danny Rosenberg",
              "Hao Zhao",
              "György Lengyel",
              "Dani Nadel",
            ],
            publisher: "Journal of Archaeological Science: Reports",
            url: "https://www.sciencedirect.com/science/article/pii/S2352409X18303468",
            accessedAt: "2026-07-13",
            year: 2018,
            notes:
              "Archaeological evidence for early cereal-based fermented beverage residues at Raqefet Cave.",
          },
          {
            id: "etcsl-ninkasi",
            kind: "website",
            title: "A hymn to Ninkasi",
            authors: ["The Electronic Text Corpus of Sumerian Literature"],
            publisher: "University of Oxford",
            url: "https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=t.4.23.1",
            accessedAt: "2026-07-13",
            year: 2006,
            notes:
              "Sumerian literary source used as a textual anchor for ancient brewing vocabulary and process imagery.",
          },
          {
            id: "hornsey-2003",
            kind: "book",
            title: "A History of Beer and Brewing",
            authors: ["Ian S. Hornsey"],
            publisher: "Royal Society of Chemistry",
            url: null,
            accessedAt: null,
            year: 2003,
            notes:
              "General reference for historical brewing development, ingredients, and industrialization.",
          },
          {
            id: "wired-reinheitsgebot-2010",
            kind: "article",
            title: "April 23, 1516: Bavaria Cracks Down on Beer Brewers",
            authors: ["Betsy Mason"],
            publisher: "WIRED",
            url: "https://www.wired.com/2010/04/0423deutsche-reinheitsgebot-german-beer-purity-law/",
            accessedAt: "2026-07-13",
            year: 2010,
            notes:
              "Contextual article on the 1516 Bavarian beer regulation and later purity-law framing.",
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
        ],
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-13",
          notes: [
            "First generated history article replacing the legacy coming-soon topic.",
            "Historical wording keeps uncertainty explicit where archaeology remains interpretive.",
          ],
        },
      },
      body: {
        sections: [
          {
            id: "pourquoi-histoire",
            title: "Pourquoi l'histoire compte",
            blocks: [
              {
                id: "pourquoi-histoire-paragraph-1",
                type: "paragraph",
                text: "L'histoire de la bière n'est pas une ligne droite qui partirait d'une recette ancienne pour arriver aux IPA et aux lagers actuelles. C'est plutôt une suite d'adaptations : céréales disponibles, outils de cuisson, règles locales, commerce, conservation, science de la fermentation et attentes des buveurs.",
                sourceIds: [],
              },
              {
                id: "pourquoi-histoire-paragraph-2",
                type: "paragraph",
                text: "Pour un brasseur, cette histoire sert à lire les choix techniques modernes. Le malt n'est pas seulement une source de sucre, le houblon n'a pas toujours été la plante dominante, la levure n'a pas toujours été comprise, et les styles ne sont pas des lois naturelles. Ils sont le résultat de contraintes historiques.",
                sourceIds: [],
              },
              {
                id: "definition-biere-historique",
                type: "definition",
                term: "Bière historique",
                definition:
                  "Dans cette fiche, bière désigne largement une boisson fermentée à base de céréales. Les boissons anciennes ne correspondent pas toujours à la bière moderne filtrée, houblonnée et contrôlée.",
                sourceIds: ["hornsey-2003"],
              },
            ],
          },
          {
            id: "avant-recettes",
            title: "Avant les recettes écrites",
            blocks: [
              {
                id: "avant-recettes-paragraph-1",
                type: "paragraph",
                text: "Les plus anciens indices solides d'une boisson fermentée à base de céréales viennent des mortiers de la grotte de Raqefet, dans un contexte natoufien daté d'environ 13 000 ans avant aujourd'hui. Ce n'est pas une recette complète : les chercheurs interprètent des résidus, des amidons modifiés et des traces d'usage comme des indices de fermentation céréalière.",
                sourceIds: [],
              },
              {
                id: "avant-recettes-paragraph-2",
                type: "paragraph",
                text: "Ce point est important : la bière ne commence pas forcément avec une brasserie, un style ou un texte. Elle commence quand des humains comprennent que des céréales trempées, chauffées ou mâchées peuvent donner une boisson nourrissante et fermentée. L'histoire commence donc avec des pratiques, pas avec une marque ou une norme.",
                sourceIds: [],
              },
              {
                id: "example-raqefet",
                type: "example",
                title: "Ce que montre Raqefet",
                body: "Raqefet ne prouve pas l'existence d'une bière moderne. Le site montre plutôt que des boissons céréalières fermentées pouvaient déjà accompagner des moments sociaux ou rituels très anciens.",
                sourceIds: ["liu-raqefet-2018"],
              },
            ],
          },
          {
            id: "mesopotamie-egypte",
            title: "Mésopotamie et Égypte",
            blocks: [
              {
                id: "mesopotamie-egypte-paragraph-1",
                type: "paragraph",
                text: "La Mésopotamie donne l'un des grands repères écrits de l'histoire brassicole : l'hymne à Ninkasi. Ce texte sumérien ne ressemble pas à une fiche technique moderne, mais il décrit un imaginaire de brassage avec pain de bière, malt, moût, cuve et filtration. Il montre que la bière est déjà un objet culturel, alimentaire et économique.",
                sourceIds: [],
              },
              {
                id: "mesopotamie-egypte-paragraph-2",
                type: "paragraph",
                text: "L'Égypte ancienne confirme la même idée générale : les boissons céréalières fermentées peuvent être quotidiennes, nourrissantes, liées au travail, aux offrandes et aux échanges. Elles restent cependant différentes de nos bières : la filtration, la conservation, le niveau de gaz, l'amertume et la stabilité microbiologique n'ont pas le même sens qu'aujourd'hui.",
                sourceIds: [],
              },
              {
                id: "definition-bappir",
                type: "definition",
                term: "Bappir",
                definition:
                  "Pain ou préparation céréalière associée au brassage mésopotamien, souvent évoquée comme support de sucres et d'arômes dans les reconstructions historiques.",
                sourceIds: ["etcsl-ninkasi", "hornsey-2003"],
              },
              {
                id: "glossary-bappir",
                type: "glossaryReference",
                termSlug: "bappir",
                label: "Bappir",
                sourceIds: ["etcsl-ninkasi"],
              },
            ],
          },
          {
            id: "cervoise-houblon",
            title: "De la cervoise au houblon",
            blocks: [
              {
                id: "cervoise-houblon-paragraph-1",
                type: "paragraph",
                text: "En Europe, le mot cervoise aide à comprendre la période où la bière n'est pas encore définie par le houblon. Des plantes aromatiques, souvent regroupées sous le terme gruit, peuvent apporter amertume, parfum, conservation partielle ou signature locale. La recette dépend alors fortement du territoire et des usages.",
                sourceIds: [],
              },
              {
                id: "cervoise-houblon-paragraph-2",
                type: "paragraph",
                text: "Le houblon change progressivement la grammaire de la bière. Il apporte une amertume plus stable, des composés aromatiques distinctifs et une meilleure tenue dans le temps. Sa diffusion ne se résume pas au goût : elle touche aussi la conservation, le commerce, la fiscalité et la standardisation progressive des recettes.",
                sourceIds: [],
              },
              {
                id: "glossary-cervoise",
                type: "glossaryReference",
                termSlug: "cervoise",
                label: "Cervoise",
                sourceIds: ["hornsey-2003"],
              },
              {
                id: "glossary-gruit",
                type: "glossaryReference",
                termSlug: "gruit",
                label: "Gruit",
                sourceIds: ["hornsey-2003"],
              },
              {
                id: "related-houblons",
                type: "relatedArticle",
                articleSlug: "houblons",
                sectionId: "role-du-houblon",
                sourceIds: ["hornsey-2003"],
              },
            ],
          },
          {
            id: "reglementer-biere",
            title: "Réglementer la bière",
            blocks: [
              {
                id: "reglementer-biere-paragraph-1",
                type: "paragraph",
                text: "La bière devient vite un produit à encadrer : elle engage les céréales, les prix, les taxes, la santé publique, les privilèges de production et la confiance du consommateur. Le Reinheitsgebot bavarois de 1516 est souvent présenté comme une pure loi de qualité. C'est plus utile de le lire comme une réglementation historique située, liée aux matières premières autorisées, aux prix et à l'organisation du marché.",
                sourceIds: [],
              },
              {
                id: "reglementer-biere-paragraph-2",
                type: "paragraph",
                text: "La levure n'y apparaît pas comme ingrédient au sens moderne, car la microbiologie n'existe pas encore. C'est une bonne leçon pour lire les textes anciens : une règle peut avoir un effet durable sans que ses auteurs comprennent toutes les causes biologiques derrière le brassage.",
                sourceIds: [],
              },
              {
                id: "definition-reinheitsgebot",
                type: "definition",
                term: "Reinheitsgebot",
                definition:
                  "Réglementation bavaroise de 1516 souvent appelée loi de pureté de la bière. Elle doit être comprise dans son contexte économique, agricole et juridique, pas comme une recette universelle.",
                sourceIds: ["wired-reinheitsgebot-2010", "hornsey-2003"],
              },
              {
                id: "glossary-reinheitsgebot",
                type: "glossaryReference",
                termSlug: "reinheitsgebot",
                label: "Reinheitsgebot",
                sourceIds: ["wired-reinheitsgebot-2010"],
              },
            ],
          },
          {
            id: "science-industrie",
            title: "Science et industrie",
            blocks: [
              {
                id: "science-industrie-paragraph-1",
                type: "paragraph",
                text: "La bière moderne devient beaucoup plus répétable quand les brasseurs disposent d'outils de mesure, de contrôle thermique et de connaissances microbiologiques. Le thermomètre, le densimètre, les travaux sur la levure, la réfrigération et la pasteurisation déplacent le brassage d'un savoir empirique vers un process contrôlable.",
                sourceIds: [],
              },
              {
                id: "science-industrie-paragraph-2",
                type: "paragraph",
                text: "La lager illustre ce tournant. Elle n'est pas seulement une famille de styles : elle dépend aussi d'une fermentation plus froide, d'une maturation longue, d'une maîtrise de la levure et, plus tard, de capacités industrielles de froid. Ce que l'on appelle aujourd'hui une bière propre, claire et stable est donc très lié à l'histoire technique.",
                sourceIds: [],
              },
              {
                id: "glossary-lager",
                type: "glossaryReference",
                termSlug: "lager",
                label: "Lager",
                sourceIds: ["hornsey-2003", "bjcp-2021"],
              },
              {
                id: "related-levures",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
                sourceIds: ["hornsey-2003"],
              },
            ],
          },
          {
            id: "renouveau-artisanal",
            title: "Renouveau artisanal",
            blocks: [
              {
                id: "renouveau-artisanal-paragraph-1",
                type: "paragraph",
                text: "Le renouveau artisanal ne revient pas simplement au passé. Il réouvre plutôt le champ des possibles : styles oubliés, houblonnage expressif, levures spécialisées, malts plus typés, fermentation mixte, bières locales et recettes expérimentales. Les guides de styles modernes aident à nommer ces familles, mais ils ne doivent pas être lus comme des frontières immuables.",
                sourceIds: [],
              },
              {
                id: "renouveau-artisanal-paragraph-2",
                type: "paragraph",
                text: "Pour le brasseur amateur, c'est une liberté utile. On peut brasser une bière historiquement inspirée sans prétendre reproduire exactement une boisson ancienne. La bonne question devient : quel élément historique veut-on explorer, et quel contrôle moderne veut-on garder pour obtenir une bière stable et bonne ?",
                sourceIds: [],
              },
              {
                id: "related-fermentescibles",
                type: "relatedArticle",
                articleSlug: "fermentescibles",
                sectionId: "role-du-malt",
                sourceIds: ["hornsey-2003"],
              },
            ],
          },
          {
            id: "retenir-brasser",
            title: "À retenir pour brasser",
            blocks: [
              {
                id: "retenir-brasser-paragraph-1",
                type: "paragraph",
                text: "Premier repère : la bière est ancienne, mais la bière moderne est récente. Les outils de mesure, l'hygiène, la levure sélectionnée, le froid et les styles codifiés changent profondément ce qu'un brasseur peut prévoir.",
                sourceIds: [],
              },
              {
                id: "retenir-brasser-paragraph-2",
                type: "paragraph",
                text: "Deuxième repère : les ingrédients sont historiques. Le malt, les plantes aromatiques, le houblon, l'eau et la levure n'ont pas toujours eu le même rôle. Comprendre cette évolution aide à lire une recette comme une série de choix, et pas comme une vérité fixe.",
                sourceIds: [],
              },
              {
                id: "retenir-brasser-paragraph-3",
                type: "paragraph",
                text: "Troisième repère : l'histoire donne de la nuance. Elle permet de respecter les styles sans les figer, de s'inspirer du passé sans l'idéaliser, et de garder le but principal d'un brassin moderne : produire une bière maîtrisée, cohérente et agréable à boire.",
                sourceIds: [],
              },
              {
                id: "related-introduction",
                type: "relatedArticle",
                articleSlug: "introduction",
                sectionId: "preparer-premier-brassin",
                sourceIds: ["hornsey-2003"],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "introduction",
      metadata: {
        title: "Mon premier brassin : le guide pour débuter",
        summary:
          "Prépare ton premier brassin étape par étape : matériel, ingrédients, hygiène, fermentation et repères simples pour débuter sans te perdre.",
        category: "getting-started",
        level: "beginner",
        status: "published",
        version: "1.1.0",
        estimatedReadTimeMinutes: 14,
        tags: ["beginner", "first-brew", "process", "hygiene"],
        updatedAt: "2026-07-27",
        relatedArticles: [
          "houblons",
          "levures",
          "fermentescibles",
          "eau",
          "carbonatation",
        ],
        relatedGlossaryTerms: [
          "ibu",
          "densite-initiale",
          "densite-finale",
          "attenuation",
        ],
        relatedCalculators: [],
        learningObjectives: [
          "Préparer le matériel et les ingrédients nécessaires avant le jour du brassage.",
          "Comprendre les grandes étapes qui transforment le moût en bière.",
          "Distinguer nettoyage et désinfection pour protéger la fermentation.",
          "Suivre quelques mesures utiles sans compliquer son premier brassin.",
        ],
        prerequisites: [],
        teaches: [
          "brewing-overview",
          "brewing-ingredients",
          "sanitation-basics",
          "fermentation-basics",
        ],
        sensitive: true,
        riskTopics: ["sanitation", "packaging-safety"],
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
            id: "aha-brewing-with-extract",
            kind: "website",
            title: "Brewing with Extract",
            authors: ["American Homebrewers Association"],
            publisher: "American Homebrewers Association",
            url: "https://www.homebrewersassociation.org/wp-content/uploads/How-To-Extract.pdf",
            accessedAt: "2026-07-27",
            year: null,
            notes:
              "Beginner brewing process, equipment, cleaning, sanitation, fermentation, and packaging reference.",
          },
        ],
        review: {
          confidenceLevel: "validated",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-27",
          notes: [
            "Expanded into a beginner pillar guide for first-brew search intent.",
            "Sanitation and packaging guidance cross-checked against Palmer and the American Homebrewers Association beginner process.",
            "Approved for public-web publication on 2026-07-27.",
          ],
        },
        webPublication: {
          status: "published",
          slug: "premier-brassin",
        },
      },
      body: {
        sections: [
          {
            id: "preparer-premier-brassin",
            title: "Préparer son premier brassin sans se disperser",
            blocks: [
              {
                id: "preparer-premier-brassin-paragraph-1",
                type: "paragraph",
                text: "Un premier brassin sert surtout à comprendre le déroulé complet : préparer, brasser, refroidir, fermenter puis conditionner. Choisis une recette simple, lis-la jusqu'au bout et garde ses instructions à portée de main. Tu apprendras plus en suivant proprement un plan accessible qu'en essayant de contrôler tous les paramètres dès le départ.",
                sourceIds: [],
              },
              {
                id: "preparer-premier-brassin-paragraph-2",
                type: "paragraph",
                text: "Avant le jour du brassage, vérifie que tu disposes des ingrédients, du matériel et d'assez de temps. Repère aussi les moments où une température, un volume ou une densité doivent être notés. Cette préparation évite de chercher un outil pendant que le moût chauffe ou refroidit.",
                sourceIds: [],
              },
              {
                id: "definition-brassin",
                type: "definition",
                term: "Brassin",
                definition:
                  "Volume de bière préparé au cours d'un même cycle de brassage, depuis la production du moût jusqu'à la fermentation et au conditionnement.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-recette-simple",
                type: "example",
                title: "Une bonne première recette",
                body: "Un kit bien documenté ou une recette courte avec peu d'ingrédients réduit le nombre de décisions à prendre. L'objectif du premier brassin est de terminer chaque étape proprement et de prendre des notes.",
                sourceIds: ["aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "materiel-ingredients",
            title: "Réunir le matériel et les quatre ingrédients",
            blocks: [
              {
                id: "materiel-ingredients-paragraph-1",
                type: "paragraph",
                text: "La liste exacte dépend de la méthode choisie, mais le socle reste stable : une cuve ou une grande casserole adaptée, un moyen de mesurer la température, un fermenteur avec barboteur, du matériel de transfert et ce qui servira au conditionnement. Une recette peut demander un densimètre, un sac à grains ou un système de refroidissement supplémentaire.",
                sourceIds: [],
              },
              {
                id: "materiel-ingredients-paragraph-2",
                type: "paragraph",
                text: "La bière repose sur quatre ingrédients principaux. L'eau constitue le volume et influence l'équilibre. Le malt ou l'extrait de malt apporte les sucres que la levure pourra transformer. Le houblon contribue à l'amertume, au goût et à l'arôme. La levure réalise la fermentation et participe directement au profil de la bière.",
                sourceIds: [],
              },
              {
                id: "materiel-ingredients-paragraph-3",
                type: "paragraph",
                text: "Prépare aussi un produit de nettoyage compatible avec ton matériel et un désinfectant prévu pour le brassage ou le contact alimentaire. Lis leurs étiquettes avant de commencer : dosage, durée de contact et besoin éventuel de rinçage dépendent du produit utilisé.",
                sourceIds: [],
              },
              {
                id: "example-checklist-materiel",
                type: "example",
                title: "Checklist avant de chauffer",
                body: "Recette relue, ingrédients pesés, thermomètre disponible, fermenteur prêt, matériel de transfert vérifié et produits de nettoyage et de désinfection préparés selon leur notice.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "nettoyer-desinfecter",
            title: "Nettoyer puis désinfecter au bon moment",
            blocks: [
              {
                id: "nettoyer-desinfecter-paragraph-1",
                type: "paragraph",
                text: "Nettoyer et désinfecter répondent à deux besoins différents. Le nettoyage retire les dépôts et les salissures. La désinfection agit ensuite sur une surface déjà propre pour réduire le risque de contamination. Désinfecter un matériel encore sale ne remplace donc jamais le nettoyage.",
                sourceIds: [],
              },
              {
                id: "nettoyer-desinfecter-paragraph-2",
                type: "paragraph",
                text: "Avant l'ébullition, la chaleur participe à la maîtrise microbiologique du moût. Après l'ébullition, tout objet qui touche le moût refroidi ou la bière doit être propre puis correctement désinfecté : fermenteur, couvercle, thermomètre, tuyau, éprouvette et matériel de conditionnement. Évite de poser un ustensile désinfecté sur une surface qui ne l'est pas.",
                sourceIds: [],
              },
              {
                id: "nettoyer-desinfecter-paragraph-3",
                type: "paragraph",
                text: "Respecte la notice du fabricant pour la concentration, la température, le temps de contact et le rinçage. Ne mélange pas plusieurs produits et conserve les solutions hors de portée des enfants. En cas de doute, recommence la préparation plutôt que d'improviser un dosage.",
                sourceIds: [],
              },
              {
                id: "definition-nettoyer-desinfecter",
                type: "definition",
                term: "Nettoyer puis désinfecter",
                definition:
                  "Nettoyer retire les matières visibles et les dépôts. Désinfecter traite ensuite une surface propre afin de réduire les microorganismes susceptibles d'altérer le brassin.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
              {
                id: "example-zone-froide",
                type: "example",
                title: "Le réflexe après refroidissement",
                body: "Dès que l'ébullition est terminée et que le moût refroidit, considère chaque contact comme sensible : mains, cuillère, tuyau, fermenteur et instruments doivent rester propres et désinfectés.",
                sourceIds: ["aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "jour-brassage",
            title: "Comprendre le jour du brassage",
            blocks: [
              {
                id: "jour-brassage-paragraph-1",
                type: "paragraph",
                text: "Le brassage commence par la préparation du moût. Avec des grains, l'empâtage transforme l'amidon en sucres fermentescibles avant la filtration. Avec un extrait de malt, une partie de ce travail a déjà été réalisée. Suis la méthode et les températures indiquées par ta recette plutôt que de mélanger plusieurs protocoles.",
                sourceIds: [],
              },
              {
                id: "jour-brassage-paragraph-2",
                type: "paragraph",
                text: "Le moût est ensuite porté à ébullition. Les ajouts de houblon n'ont pas tous le même rôle : un ajout long contribue davantage à l'amertume, tandis qu'un ajout tardif cherche davantage le goût et l'arôme. Note l'heure de chaque ajout pour pouvoir comprendre le résultat à la dégustation.",
                sourceIds: [],
              },
              {
                id: "jour-brassage-paragraph-3",
                type: "paragraph",
                text: "Après l'ébullition, refroidis le moût selon la méthode prévue, transfère-le dans le fermenteur désinfecté, mesure la densité initiale si la recette le demande, puis ajoute la levure à une température compatible avec ses instructions. Ferme le fermenteur et installe le barboteur sans multiplier les manipulations.",
                sourceIds: [],
              },
              {
                id: "example-chronologie-brassage",
                type: "example",
                title: "La chronologie à retenir",
                body: "Préparer le moût, faire bouillir et ajouter le houblon, refroidir, transférer dans un fermenteur désinfecté, mesurer si nécessaire, ajouter la levure puis fermer le fermenteur.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
              {
                id: "related-houblons",
                type: "relatedArticle",
                articleSlug: "houblons",
                sectionId: "timing-ajouts",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "fermentation",
            title: "Laisser la fermentation travailler",
            blocks: [
              {
                id: "fermentation-paragraph-1",
                type: "paragraph",
                text: "La fermentation commence lorsque la levure transforme les sucres du moût. La température doit rester dans la plage recommandée pour la souche utilisée. Une pièce trop chaude, de fortes variations ou un déplacement répété du fermenteur peuvent compliquer le résultat plus sûrement qu'un calcul imparfait.",
                sourceIds: [],
              },
              {
                id: "fermentation-paragraph-2",
                type: "paragraph",
                text: "Le barboteur peut bouger beaucoup, peu ou pas du tout selon l'étanchéité et la pression. Il ne suffit pas à confirmer que la fermentation est terminée. Évite d'ouvrir le fermenteur pour regarder : chaque ouverture ajoute une occasion de contamination ou d'oxydation.",
                sourceIds: [],
              },
              {
                id: "fermentation-paragraph-3",
                type: "paragraph",
                text: "Avant le conditionnement, suis la durée prévue par la recette et vérifie la densité finale lorsque le protocole le demande. N'embouteille pas une bière dont la densité continue de baisser : une fermentation encore active peut produire une surpression dans les bouteilles.",
                sourceIds: [],
              },
              {
                id: "definition-og-fg",
                type: "definition",
                term: "OG et FG",
                definition:
                  "L'OG est la densité initiale du moût avant fermentation. La FG est la densité finale mesurée lorsque la fermentation est terminée et stable.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-fermentation-patience",
                type: "example",
                title: "Pendant l'attente",
                body: "Note la température et observe sans ouvrir. Utilise les mesures prévues par la recette pour décider de la suite, pas seulement l'activité visible dans le barboteur.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "related-fermentation",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "mesures-utiles",
            title: "Suivre les mesures vraiment utiles",
            blocks: [
              {
                id: "mesures-utiles-paragraph-1",
                type: "paragraph",
                text: "Pour un premier brassin, concentre-toi sur quelques données : volumes, températures importantes, heure des ajouts, OG, FG et observations de fermentation. Ces repères suffisent déjà à expliquer une grande partie des écarts entre la recette et le résultat.",
                sourceIds: [],
              },
              {
                id: "mesures-utiles-paragraph-2",
                type: "paragraph",
                text: "L'OG aide à estimer la quantité de sucres disponible avant fermentation. La FG indique ce qu'il reste ensuite. Leur différence permet d'estimer l'alcool et d'évaluer l'atténuation. Les IBU donnent un repère d'amertume calculée, mais la perception dépend aussi du corps, du sucre résiduel et des arômes.",
                sourceIds: [],
              },
              {
                id: "mesures-utiles-paragraph-3",
                type: "paragraph",
                text: "Note les valeurs réellement observées, même lorsqu'elles ne correspondent pas à la cible. Une mesure imparfaite mais datée reste plus utile qu'une valeur corrigée de mémoire après le brassage.",
                sourceIds: [],
              },
              {
                id: "ibu-reference",
                type: "glossaryReference",
                termSlug: "ibu",
                label: "IBU",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-notes-brassin",
                type: "example",
                title: "La fiche minimale",
                body: "Date, recette, volumes, températures clés, heures des ajouts, OG, FG, température de fermentation et trois notes de dégustation. Cette trace suffit pour améliorer le brassin suivant.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "erreurs-frequentes",
            title: "Éviter les erreurs fréquentes",
            blocks: [
              {
                id: "erreurs-frequentes-paragraph-1",
                type: "paragraph",
                text: "La première erreur consiste à commencer sans avoir lu la recette en entier. La deuxième est de confondre nettoyage et désinfection. Viennent ensuite les mesures oubliées, les ajouts non chronométrés, le refroidissement improvisé et les manipulations inutiles après l'ébullition.",
                sourceIds: [],
              },
              {
                id: "erreurs-frequentes-paragraph-2",
                type: "paragraph",
                text: "N'essaie pas de corriger plusieurs paramètres en même temps. Si une valeur s'écarte légèrement de la cible mais que le protocole reste sûr, note-la et continue. Une correction précipitée peut créer un problème plus difficile à comprendre que l'écart initial.",
                sourceIds: [],
              },
              {
                id: "erreurs-frequentes-paragraph-3",
                type: "paragraph",
                text: "Enfin, ne précipite ni la fermentation ni le conditionnement. La levure suit son propre rythme, et la sécurité des bouteilles dépend d'une fermentation terminée ainsi que d'un dosage de refermentation conforme à la recette.",
                sourceIds: [],
              },
              {
                id: "example-priorites",
                type: "example",
                title: "Tes trois priorités",
                body: "Protège l'hygiène après l'ébullition, maintiens une température de fermentation adaptée et prends des notes. Les optimisations de rendement, d'eau ou de recette viendront ensuite.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "deguster-progresser",
            title: "Déguster et préparer le brassin suivant",
            blocks: [
              {
                id: "deguster-progresser-paragraph-1",
                type: "paragraph",
                text: "Lorsque la bière est conditionnée et prête selon la recette, déguste-la sans chercher seulement les défauts. Compare l'arôme, l'amertume, le corps et la finale à ce que tu voulais obtenir. Relis ensuite tes notes pour relier le goût aux décisions prises pendant le brassage.",
                sourceIds: [],
              },
              {
                id: "deguster-progresser-paragraph-2",
                type: "paragraph",
                text: "Choisis une seule amélioration pour le brassin suivant : mieux stabiliser la température, préparer le matériel plus tôt, noter les volumes ou revoir le moment des ajouts de houblon. Cette progression rend chaque essai comparable et évite de changer toute la recette sans savoir ce qui a fonctionné.",
                sourceIds: [],
              },
              {
                id: "deguster-progresser-paragraph-3",
                type: "paragraph",
                text: "Ton premier brassin n'a pas besoin d'être parfait pour être utile. S'il t'aide à comprendre le processus, à protéger la fermentation et à identifier la prochaine amélioration, il a déjà rempli son rôle.",
                sourceIds: [],
              },
              {
                id: "related-houblons-next",
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
      slug: "houblons",
      metadata: {
        title: "IBU et houblon : comprendre l'amertume d'une bière",
        summary:
          "Comprendre ce que mesure l'IBU, pourquoi l'amertume perçue varie et comment le moment des ajouts de houblon transforme une bière.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.1.0",
        estimatedReadTimeMinutes: 11,
        tags: ["ingredients", "bitterness", "aroma", "ibu", "dry-hop"],
        updatedAt: "2026-07-27",
        relatedArticles: ["introduction", "fermentescibles", "levures", "eau"],
        relatedGlossaryTerms: ["ibu", "houblon", "acide-alpha"],
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
          "Identifier les rôles principaux du houblon dans une bière.",
          "Distinguer les ajouts d'amertume des ajouts aromatiques.",
          "Comprendre pourquoi les IBU calculés ne résument pas toute l'amertume perçue.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: [
          "hop-bitterness",
          "hop-aroma",
          "hop-timing",
          "bitterness-balance",
        ],
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
          {
            id: "oqlf-houblonnage-cru-2018",
            kind: "website",
            title: "Houblonnage à cru",
            authors: ["Office québécois de la langue française"],
            publisher: "Office québécois de la langue française",
            url: "https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/2088405/houblonnage-a-cru",
            accessedAt: "2026-07-27",
            year: 2018,
            notes:
              "Official French terminology and definition for dry hopping.",
          },
        ],
        review: {
          confidenceLevel: "validated",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-27",
          notes: [
            "Expanded from the initial pilot article to align with the migrated Academy content depth.",
            "Approved for public-web publication on 2026-07-27.",
          ],
        },
        webPublication: {
          status: "published",
          slug: "ibu-biere-amertume-houblon",
        },
      },
      body: {
        sections: [
          {
            id: "role-du-houblon",
            title: "IBU : ce que mesure vraiment l'amertume",
            blocks: [
              {
                id: "role-du-houblon-paragraph-1",
                type: "paragraph",
                text: "L'IBU, ou International Bitterness Unit, indique la concentration de composés amers issus principalement des acides alpha du houblon. Dans une recette, cette valeur sert de repère pour comparer l'amertume calculée. Elle ne prédit toutefois pas exactement ce que tu ressentiras dans le verre : le corps, le sucre résiduel, l'alcool, l'eau et les arômes modifient l'équilibre perçu.",
                sourceIds: [],
              },
              {
                id: "definition-acide-alpha",
                type: "definition",
                term: "Acide alpha",
                definition:
                  "Composé du houblon qui se transforme pendant l'ébullition et contribue à l'amertume mesurée en IBU.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "definition-ibu",
                type: "definition",
                term: "IBU",
                definition:
                  "Unité utilisée pour quantifier les composés amers d'une bière. Elle aide à comparer des recettes, mais ne décrit pas à elle seule l'amertume ressentie.",
                sourceIds: ["palmer-2017"],
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
            id: "amertume-gout-arome",
            title: "Du houblon amer au houblon aromatique",
            blocks: [
              {
                id: "amertume-gout-arome-paragraph-1",
                type: "paragraph",
                text: "Le houblon ne sert pas uniquement à rendre une bière amère. Pendant une longue ébullition, la chaleur transforme les acides alpha et construit l'amertume de base. Les huiles aromatiques sont plus volatiles : des ajouts tardifs, au whirlpool ou à froid cherchent davantage à préserver leurs notes fruitées, florales, résineuses ou épicées.",
                sourceIds: [],
              },
              {
                id: "example-ajout-tardif",
                type: "example",
                title: "Même houblon, résultat différent",
                body: "Un ajout en début d'ébullition contribue surtout à l'amertume. Le même houblon ajouté en fin d'ébullition ou au whirlpool préservera davantage son expression aromatique.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "timing-ajouts",
            title: "Quand ajouter le houblon ?",
            blocks: [
              {
                id: "timing-ajouts-paragraph-1",
                type: "paragraph",
                text: "Le moment de l'ajout détermine le rôle principal du houblon. Il ne s'agit pas d'une frontière absolue : chaque ajout peut contribuer à plusieurs dimensions, mais cette grille donne un point de départ clair.",
                sourceIds: [],
              },
              {
                id: "example-ajout-amerisant",
                type: "example",
                title: "Début d'ébullition",
                body: "Un ajout long construit surtout une base amère nette et calculable.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-ajout-saveur",
                type: "example",
                title: "15 à 5 minutes avant la fin",
                body: "Un ajout court cherche un compromis entre saveur et contribution aux IBU.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-whirlpool",
                type: "example",
                title: "Whirlpool ou hop stand",
                body: "Un ajout après l'ébullition privilégie l'expression aromatique avec une contribution amère plus limitée.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-dry-hop",
                type: "example",
                title: "Pendant ou après la fermentation",
                body: "Un ajout à froid renforce le nez houblonné sans rechercher l'amertume de l'ébullition.",
                sourceIds: ["palmer-2017", "oqlf-houblonnage-cru-2018"],
              },
              {
                id: "example-ipa-timing",
                type: "example",
                title: "IPA simple",
                body: "Une IPA peut utiliser un ajout amérisant en début d'ébullition, un ajout tardif pour le goût, puis un dry hop pour l'intensité aromatique.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "houblonnage-a-cru",
            title: "Houblonnage à cru : renforcer l'arôme",
            blocks: [
              {
                id: "houblonnage-a-cru-paragraph-1",
                type: "paragraph",
                text: "Le houblonnage à cru, ou dry hopping, consiste à ajouter du houblon pendant ou après la fermentation afin de renforcer les arômes sans rechercher l'isomérisation obtenue pendant l'ébullition. Cette technique demande de limiter les manipulations et l'exposition à l'oxygène, car une bière houblonnée perd vite sa fraîcheur aromatique lorsqu'elle s'oxyde.",
                sourceIds: [],
              },
              {
                id: "definition-houblonnage-cru",
                type: "definition",
                term: "Houblonnage à cru",
                definition:
                  "Ajout de houblon aromatique pendant ou après la fermentation pour renforcer les arômes sans augmenter volontairement l'amertume.",
                sourceIds: ["oqlf-houblonnage-cru-2018"],
              },
            ],
          },
          {
            id: "equilibre",
            title: "Pourquoi deux bières à 40 IBU semblent différentes",
            blocks: [
              {
                id: "equilibre-paragraph-1",
                type: "paragraph",
                text: "Une amertume ne se juge jamais seule. Une bière légère et sèche peut paraître très amère à 40 IBU, tandis qu'une bière plus dense, maltée ou sucrée peut sembler plus équilibrée avec la même valeur. La densité initiale, l'atténuation, le corps et le profil de l'eau changent la manière dont le palais interprète l'amertume.",
                sourceIds: [],
              },
              {
                id: "related-fermentables",
                type: "relatedArticle",
                articleSlug: "fermentescibles",
                sectionId: "role-du-malt",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "related-water",
                type: "relatedArticle",
                articleSlug: "eau",
                sectionId: "alcalinite-ratio",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "calculer-ibu",
            title: "Calculer les IBU sans perdre de vue le goût",
            blocks: [
              {
                id: "calculer-ibu-paragraph-1",
                type: "paragraph",
                text: "Un calculateur estime les IBU à partir de la quantité de houblon, de son taux d'acides alpha, du volume, de la densité du moût, du temps d'ébullition et d'un modèle d'utilisation. Le résultat aide à construire et reproduire une recette ; il ne remplace ni la dégustation ni les notes prises après chaque brassin.",
                sourceIds: [],
              },
              {
                id: "hop-calculator",
                type: "calculatorCta",
                calculatorSlug: "houblons",
                title: "Préparer une amertume cible",
                description:
                  "Le calculateur houblons de Brasse-Bouillon aide à estimer les IBU d'une recette et à comparer plusieurs scénarios d'ajout.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "pieges",
            title: "Les erreurs fréquentes",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes consistent à confondre IBU calculés et amertume perçue, à ajouter tout le houblon au même moment, à augmenter une dose sans vérifier l'équilibre malté ou à multiplier les manipulations pendant un dry hop. Avant de modifier une recette, donne un objectif à chaque ajout : construire l'amertume, apporter de la saveur, préserver l'arôme ou renforcer le nez.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "levures",
      metadata: {
        title: "Fermentation bière maison : durée, température et signes",
        summary:
          "Comprends la fermentation de ta bière maison : durée, température, signes d'activité, densité finale et contrôles avant la mise en bouteille.",
        category: "fermentation",
        level: "beginner",
        status: "published",
        version: "1.1.0",
        estimatedReadTimeMinutes: 13,
        tags: ["fermentation", "yeast", "temperature", "final-gravity"],
        updatedAt: "2026-07-27",
        relatedArticles: ["introduction", "carbonatation", "houblons"],
        relatedGlossaryTerms: [
          "fermentation",
          "attenuation",
          "mout",
          "densite-initiale",
          "densite-finale",
        ],
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
          "Comprendre les grandes phases d'une fermentation de bière maison.",
          "Adapter le suivi à la souche, à la recette et à la température réelle de la bière.",
          "Distinguer les signes visibles d'une mesure fiable de fin de fermentation.",
          "Vérifier la densité finale avant de conditionner la bière en sécurité.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: [
          "fermentation-basics",
          "yeast-pitch-rate",
          "fermentation-temperature",
          "fermentation-completion",
        ],
        sensitive: true,
        riskTopics: ["fermentation-health", "sanitation", "packaging-safety"],
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
            id: "aha-brewing-with-extract",
            kind: "website",
            title: "Brewing with Extract",
            authors: ["American Homebrewers Association"],
            publisher: "American Homebrewers Association",
            url: "https://www.homebrewersassociation.org/wp-content/uploads/How-To-Extract.pdf",
            accessedAt: "2026-07-27",
            year: null,
            notes:
              "Beginner brewing process, equipment, cleaning, sanitation, fermentation, and packaging reference.",
          },
        ],
        review: {
          confidenceLevel: "validated",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-27",
          notes: [
            "Expanded into a beginner guide for fermentation duration, temperature, signs, and completion search intent.",
            "Airlock, temperature, sanitation, gravity, and packaging guidance cross-checked against Palmer and the American Homebrewers Association beginner process.",
            "Approved for public-web publication on 2026-07-27.",
          ],
        },
        webPublication: {
          status: "published",
          slug: "fermentation-biere-duree-temperature",
        },
      },
      body: {
        sections: [
          {
            id: "fermentation",
            title: "Comprendre ce qui se passe dans le fermenteur",
            blocks: [
              {
                id: "fermentation-paragraph-1",
                type: "paragraph",
                text: "La fermentation de la bière maison commence lorsque la levure utilise les sucres fermentescibles du moût. Elle produit principalement de l'alcool, du dioxyde de carbone et des composés aromatiques. La souche choisie, la quantité de levure, la composition du moût et la température influencent donc autant le rythme que le profil final de la bière.",
                sourceIds: [],
              },
              {
                id: "fermentation-paragraph-2",
                type: "paragraph",
                text: "Les premières heures ne servent pas uniquement à produire de l'alcool. La levure s'adapte à son environnement et se multiplie avant que l'activité devienne clairement visible. Une bière peut ainsi fermenter sans montrer immédiatement une forte activité dans le barboteur.",
                sourceIds: [],
              },
              {
                id: "definition-fermentation",
                type: "definition",
                term: "Fermentation alcoolique",
                definition:
                  "Transformation des sucres fermentescibles du moût par la levure, avec production d'alcool, de dioxyde de carbone et de composés qui participent au profil aromatique de la bière.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
              {
                id: "related-first-brew",
                type: "relatedArticle",
                articleSlug: "introduction",
                sectionId: "fermentation",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "duree-fermentation",
            title: "Combien de temps dure la fermentation d'une bière ?",
            blocks: [
              {
                id: "duree-fermentation-paragraph-1",
                type: "paragraph",
                text: "Il n'existe pas de durée universelle. La souche de levure, la densité initiale, la température, la quantité de cellules viables et la recette changent le calendrier. Une recette pour débutant peut prévoir une à deux semaines de fermentation principale, mais ce repère ne remplace ni les instructions de la recette ni une mesure de densité.",
                sourceIds: [],
              },
              {
                id: "duree-fermentation-paragraph-2",
                type: "paragraph",
                text: "Des signes peuvent apparaître dans les 12 à 72 heures après l'ensemencement, sans que cette fenêtre constitue une garantie. Une bière forte, une Lager fermentée à plus basse température ou une levure qui démarre lentement peut demander plus de temps. À l'inverse, une activité très vive pendant quelques jours ne prouve pas que tout le travail de la levure est terminé.",
                sourceIds: [],
              },
              {
                id: "duree-fermentation-paragraph-3",
                type: "paragraph",
                text: "Base ton planning sur une fenêtre, jamais sur une date d'embouteillage irrévocable. Attends au minimum la durée prévue par la recette, puis vérifie l'évolution de la densité avant de décider de la suite.",
                sourceIds: [],
              },
              {
                id: "example-planning",
                type: "example",
                title: "Un planning reste conditionnel",
                body: "Si ta recette prévoit deux semaines de fermentation, réserve la date comme premier point de contrôle. Ne transforme pas cette date en ordre d'embouteiller : la densité doit d'abord confirmer que la fermentation est terminée.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "temperature-fermentation",
            title: "Maintenir la bonne température",
            blocks: [
              {
                id: "temperature-fermentation-paragraph-1",
                type: "paragraph",
                text: "Utilise en priorité la plage indiquée par le fabricant de la souche. Une Ale, une Lager, une levure belge ou une souche kveik ne partagent pas nécessairement la même plage utile. Une valeur générale trouvée pour une autre levure peut donc conduire à un mauvais réglage.",
                sourceIds: [],
              },
              {
                id: "temperature-fermentation-paragraph-2",
                type: "paragraph",
                text: "La fermentation dégage de la chaleur. La bière peut être plus chaude que l'air de la pièce lorsque l'activité est forte. Si possible, mesure la température sur le fermenteur ou avec une sonde adaptée, puis limite les variations rapides. Un emplacement sombre et stable est souvent plus utile qu'une pièce dont la température change fortement entre le jour et la nuit.",
                sourceIds: [],
              },
              {
                id: "temperature-fermentation-paragraph-3",
                type: "paragraph",
                text: "Une température trop élevée pour la souche peut accélérer la fermentation et favoriser des arômes indésirables. Une température trop basse peut ralentir le démarrage ou l'atténuation. Ne corrige pas brutalement : vérifie la plage de la souche et ajuste progressivement les conditions.",
                sourceIds: [],
              },
              {
                id: "example-temperature-souche",
                type: "example",
                title: "Le bon repère est sur la levure",
                body: "Deux sachets portant simplement la mention « Ale » peuvent avoir des plages recommandées différentes. Note la souche exacte et suis sa fiche fabricant plutôt qu'une température présentée comme valable pour toutes les bières.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "signes-fermentation",
            title: "Observer les signes sans ouvrir",
            blocks: [
              {
                id: "signes-fermentation-paragraph-1",
                type: "paragraph",
                text: "La mousse appelée krausen, un trouble plus marqué et l'évacuation de dioxyde de carbone sont des signes fréquents d'activité. Leur intensité varie. Certaines fermentations produisent une mousse spectaculaire ; d'autres restent discrètes tout en avançant normalement.",
                sourceIds: [],
              },
              {
                id: "signes-fermentation-paragraph-2",
                type: "paragraph",
                text: "Le barboteur permet au gaz de s'échapper tout en limitant les entrées d'air et de contaminants. Ses bulles dépendent toutefois de l'étanchéité du fermenteur, de la pression et du dégazage. Une absence de bulles ne prouve pas que la levure est inactive, et l'arrêt des bulles ne prouve pas que la fermentation est terminée.",
                sourceIds: [],
              },
              {
                id: "signes-fermentation-paragraph-3",
                type: "paragraph",
                text: "Observe le fermenteur fermé et note la température, l'heure et les changements visibles. Évite de soulever régulièrement le couvercle : regarder de plus près n'apporte pas une mesure fiable et multiplie les risques de contamination ou d'oxydation.",
                sourceIds: [],
              },
              {
                id: "definition-krausen",
                type: "definition",
                term: "Krausen",
                definition:
                  "Couche de mousse qui peut se former à la surface du moût pendant la phase active de fermentation. Sa présence est un signe utile, mais son aspect et sa durée varient selon le brassin.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "densite-finale",
            title: "Mesurer la densité finale",
            blocks: [
              {
                id: "densite-finale-paragraph-1",
                type: "paragraph",
                text: "La densité spécifique estime la quantité de matières dissoutes dans le moût ou la bière. Mesurée avant l'ajout de la levure, elle donne la densité initiale, ou OG. Lorsque la fermentation est terminée, la mesure obtenue est la densité finale, ou FG. La différence entre les deux aide à estimer l'atténuation et le taux d'alcool.",
                sourceIds: [],
              },
              {
                id: "densite-finale-paragraph-2",
                type: "paragraph",
                text: "Un densimètre permet de suivre cette évolution. Prélève l'échantillon avec du matériel propre et désinfecté, suis la température de calibration de l'instrument et ne reverse pas l'échantillon dans le fermenteur. Comparer deux mesures identiques espacées d'environ 24 heures est un contrôle bien plus fiable que le rythme du barboteur.",
                sourceIds: [],
              },
              {
                id: "densite-finale-paragraph-3",
                type: "paragraph",
                text: "Une densité stable n'impose pas qu'elle corresponde exactement à la valeur théorique de la recette. Si elle reste nettement plus haute que prévu, vérifie la méthode de mesure, la température de l'échantillon, la souche et les conditions de fermentation avant de conclure.",
                sourceIds: [],
              },
              {
                id: "definition-attenuation",
                type: "definition",
                term: "Atténuation",
                definition:
                  "Part des sucres fermentescibles consommée par la levure. Elle relie la densité initiale à la densité finale et influence le corps ainsi que la sensation de sécheresse.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-gravity-stable",
                type: "example",
                title: "Décider avec deux mesures",
                body: "Une première mesure indique 1,012. Une seconde mesure prise environ 24 heures plus tard indique encore 1,012. Cette stabilité, associée au délai et aux consignes de la recette, est un meilleur indicateur de fin de fermentation qu'un barboteur silencieux.",
                sourceIds: ["aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "diagnostic-fermentation",
            title: "Vérifier un démarrage lent ou un arrêt apparent",
            blocks: [
              {
                id: "diagnostic-fermentation-paragraph-1",
                type: "paragraph",
                text: "Si aucune activité n'est visible, commence par vérifier le temps écoulé, la température réelle et l'étanchéité du fermenteur. Les signes peuvent demander jusqu'à 72 heures pour apparaître, et du gaz peut s'échapper ailleurs que par le barboteur. Une mesure de densité comparée à l'OG permet ensuite de savoir si les sucres ont commencé à être consommés.",
                sourceIds: [],
              },
              {
                id: "diagnostic-fermentation-paragraph-2",
                type: "paragraph",
                text: "Si la densité ne baisse pas ou s'arrête nettement au-dessus de la cible, contrôle la plage de température de la souche, sa date et ses conditions de conservation, puis relis les instructions de la recette. Évite d'ajouter au hasard du sucre, de l'oxygène ou une nouvelle levure : la bonne intervention dépend de la cause.",
                sourceIds: [],
              },
              {
                id: "diagnostic-fermentation-paragraph-3",
                type: "paragraph",
                text: "Une odeur inhabituelle pendant la fermentation n'annonce pas toujours une bière perdue. Le soufre, certains esters ou d'autres composés peuvent évoluer pendant la maturation. En revanche, une moisissure visible, un récipient endommagé ou un doute sérieux sur la sécurité justifie de ne pas goûter le produit et de demander un avis expérimenté.",
                sourceIds: [],
              },
              {
                id: "example-diagnostic-order",
                type: "example",
                title: "Diagnostiquer dans l'ordre",
                body: "Vérifie d'abord le délai, la température et l'étanchéité. Compare ensuite une mesure de densité à l'OG. Ces contrôles évitent de traiter comme une fermentation bloquée un simple fermenteur peu étanche.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "hygiene-oxydation",
            title: "Protéger la bière pendant le suivi",
            blocks: [
              {
                id: "hygiene-oxydation-paragraph-1",
                type: "paragraph",
                text: "Après refroidissement du moût, tout ce qui touche la bière doit être propre puis désinfecté : éprouvette, densimètre, pipette, robinet et tuyau. Respecte le dosage, le temps de contact et les consignes de rinçage du produit utilisé. Ne remplace jamais le nettoyage d'un dépôt visible par une simple désinfection.",
                sourceIds: [],
              },
              {
                id: "hygiene-oxydation-paragraph-2",
                type: "paragraph",
                text: "Prélève uniquement ce qui est nécessaire et referme le fermenteur. Lorsque la fermentation ralentit, l'oxygène introduit par des ouvertures, des éclaboussures ou des transferts inutiles peut altérer les arômes et la conservation. Ne remets pas un échantillon prélevé dans la bière.",
                sourceIds: [],
              },
              {
                id: "hygiene-oxydation-paragraph-3",
                type: "paragraph",
                text: "Laisse toujours une voie sûre pour l'évacuation du dioxyde de carbone. Un barboteur ou un tube d'évacuation adapté ne doit pas être obstrué. N'ouvre jamais un fermenteur sous pression sans suivre les instructions de son fabricant.",
                sourceIds: [],
              },
              {
                id: "example-sample-safe",
                type: "example",
                title: "Prélever proprement",
                body: "Prépare et désinfecte le matériel avant d'ouvrir, prélève une seule fois, referme le fermenteur puis effectue la mesure à l'écart. L'échantillon ne retourne pas dans la bière.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
              },
            ],
          },
          {
            id: "conditionnement",
            title: "Préparer le conditionnement en sécurité",
            blocks: [
              {
                id: "conditionnement-paragraph-1",
                type: "paragraph",
                text: "N'embouteille pas parce que le barboteur s'est arrêté ou parce qu'une date est arrivée. Vérifie que la densité est stable, que la bière a suivi la durée prévue et qu'aucun signe ne suggère une fermentation inachevée. Une densité qui baisse encore signifie que du dioxyde de carbone supplémentaire peut être produit après la fermeture des bouteilles.",
                sourceIds: [],
              },
              {
                id: "conditionnement-paragraph-2",
                type: "paragraph",
                text: "Pour une refermentation en bouteille, calcule le sucre d'amorçage selon le volume réel, la température pertinente, le niveau de carbonatation recherché et le type de sucre. Utilise des bouteilles conçues pour supporter la pression et inspecte-les avant remplissage. Un dosage improvisé ou une fermentation inachevée augmente le risque de surpression.",
                sourceIds: [],
              },
              {
                id: "conditionnement-paragraph-3",
                type: "paragraph",
                text: "Après conditionnement, respecte la durée et les conditions prévues par la recette. Si une bouteille semble anormalement sous pression, ne la manipule pas inutilement et demande conseil avant de poursuivre.",
                sourceIds: [],
              },
              {
                id: "yeast-calculator",
                type: "calculatorCta",
                calculatorSlug: "levures",
                title: "Préparer la fermentation",
                description:
                  "Utilise les outils Brasse-Bouillon pour relier volume, densité initiale, souche et besoin estimé en levure.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "checklist-fermentation",
            title: "Retenir une méthode simple",
            blocks: [
              {
                id: "checklist-fermentation-paragraph-1",
                type: "paragraph",
                text: "Avant l'ensemencement, vérifie la souche, sa quantité, sa plage de température et la propreté du matériel. Pendant la fermentation, maintiens des conditions stables, observe sans ouvrir et note les changements. À l'approche du conditionnement, mesure la densité avec du matériel désinfecté et confirme qu'elle reste stable.",
                sourceIds: [],
              },
              {
                id: "checklist-fermentation-paragraph-2",
                type: "paragraph",
                text: "Cette méthode remplace les règles trop simples comme « plus de bulles signifie que c'est fini ». Elle donne aussi des notes comparables pour le prochain brassin : souche, OG, température réelle, délai d'apparition des signes, FG et durée totale.",
                sourceIds: [],
              },
              {
                id: "checklist-fermentation-paragraph-3",
                type: "paragraph",
                text: "La levure ne suit pas une horloge unique. En contrôlant les conditions et les mesures utiles plutôt qu'un calendrier rigide, tu peux décider avec plus de confiance quand laisser travailler la fermentation, quand investiguer et quand conditionner.",
                sourceIds: [],
              },
              {
                id: "example-final-checklist",
                type: "example",
                title: "Avant de conditionner",
                body: "Durée de la recette respectée, température suivie, densité stable sur deux mesures, matériel propre et désinfecté, dosage de refermentation calculé et bouteilles adaptées à la pression.",
                sourceIds: ["palmer-2017", "aha-brewing-with-extract"],
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
        summary:
          "Repère pratique sur le pH d'empâtage, le profil minéral, l'alcalinité résiduelle et les ajustements de l'eau.",
        category: "water",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 10,
        tags: ["water", "minerals", "mash", "ph"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "houblons"],
        relatedGlossaryTerms: [
          "profil-mineral",
          "ph",
          "calcium",
          "sulfate",
          "chlorure",
        ],
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
          "Comprendre pourquoi la composition de l'eau influence le brassage.",
          "Identifier les principales familles minérales utilisées pour ajuster l'eau.",
          "Appliquer une méthode simple et sûre pour les premières corrections d'eau.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: ["water-profile", "mash-ph", "residual-alkalinity"],
        sensitive: true,
        riskTopics: ["chemical-dosage", "ph-measurement"],
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
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-07",
          notes: ["Migrated from the legacy mobile Academy water topic."],
        },
      },
      body: {
        sections: [
          {
            id: "profil-mineral",
            title: "Pourquoi l'eau est critique",
            blocks: [
              {
                id: "profil-mineral-paragraph-1",
                type: "paragraph",
                text: "L'eau represente la tres grande majorite du volume final d'une biere. Elle pilote aussi le pH d'empatage, l'extraction des sucres, la perception de l'amertume et l'equilibre entre secheresse houblonnee et rondeur maltee.",
                sourceIds: [],
              },
              {
                id: "water-profile-reference",
                type: "glossaryReference",
                termSlug: "profil-mineral",
                label: "Profil minéral",
                sourceIds: ["brun-water-knowledge"],
              },
              {
                id: "definition-profil-mineral",
                type: "definition",
                term: "Profil minéral",
                definition:
                  "Composition de l'eau en ions principaux comme calcium, magnesium, sodium, sulfates, chlorures et bicarbonates.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "ions-principaux",
            title: "Les 6 ions à connaître",
            blocks: [
              {
                id: "ions-principaux-paragraph-1",
                type: "paragraph",
                text: "Les corrections d'eau deviennent plus simples quand on se concentre d'abord sur les ions les plus utiles au brasseur. Le calcium aide le pH, la clarte et la floculation. Le magnesium nourrit la levure mais doit rester modere. Le sodium apporte de la rondeur a petite dose. Les sulfates accentuent la secheresse et la perception de l'amertume. Les chlorures soutiennent la rondeur et l'expression maltee. Les bicarbonates tamponnent le pH et sont souvent trop eleves dans une eau calcaire.",
                sourceIds: [],
              },
              {
                id: "example-sulfate-chloride",
                type: "example",
                title: "Lecture rapide",
                body: "A valeurs raisonnables, plus de sulfates pousse une IPA vers un profil sec et net ; plus de chlorures soutient une biere plus ronde et maltee.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "ph-empatage",
            title: "Le pH à chaque étape",
            blocks: [
              {
                id: "ph-empatage-paragraph-1",
                type: "paragraph",
                text: "Le repere principal pendant l'empatage reste une zone autour de 5,2 a 5,6. En dehors de cette zone, les enzymes travaillent moins bien et la biere perd en precision. Pour le rincage, rester proche de 5,5 a 5,8 aide a limiter l'extraction de tannins. Un pH trop haut augmente les risques d'astringence ; un pH trop bas peut rendre le profil agressif.",
                sourceIds: [],
              },
              {
                id: "definition-mash-ph",
                type: "definition",
                term: "pH d'empatage",
                definition:
                  "Mesure d'acidite de la maische. Elle influence l'activite enzymatique, l'extraction et la nettete aromatique.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "alcalinite-ratio",
            title: "Alcalinité résiduelle et ratio SO4/Cl",
            blocks: [
              {
                id: "alcalinite-ratio-paragraph-1",
                type: "paragraph",
                text: "L'alcalinite residuelle resume la capacite de l'eau a resister a l'acidification des malts. Plus elle est elevee, plus le pH a tendance a monter. Repere pratique : RA en ppm environ egale a HCO3 moins Ca divise par 3,5 moins Mg divise par 7.",
                sourceIds: [],
              },
              {
                id: "alcalinite-ratio-paragraph-2",
                type: "paragraph",
                text: "Le ratio sulfates/chlorures donne une intention sensorielle, mais il ne suffit pas seul. Il faut toujours verifier les valeurs absolues en ppm pour eviter une biere au gout mineral, chimique ou metallique.",
                sourceIds: [],
              },
              {
                id: "example-ra-style",
                type: "example",
                title: "Adapter au style",
                body: "Une eau a RA faible convient mieux aux bieres pales. Une RA plus elevee peut aider certains styles fonces, dont les malts acidifient davantage la maische.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "methode",
            title: "Méthode simple et fiable",
            blocks: [
              {
                id: "methode-paragraph-1",
                type: "paragraph",
                text: "Commencer par lire l'analyse d'eau : calcium, magnesium, sodium, sulfates, chlorures et bicarbonates. Choisir ensuite une cible de style, puis reduire en priorite les bicarbonates si l'eau est trop calcaire, souvent par dilution avec de l'eau osmosee. Les sels comme le gypse ou le chlorure de calcium viennent ensuite pour ajuster progressivement le profil. Le pH de maische doit rester le controle principal.",
                sourceIds: [],
              },
              {
                id: "water-calculator",
                type: "calculatorCta",
                calculatorSlug: "eau",
                title: "Ajuster un profil d'eau",
                description:
                  "Utiliser le calculateur eau pour relier analyse de depart, cible de style et additions progressives.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "exemple-ipa",
            title: "Exemple IPA",
            blocks: [
              {
                id: "exemple-ipa-paragraph-1",
                type: "paragraph",
                text: "Avec une eau de depart tres calcaire, il vaut mieux diluer d'abord pour abaisser les bicarbonates, puis remonter les ions utiles au style. Pour une IPA, le gypse peut augmenter calcium et sulfates pour un profil plus sec, tandis que le chlorure de calcium peut garder assez de rondeur. Une cible de ratio SO4/Cl autour de 3:1 a 5:1 peut servir de repere, a condition que les ppm restent raisonnables.",
                sourceIds: [],
              },
              {
                id: "example-ipa-water",
                type: "example",
                title: "Ordre de correction",
                body: "Diluer d'abord une eau trop bicarbonatee, ajuster ensuite avec les sels, puis verifier le pH mesure plutot que de se fier uniquement au calcul.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "pieges",
            title: "Pièges fréquents à éviter",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes sont d'ajuster les sels sans mesurer le pH de maische, de se focaliser sur le ratio SO4/Cl sans regarder les ppm reels, de surdoser les sels, d'oublier la dechloration de l'eau du robinet, ou d'utiliser un pH-metre non calibre.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "fermentescibles",
      metadata: {
        title: "Malts et fermentescibles",
        summary:
          "Repère pratique sur les malts, les sucres fermentescibles, la densité, l'atténuation et l'alcool.",
        category: "ingredients",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 10,
        tags: ["malt", "fermentables", "gravity", "alcohol"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "levures"],
        relatedGlossaryTerms: [
          "malt",
          "mout",
          "empatage",
          "densite-initiale",
          "densite-finale",
          "attenuation",
        ],
        relatedCalculators: [
          {
            slug: "fermentescibles",
            label: "Fermentables calculator",
            reason: "Estimate alcohol, final gravity, and attenuation.",
            target: {
              type: "calculator",
              slug: "fermentescibles",
            },
          },
        ],
        learningObjectives: [
          "Expliquer le rôle du malt et des autres fermentescibles dans une bière.",
          "Distinguer densité initiale, densité finale, alcool et atténuation.",
          "Comprendre comment fermentescibles, levure et profil d'empâtage influencent la bière finale.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: [
          "malt-basics",
          "gravity-reading",
          "alcohol-estimation",
          "attenuation-basics",
        ],
        sensitive: true,
        riskTopics: ["fermentation-health"],
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
          notes: [
            "Migrated from the legacy mobile Academy fermentables topic.",
            "Title intentionally exposes malt as a fundamental ingredient.",
          ],
        },
      },
      body: {
        sections: [
          {
            id: "role-du-malt",
            title: "Pourquoi le malt est central",
            blocks: [
              {
                id: "role-du-malt-paragraph-1",
                type: "paragraph",
                text: "Le malt est la base energetique de la biere. Il apporte l'amidon qui sera converti en sucres pendant l'empatage, mais aussi une partie de la couleur, du corps, de la mousse et du profil aromatique. Les autres fermentescibles, comme certains sucres ou extraits, peuvent completer la recette, mais le malt reste le repere principal pour comprendre la structure d'une biere.",
                sourceIds: [],
              },
              {
                id: "definition-fermentescible",
                type: "definition",
                term: "Fermentescible",
                definition:
                  "Ingredient qui apporte des sucres pouvant etre transformes en alcool et en dioxyde de carbone par la levure.",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "example-malt-role",
                type: "example",
                title: "Lecture simple",
                body: "Augmenter la charge de malt augmente souvent l'OG et donc le potentiel alcool, mais le type de malt et le profil d'empatage influencent aussi le corps et la FG.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes",
            title: "Repères rapides",
            blocks: [
              {
                id: "reperes-paragraph-1",
                type: "paragraph",
                text: "OG signifie Original Gravity : c'est la densite du mout avant fermentation. FG signifie Final Gravity : c'est la densite apres fermentation. ABV exprime le pourcentage d'alcool final. L'attenuation indique la part des sucres consommee par la levure. Ces quatre notions permettent de relier recette, fermentation et resultat en bouche.",
                sourceIds: [],
              },
              {
                id: "definition-og-fg",
                type: "definition",
                term: "OG et FG",
                definition:
                  "L'OG represente la densite initiale avant fermentation ; la FG represente la densite finale apres fermentation.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "og-fg",
            title: "Comprendre OG et FG",
            blocks: [
              {
                id: "og-fg-paragraph-1",
                type: "paragraph",
                text: "Pense l'OG comme la quantite de sucres disponibles au depart, puis la FG comme ce qu'il reste a la fin. L'ecart entre OG et FG montre si la levure a transforme les sucres comme prevu. Une OG elevee donne plus de potentiel alcool. Une FG basse donne une biere plus seche. Une FG haute peut donner plus de rondeur, mais peut aussi signaler une fermentation incomplete si elle n'etait pas attendue.",
                sourceIds: [],
              },
              {
                id: "example-og-fg",
                type: "example",
                title: "Exemple courant",
                body: "Une biere qui passe de 1,060 a 1,012 a fermente de facon coherente pour beaucoup d'Ales, avec une finale plutot seche et un ABV autour de 6,3%.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "abv",
            title: "Calculer l'alcool simplement",
            blocks: [
              {
                id: "abv-paragraph-1",
                type: "paragraph",
                text: "La formule pratique la plus courante est ABV environ egal a OG moins FG, multiplie par 131,25. Elle transforme un ecart de densite en estimation du pourcentage d'alcool. Ce n'est pas une loi physique parfaite, mais c'est un repere fiable pour le brassage amateur.",
                sourceIds: [],
              },
              {
                id: "fermentables-calculator",
                type: "calculatorCta",
                calculatorSlug: "fermentescibles",
                title: "Estimer alcool et atténuation",
                description:
                  "Utiliser le calculateur fermentescibles pour relier OG, FG, atténuation et ABV.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "attenuation",
            title: "Estimer la FG avec l'atténuation",
            blocks: [
              {
                id: "attenuation-paragraph-1",
                type: "paragraph",
                text: "L'attenuation annoncee par une levure aide a prevoir une FG realiste avant le brassage. Une Ale se situe souvent autour de 70 a 85% d'attenuation apparente, selon la souche, la recette et le profil d'empatage. Une biere plus attenuee sera souvent plus seche ; une biere moins attenuee gardera plus de corps ou de sucres residuels.",
                sourceIds: [],
              },
              {
                id: "definition-attenuation",
                type: "definition",
                term: "Attenuation apparente",
                definition:
                  "Pourcentage de baisse de densite observe entre OG et FG. Elle estime la part des sucres consommee pendant la fermentation.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "plages",
            title: "Plages utiles pour se repérer",
            blocks: [
              {
                id: "plages-paragraph-1",
                type: "paragraph",
                text: "Une OG autour de 1,044 a 1,050 correspond souvent a des bieres legeres. Une OG autour de 1,055 a 1,070 correspond a de nombreuses IPA et bieres plus fortes. Une FG autour de 1,008 a 1,012 donne souvent une finale seche ; une FG au-dessus de 1,015 donne souvent plus de douceur et de corps. En brassage maison, beaucoup de recettes courantes se situent entre 4% et 7% ABV.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "pieges",
            title: "Pièges fréquents à éviter",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes sont de lire la densite sans corriger la temperature de mesure, de melanger SG, degres Plato et points sans conversion, d'oublier que la levure influence la FG, ou de croire que plus de malt donne toujours une meilleure biere. Le malt doit rester coherent avec le style, la levure, l'empatage et l'equilibre final recherche.",
                sourceIds: [],
              },
              {
                id: "related-yeast",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "couleur",
      metadata: {
        title: "Couleur",
        summary:
          "Repère pratique sur la couleur, l'apport des malts, les MCU, SRM, EBC et l'estimation Morey.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["color", "malt", "srm", "ebc"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "fermentescibles"],
        relatedGlossaryTerms: ["malt", "srm", "ebc"],
        relatedCalculators: [
          {
            slug: "couleur",
            label: "Color calculator",
            reason: "Estimate final beer color from malt bill and volume.",
            target: {
              type: "calculator",
              slug: "couleur",
            },
          },
        ],
        learningObjectives: [
          "Expliquer pourquoi la couleur est un signal de régularité d'une recette.",
          "Distinguer couleur des malts, MCU, SRM et EBC.",
          "Identifier les erreurs fréquentes dans l'estimation de la couleur.",
        ],
        prerequisites: ["brewing-overview", "malt-basics"],
        teaches: [
          "beer-color",
          "malt-color-contribution",
          "srm-ebc-conversion",
        ],
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
          reviewedAt: "2026-07-07",
          notes: ["Migrated from the legacy mobile Academy color topic."],
        },
      },
      body: {
        sections: [
          {
            id: "role-couleur",
            title: "Pourquoi la couleur est un repère clé",
            blocks: [
              {
                id: "role-couleur-paragraph-1",
                type: "paragraph",
                text: "La couleur n'est pas seulement esthetique. Elle annonce souvent une partie du profil attendu : biere pale et legere, ambrage caramelise, ou expression torrefiee. Elle aide aussi a verifier que la recette reste coherente avec le style vise. Une IPA ambree, une Pilsner pale et une Stout ne racontent pas la meme chose avant meme la premiere gorgee.",
                sourceIds: [],
              },
              {
                id: "role-couleur-paragraph-2",
                type: "paragraph",
                text: "La couleur reste toutefois un indicateur, pas une preuve de gout. Deux bieres de couleur proche peuvent etre tres differentes si les malts, le houblonnage, la fermentation ou le process changent.",
                sourceIds: [],
              },
              {
                id: "example-style-color",
                type: "example",
                title: "Lecture rapide",
                body: "Une Pilsner tres claire attend un profil net et leger ; une Stout noire annonce souvent des malts torrefies et une perception plus intense.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes",
            title: "Repères rapides",
            blocks: [
              {
                id: "reperes-paragraph-1",
                type: "paragraph",
                text: "La couleur de la biere depend surtout des malts et du volume final. Le MCU est une unite intermediaire calculee depuis les malts. Le SRM est l'echelle souvent utilisee cote americain ; l'EBC est l'echelle courante en Europe. En repere pratique, EBC vaut environ SRM multiplie par 1,97.",
                sourceIds: [],
              },
              {
                id: "definition-srm-ebc",
                type: "definition",
                term: "SRM et EBC",
                definition:
                  "Deux echelles de couleur de la biere. Le SRM est courant aux Etats-Unis, l'EBC en Europe ; EBC vaut environ SRM x 1,97.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "morey",
            title: "Calculer la couleur avec Morey",
            blocks: [
              {
                id: "morey-paragraph-1",
                type: "paragraph",
                text: "La methode courante en brassage amateur consiste a calculer le MCU depuis la charge de malts, puis a estimer le SRM avec la formule de Morey. Le SRM est environ egal a 1,4922 multiplie par MCU puissance 0,6859. Cette relation n'est pas lineaire, car la perception de couleur ne progresse pas simplement comme la quantite de malt colore.",
                sourceIds: [],
              },
              {
                id: "color-calculator",
                type: "calculatorCta",
                calculatorSlug: "couleur",
                title: "Estimer la couleur finale",
                description:
                  "Utiliser le calculateur couleur pour relier malts, volume final, SRM et EBC.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "exemple",
            title: "Exemple simple",
            blocks: [
              {
                id: "exemple-paragraph-1",
                type: "paragraph",
                text: "Si une recette donne un MCU de 10,3, la formule de Morey donne un SRM proche de 7,4. La conversion EBC donne ensuite environ 14,6. Visuellement, cela correspond a un dore soutenu. Ce resultat reste une estimation : le process, le volume final, l'ebullition et la perception visuelle peuvent faire varier le rendu.",
                sourceIds: [],
              },
              {
                id: "example-color-estimate",
                type: "example",
                title: "MCU vers EBC",
                body: "MCU 10,3 donne environ SRM 7,4, puis EBC 14,6. La lecture pratique est une couleur doree soutenue.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "plages",
            title: "Plages utiles",
            blocks: [
              {
                id: "plages-paragraph-1",
                type: "paragraph",
                text: "Le calculateur classe la couleur depuis l'echelle SRM : tres clair jusqu'a 3, paille ou dore clair jusqu'a 6, dore jusqu'a 10, ambre clair jusqu'a 15, ambre jusqu'a 22, brun clair jusqu'a 30, brun jusqu'a 35, puis tres fonce ou noir. L'equivalent EBC est obtenu ensuite par conversion depuis le SRM.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "pieges",
            title: "Pièges fréquents à éviter",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes sont de confondre l'EBC du malt avec l'EBC final de la biere, d'oublier l'impact du volume final, de croire que MCU et SRM sont identiques, ou de surdoser les malts torrefies pour atteindre une couleur sans tenir compte de leur impact aromatique.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "carbonatation",
      metadata: {
        title: "Carbonatation",
        summary:
          "Repère pratique sur les objectifs de carbonatation, le CO2 résiduel, le sucre de refermentation et le conditionnement sûr.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["carbonation", "packaging", "priming", "safety"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "levures"],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "carbonatation",
            label: "Carbonation calculator",
            reason: "Estimate priming sugar for a target carbonation level.",
            target: {
              type: "calculator",
              slug: "carbonatation",
            },
          },
        ],
        learningObjectives: [
          "Choisir une cible de carbonatation adaptée à un style de bière.",
          "Comprendre le CO2 résiduel et les calculs de sucre de refermentation.",
          "Identifier les contrôles de sécurité nécessaires avant l'embouteillage.",
        ],
        prerequisites: ["brewing-overview", "fermentation-basics"],
        teaches: ["carbonation-targets", "priming-sugar", "packaging-safety"],
        sensitive: true,
        riskTopics: ["bottle-pressure", "priming-dosage"],
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
          notes: [
            "Migrated from the legacy mobile Academy carbonation topic.",
            "Safety wording kept explicit because bottling too early can create dangerous pressure.",
          ],
        },
      },
      body: {
        sections: [
          {
            id: "role-carbonatation",
            title: "Pourquoi la carbonatation est critique",
            blocks: [
              {
                id: "role-carbonatation-paragraph-1",
                type: "paragraph",
                text: "La carbonatation ne sert pas seulement a faire des bulles. Elle influence la mousse, la perception des aromes, la sensation en bouche et la coherence avec le style. Une cible trop faible donne une biere plate ; une cible trop elevee peut provoquer du gushing, une sensation agressive et, en bouteille, un risque de surpression.",
                sourceIds: [],
              },
              {
                id: "example-carbonation-style",
                type: "example",
                title: "Lecture sensorielle",
                body: "Une Bitter anglaise reste souvent peu petillante et douce au service, alors qu'une Saison ou une Weizen peut demander une carbonatation nettement plus elevee avec un contenant adapte.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes",
            title: "Repères rapides",
            blocks: [
              {
                id: "reperes-paragraph-1",
                type: "paragraph",
                text: "Un volume de CO2 signifie un litre de CO2 dissous dans un litre de biere. La biere contient deja du CO2 residuel apres fermentation, et cette quantite depend surtout de la temperature la plus haute atteinte avant conditionnement. Plus la biere est froide, plus elle retient naturellement le CO2. Le priming consiste a ajouter une quantite precise de sucre avant embouteillage pour generer le CO2 manquant.",
                sourceIds: [],
              },
              {
                id: "definition-volume-co2",
                type: "definition",
                term: "Volume de CO2",
                definition:
                  "Unite pratique de carbonatation. Une biere a 2,4 volumes contient environ 2,4 litres de CO2 dissous par litre de biere.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "priming",
            title: "Calculer le sucre de priming",
            blocks: [
              {
                id: "priming-paragraph-1",
                type: "paragraph",
                text: "Le calcul part de trois donnees : la cible de CO2, le CO2 residuel et le volume de biere a conditionner. Pour du glucose ou dextrose, un repere pratique est : sucre en grammes environ egal a CO2 cible moins CO2 residuel, multiplie par le volume en litres, puis par 4,0. Pour du saccharose, la quantite est legerement plus faible, avec un coefficient pratique autour de 3,8.",
                sourceIds: [],
              },
              {
                id: "carbonation-calculator",
                type: "calculatorCta",
                calculatorSlug: "carbonatation",
                title: "Calculer le sucre de priming",
                description:
                  "Utiliser le calculateur carbonatation pour relier volume, température, cible CO2 et type de sucre.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "co2-residuel",
            title: "CO2 résiduel et température",
            blocks: [
              {
                id: "co2-residuel-paragraph-1",
                type: "paragraph",
                text: "Le CO2 residuel doit etre estime avec la temperature la plus haute atteinte par la biere avant conditionnement, pas seulement la temperature du jour de mise en bouteille. Comme ordre de grandeur, une biere proche de 0°C retient environ 1,7 volume, autour de 10°C environ 1,2 volume, et autour de 20°C environ 0,85 volume. Ces valeurs servent de repere ; le calculateur doit rester la source de dosage pratique.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "exemple-20l",
            title: "Exemple concret",
            blocks: [
              {
                id: "exemple-20l-paragraph-1",
                type: "paragraph",
                text: "Pour un lot de 20 L a 20°C avec une cible de 2,4 volumes de CO2, le CO2 residuel peut etre estime autour de 0,85 volume. Le CO2 manquant est donc environ 1,55 volume. Avec du dextrose, le dosage approche 1,55 x 20 x 4,0, soit environ 124 g.",
                sourceIds: [],
              },
              {
                id: "example-priming-20l",
                type: "example",
                title: "Lot de 20 L",
                body: "Une erreur de quelques dizaines de grammes peut deja changer fortement le resultat. Le sucre doit etre pese precisement et melange uniformement.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "cibles-style",
            title: "Cibles utiles par style",
            blocks: [
              {
                id: "cibles-style-paragraph-1",
                type: "paragraph",
                text: "Une Bitter ou une Stout anglaise se situe souvent autour de 1,8 a 2,2 volumes. Une Pale Ale ou une IPA vise souvent 2,2 a 2,6 volumes. Une Belgian Ale ou une biere de ble peut monter autour de 2,6 a 3,2 volumes. Les cibles tres hautes, comme certaines Saisons ou Weizen, exigent des bouteilles adaptees a la pression et une verification stricte de la fermentation terminee.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "methodes",
            title: "Priming bouteille et force carbonation",
            blocks: [
              {
                id: "methodes-paragraph-1",
                type: "paragraph",
                text: "Le priming est simple, autonome et adapte au conditionnement bouteille. La force carbonation est plus rapide et plus precise pour le service en fut, mais elle depend de la temperature de service et de la pression appliquee. En bouteille, l'homogeneisation du sirop de sucre est essentielle pour eviter des bouteilles sous-carbonatees et d'autres sur-carbonatees.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "securite",
            title: "Pièges et sécurité",
            blocks: [
              {
                id: "securite-paragraph-1",
                type: "paragraph",
                text: "Ne jamais embouteiller une biere dont la FG n'est pas stable. Une fermentation encore active peut creer une surpression dangereuse. Les autres erreurs critiques sont un dosage approximatif du sucre, une mauvaise homogeneisation du sirop, une temperature residuelle mal estimee, ou l'utilisation de bouteilles non compatibles avec la pression cible.",
                sourceIds: [],
              },
              {
                id: "related-yeast",
                type: "relatedArticle",
                articleSlug: "levures",
                sectionId: "fermentation",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "checklist",
            title: "Checklist conditionnement",
            blocks: [
              {
                id: "checklist-paragraph-1",
                type: "paragraph",
                text: "Avant conditionnement, verifier que la FG est stable sur 2 a 3 jours, noter la temperature la plus haute atteinte avant packaging, calculer et peser le sucre avec precision, melanger doucement et uniformement, utiliser des contenants adaptes a la pression visee, puis controler une bouteille test apres 7 a 10 jours.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "rendement",
      metadata: {
        title: "Rendement",
        summary:
          "Repère pratique sur le rendement, les points de densité, les pertes de process et le plan d'eau.",
        category: "process",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 9,
        tags: ["efficiency", "gravity", "volumes", "water-plan"],
        updatedAt: "2026-07-07",
        relatedArticles: ["fermentescibles", "eau"],
        relatedGlossaryTerms: ["malt", "densite-initiale", "mout"],
        relatedCalculators: [
          {
            slug: "rendement",
            label: "Efficiency calculator",
            reason:
              "Estimate brewhouse efficiency, process losses, and water plan.",
            target: {
              type: "calculator",
              slug: "rendement",
            },
          },
        ],
        learningObjectives: [
          "Expliquer le rendement global à partir de l'OG mesurée, du volume et des fermentescibles.",
          "Identifier où les points de densité et le volume se perdent dans le process.",
          "Utiliser l'historique mesuré plutôt que des hypothèses théoriques.",
        ],
        prerequisites: ["malt-basics", "water-profile"],
        teaches: [
          "brewhouse-efficiency",
          "gravity-points",
          "process-losses",
          "water-planning",
        ],
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
          reviewedAt: "2026-07-07",
          notes: [
            "Migrated from the legacy mobile Academy efficiency topic.",
            "Aligned with the existing Rendement calculator tabs: efficiency, volumes, and water plan.",
          ],
        },
      },
      body: {
        sections: [
          {
            id: "role-rendement",
            title: "Pourquoi le rendement est critique",
            blocks: [
              {
                id: "role-rendement-paragraph-1",
                type: "paragraph",
                text: "Le rendement mesure ce que ton installation extrait reellement du potentiel des fermentescibles. Il relie la masse de malt, le potentiel PPG, l'OG mesuree et le volume final. Un rendement mal connu rend les recettes imprevisibles : OG trop basse, ABV plus faible que prevu, ou besoin de malt surestime.",
                sourceIds: [],
              },
              {
                id: "example-efficiency-impact",
                type: "example",
                title: "Impact concret",
                body: "Si ton rendement reel est 67% mais que ta recette suppose 75%, l'OG obtenue sera plus basse que prevu ou il faudra davantage de malt pour atteindre la meme cible.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes",
            title: "Repères rapides",
            blocks: [
              {
                id: "reperes-paragraph-1",
                type: "paragraph",
                text: "Les points de densite viennent de l'OG : 1,060 correspond a 60 points. Le PPG exprime le potentiel theorique d'un fermentescible. Les points reels combinent la densite mesuree et le volume obtenu. Les points theoriques viennent du grain bill. Le rendement global compare ces points reels au potentiel total de la recette.",
                sourceIds: [],
              },
              {
                id: "definition-brewhouse-efficiency",
                type: "definition",
                term: "Rendement global",
                definition:
                  "Pourcentage du potentiel fermentescible de la recette retrouve dans le volume mesure. Il combine extraction, pertes process et volume final.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "calcul-rendement",
            title: "Calculer le rendement global",
            blocks: [
              {
                id: "calcul-rendement-paragraph-1",
                type: "paragraph",
                text: "Le calculateur existant utilise l'OG mesuree, le volume final et les lignes de fermentescibles avec leur PPG. Les points reels sont normalises depuis OG et volume. Les points theoriques additionnent masse de chaque fermentescible et PPG. Le rendement global est le rapport entre ces deux valeurs.",
                sourceIds: [],
              },
              {
                id: "efficiency-calculator",
                type: "calculatorCta",
                calculatorSlug: "rendement",
                title: "Calculer rendement, volumes et plan d'eau",
                description:
                  "Utiliser le calculateur rendement pour relier OG mesuree, grain bill, pertes process et volumes d'eau.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "plages",
            title: "Rendements réalistes",
            blocks: [
              {
                id: "plages-paragraph-1",
                type: "paragraph",
                text: "Les valeurs utiles dependent fortement de l'installation et de la methode. Un BIAB peut souvent se situer autour de 60 a 70%. Une installation amateur trois cuves bien reglee se situe souvent autour de 70 a 78%. Un systeme RIMS ou HERMS amateur peut monter davantage. Le plus important n'est pas d'avoir la valeur la plus haute, mais une valeur stable, mesuree et reutilisable dans les recettes.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "pertes",
            title: "Où se perd le rendement",
            blocks: [
              {
                id: "pertes-paragraph-1",
                type: "paragraph",
                text: "Le concassage influence fortement l'acces aux sucres. L'empatage peut perdre en efficacite si le pH ou la temperature sortent de la zone utile. La filtration et le rincage sont souvent une grande source de pertes en amateur. Les transferts, le trub, l'evaporation et le refroidissement changent aussi le volume final, donc le rendement global.",
                sourceIds: [],
              },
              {
                id: "example-process-losses",
                type: "example",
                title: "Ne pas isoler un seul chiffre",
                body: "Deux brassins avec la meme extraction peuvent afficher un rendement global different si les pertes de volume au transfert ou au trub changent.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "volumes-eau",
            title: "Volumes et plan d'eau",
            blocks: [
              {
                id: "volumes-eau-paragraph-1",
                type: "paragraph",
                text: "Le calculateur rendement couvre aussi les volumes process : volume froid cible, evaporation, pertes au trub, retrait au refroidissement, eau d'empatage et eau de rincage. Ces volumes ne sont pas accessoires. Une bonne estimation du volume pre-ebullition et du plan d'eau rend l'OG finale plus previsible.",
                sourceIds: [],
              },
              {
                id: "related-water",
                type: "relatedArticle",
                articleSlug: "eau",
                sectionId: "profil-mineral",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "methode",
            title: "Méthode de progression",
            blocks: [
              {
                id: "methode-paragraph-1",
                type: "paragraph",
                text: "Mesurer OG et volume final a chaque brassin. Calculer le rendement reel et le noter. Modifier une seule variable a la fois : concassage, rincage, ratio d'eau, pH ou pertes process. Re-mesurer au brassin suivant. Quand la valeur se stabilise, recalibrer les recettes sur ton rendement reel plutot que sur une valeur ideale.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "pieges",
            title: "Pièges fréquents à éviter",
            blocks: [
              {
                id: "pieges-paragraph-1",
                type: "paragraph",
                text: "Les erreurs les plus courantes sont d'utiliser un rendement theorique jamais verifie, de changer plusieurs parametres en meme temps, de confondre rendement d'extraction et rendement global, ou d'oublier les pertes de volume. Un chiffre de rendement n'est utile que s'il est mesure avec une methode constante.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "avances",
      metadata: {
        title: "Calculs avancés",
        summary:
          "Repère pratique sur les diagnostics avancés : pouvoir diastasique, indicateurs de moût et correction d'altitude.",
        category: "process",
        level: "advanced",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 11,
        tags: ["advanced", "enzymes", "wort", "altitude"],
        updatedAt: "2026-07-07",
        relatedArticles: [
          "fermentescibles",
          "rendement",
          "houblons",
          "carbonatation",
        ],
        relatedGlossaryTerms: [],
        relatedCalculators: [
          {
            slug: "avances",
            label: "Advanced calculator",
            reason:
              "Diagnose enzymes, wort indicators, and altitude corrections.",
            target: {
              type: "calculator",
              slug: "avances",
            },
          },
        ],
        learningObjectives: [
          "Identifier quand les diagnostics avancés sont utiles.",
          "Comprendre les trois zones du calculateur : enzymes, moût et altitude.",
          "Éviter de traiter les estimations avancées comme des vérités absolues.",
        ],
        prerequisites: [
          "malt-basics",
          "brewhouse-efficiency",
          "hop-bitterness",
        ],
        teaches: [
          "advanced-diagnostics",
          "diastatic-power",
          "wort-diagnostics",
          "altitude-corrections",
        ],
        sensitive: true,
        riskTopics: ["advanced-estimates", "process-diagnostics"],
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
          notes: [
            "Migrated from the legacy mobile Academy advanced calculations topic.",
            "Aligned with the existing Advanced calculator tabs: enzymes, wort, and altitude.",
          ],
        },
      },
      body: {
        sections: [
          {
            id: "role-avances",
            title: "Pourquoi ces calculs sont avancés",
            blocks: [
              {
                id: "role-avances-paragraph-1",
                type: "paragraph",
                text: "Les calculs avancés ne servent pas a brasser une premiere biere. Ils deviennent utiles quand tu veux diagnostiquer un ecart difficile : conversion incomplete, filtration lente, fermentation moins previsible, ou adaptation a l'altitude. Le but n'est pas d'empiler des chiffres, mais de relier un symptome a une cause possible.",
                sourceIds: [],
              },
              {
                id: "example-advanced-use",
                type: "example",
                title: "Bon usage",
                body: "Si une recette donne une FG instable et une filtration lente, les indicateurs de moût peuvent aider a orienter l'analyse, mais ils ne remplacent pas les mesures terrain.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "familles",
            title: "Les trois familles du calculateur",
            blocks: [
              {
                id: "familles-paragraph-1",
                type: "paragraph",
                text: "Le calculateur avancé est organise en trois axes. L'onglet Enzymes estime la puissance diastasique totale et moyenne a partir des malts. L'onglet Mout regroupe indice de Kolbach, viscosite estimee et FAN estime. L'onglet Altitude estime le point d'ebullition, la pression atmospherique et l'ajustement pratique d'une cible IBU.",
                sourceIds: [],
              },
              {
                id: "advanced-calculator",
                type: "calculatorCta",
                calculatorSlug: "avances",
                title: "Ouvrir les diagnostics avancés",
                description:
                  "Utiliser le calculateur Calculs avancés pour travailler sur enzymes, moût et altitude sans dupliquer les formules.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "enzymes",
            title: "Puissance diastasique",
            blocks: [
              {
                id: "enzymes-paragraph-1",
                type: "paragraph",
                text: "La puissance diastasique represente la capacite enzymatique d'un grain bill a convertir l'amidon en sucres. Le calculateur additionne la masse de chaque malt multipliee par sa puissance WK, puis calcule une moyenne ponderee par kilogramme de recette. Les malts de base portent generalement l'essentiel de cette force ; les malts speciaux ou torrefies contribuent souvent beaucoup moins.",
                sourceIds: [],
              },
              {
                id: "definition-diastatic-power",
                type: "definition",
                term: "Puissance diastasique",
                definition:
                  "Indicateur de capacite enzymatique d'un malt ou d'un assemblage de malts a convertir l'amidon pendant l'empatage.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "mout",
            title: "Diagnostic du moût",
            blocks: [
              {
                id: "mout-paragraph-1",
                type: "paragraph",
                text: "L'indice de Kolbach compare l'azote soluble a l'azote total. Les beta-glucanes servent d'indicateur de viscosite potentielle. Le FAN estime l'azote assimilable par la levure a partir de l'indice de Kolbach et de l'OG. Ces valeurs sont des indicateurs de diagnostic, pas des verdicts isoles : elles doivent etre croisees avec la recette, le malt, le pH, la temperature et le comportement de fermentation.",
                sourceIds: [],
              },
              {
                id: "example-wort-diagnostic",
                type: "example",
                title: "Lecture prudente",
                body: "Un FAN estime peut expliquer une fermentation difficile, mais il faut aussi regarder la souche, le pitch rate, l'oxygenation et la temperature.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "altitude",
            title: "Altitude et pression",
            blocks: [
              {
                id: "altitude-paragraph-1",
                type: "paragraph",
                text: "En altitude, le point d'ebullition baisse et la pression atmospherique diminue. Le calculateur estime ces effets et applique un facteur pratique pour ajuster une cible IBU. Cette correction ne remplace pas la degustation ni le suivi de recette, mais elle aide a comprendre pourquoi une meme ebullition peut extraire un peu moins d'amertume dans un contexte different.",
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
          {
            id: "limites",
            title: "Limites et bonnes pratiques",
            blocks: [
              {
                id: "limites-paragraph-1",
                type: "paragraph",
                text: "Ces calculs utilisent des estimations. Ils sont utiles pour comparer, diagnostiquer et stabiliser une methode, mais ils ne doivent pas etre presentes comme des certitudes absolues. Pour progresser proprement, modifier une variable a la fois, garder les memes unites, noter les mesures, puis verifier le resultat sur le brassin suivant.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "checklist",
            title: "Checklist mode expert",
            blocks: [
              {
                id: "checklist-paragraph-1",
                type: "paragraph",
                text: "Verifier la puissance enzymatique quand la recette contient beaucoup de malts speciaux. Controler Kolbach, beta-glucanes et FAN seulement quand le besoin existe ou que les donnees malt sont disponibles. Croiser les corrections d'altitude avec le houblonnage, la carbonatation et les retours de degustation.",
                sourceIds: [],
              },
            ],
          },
        ],
      },
    },
    {
      slug: "glossaire",
      metadata: {
        title: "Glossaire brassicole",
        summary:
          "Repère pratique pour comprendre le vocabulaire brassicole, les unités, les acronymes et les confusions techniques.",
        category: "glossary",
        level: "beginner",
        status: "published",
        version: "1.0.0",
        estimatedReadTimeMinutes: 8,
        tags: ["glossary", "vocabulary", "reference"],
        updatedAt: "2026-07-07",
        relatedArticles: ["introduction", "houblons", "levures", "eau"],
        relatedGlossaryTerms: [
          "ibu",
          "acide-alpha",
          "profil-mineral",
          "malt",
          "mout",
          "densite-initiale",
          "densite-finale",
          "attenuation",
          "srm",
          "ebc",
          "ph",
        ],
        relatedCalculators: [],
        learningObjectives: [
          "Comprendre comment lire une entrée de glossaire brassicole.",
          "Distinguer mesures, valeurs calculées et cibles de process.",
          "Identifier les familles de vocabulaire fréquentes dans l'Académie.",
        ],
        prerequisites: ["brewing-overview"],
        teaches: ["brewing-vocabulary", "technical-reading"],
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
        review: {
          confidenceLevel: "reviewed",
          reviewedBy: "Academy editorial review",
          reviewedAt: "2026-07-07",
          notes: ["Migrated from the legacy mobile Academy glossary topic."],
        },
      },
      body: {
        sections: [
          {
            id: "pourquoi-glossaire",
            title: "Pourquoi un glossaire brassicole",
            blocks: [
              {
                id: "pourquoi-glossaire-paragraph-1",
                type: "paragraph",
                text: "En brassage, une decision depend souvent d'un mot technique bien compris : OG, FG, attenuation, IBU, pH, RA, pitch rate ou volumes CO2. Le glossaire sert de reference rapide pour lire une recette, comprendre une fiche technique et relier chaque terme a une action concrete.",
                sourceIds: [],
              },
              {
                id: "example-vocabulary-decision",
                type: "example",
                title: "Vocabulaire utile",
                body: "IBU aide a raisonner l'amertume calculee, mais ne remplace pas la degustation. Le mot est utile seulement si on sait aussi ce qu'il mesure et ce qu'il ne mesure pas.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "lire-entree",
            title: "Comment lire une entrée",
            blocks: [
              {
                id: "lire-entree-paragraph-1",
                type: "paragraph",
                text: "Une bonne entree de glossaire doit donner une definition simple, l'unite associee quand elle existe, l'impact pratique sur le process, puis la confusion frequente a eviter. Cette structure evite d'apprendre des acronymes sans savoir quoi en faire pendant un brassin.",
                sourceIds: [],
              },
              {
                id: "reference-ibu",
                type: "glossaryReference",
                termSlug: "ibu",
                label: "IBU",
                sourceIds: ["palmer-2017"],
              },
              {
                id: "reference-profil-mineral",
                type: "glossaryReference",
                termSlug: "profil-mineral",
                label: "Profil minéral",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "familles",
            title: "Familles de termes couvertes",
            blocks: [
              {
                id: "familles-paragraph-1",
                type: "paragraph",
                text: "Les termes de densite et d'alcool couvrent OG, FG, ABV, attenuation et degres Plato. Les termes d'amertume et de couleur couvrent IBU, BU:GU, MCU, SRM et EBC. Les termes d'eau et de chimie couvrent pH, alcalinite residuelle, sulfates, chlorures et bicarbonates. Les termes de fermentation couvrent pitch rate, floculation, repos diacetyle et nutriments de levure.",
                sourceIds: [],
              },
              {
                id: "definition-mesure-cible",
                type: "definition",
                term: "Mesure, calcul et cible",
                definition:
                  "Une mesure vient d'un instrument, un calcul derive une valeur, et une cible represente l'objectif process choisi pour une recette.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "reperes",
            title: "Repères incontournables",
            blocks: [
              {
                id: "reperes-paragraph-1",
                type: "paragraph",
                text: "Les premiers reperes a maitriser sont OG pour la densite initiale, FG pour la densite finale, ABV pour l'alcool, IBU pour l'amertume calculee, EBC ou SRM pour la couleur, pH pour l'acidite, attenuation pour la part des sucres fermentes, pitch rate pour la quantite de levure, RA pour l'effet tampon de l'eau, et volumes CO2 pour la carbonatation.",
                sourceIds: [],
              },
              {
                id: "reference-acide-alpha",
                type: "glossaryReference",
                termSlug: "acide-alpha",
                label: "Acide alpha",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "confusions",
            title: "Confusions fréquentes",
            blocks: [
              {
                id: "confusions-paragraph-1",
                type: "paragraph",
                text: "Les confusions les plus courantes sont de melanger OG et FG avec ABV, de confondre EBC du malt et couleur finale de la biere, de prendre les IBU theoriques pour l'amertume reellement percue, de melanger SG, points et degres Plato sans conversion, ou de comparer un pH mesure a chaud avec une cible prevue a temperature de lecture.",
                sourceIds: [],
              },
            ],
          },
          {
            id: "methode",
            title: "Méthode d'apprentissage rapide",
            blocks: [
              {
                id: "methode-paragraph-1",
                type: "paragraph",
                text: "Commencer par memoriser les reperes essentiels, puis associer chaque terme a une decision concrete : corriger une recette, choisir une levure, ajuster l'eau ou diagnostiquer un brassin. Ajouter les unites dans les notes de brassage aide a eviter les erreurs de lecture. Apres chaque brassin, revenir au glossaire pour consolider les termes rencontres en pratique.",
                sourceIds: [],
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
      shortDefinition:
        "Estimation de l'amertume utilisée dans les recettes de bière.",
      detailedDefinition:
        "L'IBU estime la concentration de composés amers apportés principalement par le houblon après ébullition.",
      relatedTerms: ["acide-alpha", "houblon"],
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
      slug: "houblon",
      label: "Houblon",
      aliases: ["hops"],
      shortDefinition:
        "Fleur utilisée en brassage pour apporter amertume, arômes et stabilité.",
      detailedDefinition:
        "Le houblon apporte des composés amers, des huiles aromatiques et des polyphénols. Son effet dépend de la variété, de la quantité et du moment d'ajout.",
      relatedTerms: ["ibu", "acide-alpha"],
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
      shortDefinition:
        "Composé du houblon qui contribue au potentiel d'amertume.",
      detailedDefinition:
        "Les acides alpha sont des composés du houblon qui s'isomérisent pendant l'ébullition et participent à l'amertume.",
      relatedTerms: ["ibu", "houblon"],
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
      slug: "malt",
      label: "Malt",
      aliases: ["malted grain"],
      shortDefinition:
        "Céréale germée puis séchée qui fournit amidon, enzymes, couleur et arômes.",
      detailedDefinition:
        "Le malt est la base fermentescible de nombreuses bières. Pendant l'empâtage, ses enzymes transforment l'amidon en sucres utilisables par la levure.",
      relatedTerms: ["empatage", "mout", "ebc"],
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
      slug: "mout",
      label: "Moût",
      aliases: ["wort"],
      shortDefinition:
        "Liquide sucré obtenu après empâtage et filtration, avant fermentation.",
      detailedDefinition:
        "Le moût contient les sucres, protéines, minéraux et composés aromatiques extraits des malts. Il devient bière après fermentation par la levure.",
      relatedTerms: ["malt", "densite-initiale", "fermentation"],
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
      slug: "empatage",
      label: "Empâtage",
      aliases: ["mash", "mashing"],
      shortDefinition:
        "Étape où les grains concassés sont mélangés à l'eau chaude pour convertir l'amidon en sucres.",
      detailedDefinition:
        "L'empâtage active les enzymes du malt dans une plage de température et de pH contrôlée. Il influence fermentescibilité, corps, rendement et profil final.",
      relatedTerms: ["malt", "mout", "ph"],
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
      slug: "densite-initiale",
      label: "Densité initiale",
      aliases: ["OG", "Original Gravity"],
      shortDefinition: "Densité du moût avant fermentation.",
      detailedDefinition:
        "La densité initiale estime la quantité de sucres disponibles avant fermentation. Elle sert à estimer le potentiel alcool et à comparer la recette au résultat attendu.",
      relatedTerms: ["mout", "densite-finale", "attenuation"],
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
      slug: "densite-finale",
      label: "Densité finale",
      aliases: ["FG", "Final Gravity"],
      shortDefinition:
        "Densité mesurée lorsque la fermentation est terminée ou stabilisée.",
      detailedDefinition:
        "La densité finale indique les sucres et composés restants après fermentation. Combinée à la densité initiale, elle permet d'estimer atténuation et alcool.",
      relatedTerms: ["densite-initiale", "attenuation", "fermentation"],
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
      slug: "attenuation",
      label: "Atténuation",
      aliases: ["atténuation apparente"],
      shortDefinition:
        "Baisse relative de densité entre le début et la fin de fermentation.",
      detailedDefinition:
        "L'atténuation apparente estime la part des sucres consommée par la levure. Elle dépend de la souche, du moût, de l'empâtage et des conditions de fermentation.",
      relatedTerms: ["densite-initiale", "densite-finale", "fermentation"],
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
      slug: "fermentation",
      label: "Fermentation",
      aliases: ["primary fermentation"],
      shortDefinition:
        "Transformation des sucres du moût en alcool, CO2 et composés aromatiques par la levure.",
      detailedDefinition:
        "La fermentation convertit les sucres fermentescibles et construit une grande partie du profil final. Température, levure, oxygène initial et nutriments influencent fortement le résultat.",
      relatedTerms: ["mout", "attenuation", "densite-finale"],
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
      slug: "srm",
      label: "SRM",
      aliases: ["Standard Reference Method"],
      shortDefinition:
        "Échelle américaine de mesure de la couleur de la bière.",
      detailedDefinition:
        "Le SRM exprime la couleur finale de la bière selon une méthode standardisée. En brassage amateur, il est souvent estimé depuis la charge de malts avec des formules comme Morey.",
      relatedTerms: ["ebc", "malt"],
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
      slug: "ebc",
      label: "EBC",
      aliases: ["European Brewery Convention"],
      shortDefinition:
        "Échelle européenne de mesure de la couleur de la bière et des malts.",
      detailedDefinition:
        "L'EBC est utilisée en Europe pour exprimer la couleur. Pour la bière finale, une approximation courante est EBC environ égal à SRM multiplié par 1,97.",
      relatedTerms: ["srm", "malt"],
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
      label: "Profil minéral",
      aliases: ["water profile"],
      shortDefinition: "Composition minérale de l'eau de brassage.",
      detailedDefinition:
        "Le profil minéral résume les ions principaux de l'eau, comme calcium, sulfates, chlorures, sodium, magnésium et bicarbonates.",
      relatedTerms: ["calcium", "sulfate", "chlorure", "ph"],
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
    {
      slug: "ph",
      label: "pH",
      aliases: ["potentiel hydrogène"],
      shortDefinition: "Mesure de l'acidité ou de la basicité d'un liquide.",
      detailedDefinition:
        "En brassage, le pH influence l'activité enzymatique, l'extraction, la fermentation et la stabilité sensorielle. Le pH d'empâtage est un repère important pour la précision du process.",
      relatedTerms: ["empatage", "profil-mineral", "calcium"],
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
    {
      slug: "calcium",
      label: "Calcium",
      aliases: ["Ca", "Ca2+"],
      shortDefinition:
        "Ion majeur de l'eau de brassage qui aide le pH, la clarification et la fermentation.",
      detailedDefinition:
        "Le calcium contribue à abaisser le pH d'empâtage, soutient certaines réactions enzymatiques et favorise la floculation. Il est souvent ajusté avec gypse ou chlorure de calcium.",
      relatedTerms: ["profil-mineral", "sulfate", "chlorure", "ph"],
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
    {
      slug: "sulfate",
      label: "Sulfate",
      aliases: ["SO4", "SO4 2-"],
      shortDefinition:
        "Ion de l'eau qui accentue souvent la sécheresse et la perception de l'amertume.",
      detailedDefinition:
        "Les sulfates peuvent renforcer une impression plus sèche et plus nette, notamment dans les bières houblonnées. Leur effet doit être évalué avec les chlorures et les valeurs absolues.",
      relatedTerms: ["profil-mineral", "calcium", "chlorure", "ibu"],
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
    {
      slug: "chlorure",
      label: "Chlorure",
      aliases: ["chloride", "Cl"],
      shortDefinition:
        "Ion de l'eau qui soutient souvent la rondeur et l'expression maltée.",
      detailedDefinition:
        "Les chlorures peuvent renforcer la perception de corps, de rondeur et de douceur maltée. Ils doivent rester équilibrés avec les sulfates et les concentrations totales.",
      relatedTerms: ["profil-mineral", "calcium", "sulfate", "malt"],
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
    {
      slug: "cervoise",
      label: "Cervoise",
      aliases: ["ale ancienne"],
      shortDefinition:
        "Boisson fermentée à base de céréales, souvent citée pour les bières européennes non houblonnées ou peu houblonnées.",
      detailedDefinition:
        "La cervoise désigne largement des boissons céréalières fermentées avant la domination du houblon comme marqueur de la bière européenne. Le terme aide à distinguer des pratiques anciennes de la bière moderne standardisée.",
      relatedTerms: ["gruit", "houblon", "fermentation"],
      sources: [
        {
          id: "hornsey-2003",
          kind: "book",
          title: "A History of Beer and Brewing",
          authors: ["Ian S. Hornsey"],
          publisher: "Royal Society of Chemistry",
          url: null,
          accessedAt: null,
          year: 2003,
          notes:
            "General reference for historical brewing development, ingredients, and industrialization.",
        },
      ],
    },
    {
      slug: "gruit",
      label: "Gruit",
      aliases: ["grut", "mélange d'herbes"],
      shortDefinition:
        "Mélange de plantes aromatiques utilisé avant ou à côté du houblon pour parfumer et équilibrer certaines bières.",
      detailedDefinition:
        "Le gruit regroupe des plantes dont la composition variait selon les régions, les droits de production et les usages locaux. Il rappelle que l'amertume et l'aromatique de la bière n'ont pas toujours été dominées par le houblon.",
      relatedTerms: ["cervoise", "houblon", "fermentation"],
      sources: [
        {
          id: "hornsey-2003",
          kind: "book",
          title: "A History of Beer and Brewing",
          authors: ["Ian S. Hornsey"],
          publisher: "Royal Society of Chemistry",
          url: null,
          accessedAt: null,
          year: 2003,
          notes:
            "General reference for historical brewing development, ingredients, and industrialization.",
        },
      ],
    },
    {
      slug: "bappir",
      label: "Bappir",
      aliases: ["pain de bière"],
      shortDefinition:
        "Préparation céréalière mésopotamienne associée aux descriptions anciennes du brassage.",
      detailedDefinition:
        "Le bappir est souvent décrit comme un pain ou une préparation de céréales utilisée dans l'imaginaire et les reconstructions du brassage mésopotamien. Il sert de repère pour comprendre que les procédés anciens ne ressemblent pas toujours à l'empâtage moderne.",
      relatedTerms: ["malt", "mout", "fermentation"],
      sources: [
        {
          id: "etcsl-ninkasi",
          kind: "website",
          title: "A hymn to Ninkasi",
          authors: ["The Electronic Text Corpus of Sumerian Literature"],
          publisher: "University of Oxford",
          url: "https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=t.4.23.1",
          accessedAt: "2026-07-13",
          year: 2006,
          notes:
            "Sumerian literary source used as a textual anchor for ancient brewing vocabulary and process imagery.",
        },
        {
          id: "hornsey-2003",
          kind: "book",
          title: "A History of Beer and Brewing",
          authors: ["Ian S. Hornsey"],
          publisher: "Royal Society of Chemistry",
          url: null,
          accessedAt: null,
          year: 2003,
          notes:
            "General reference for historical brewing development, ingredients, and industrialization.",
        },
      ],
    },
    {
      slug: "reinheitsgebot",
      label: "Reinheitsgebot",
      aliases: ["loi de pureté", "règlement bavarois de 1516"],
      shortDefinition:
        "Réglementation bavaroise de 1516 souvent associée à la composition de la bière.",
      detailedDefinition:
        "Le Reinheitsgebot est fréquemment présenté comme une loi de pureté, mais il faut le replacer dans un contexte de prix, de céréales disponibles, de fiscalité et de contrôle du marché. Il ne doit pas être lu comme une recette universelle de la bière.",
      relatedTerms: ["malt", "houblon", "lager"],
      sources: [
        {
          id: "wired-reinheitsgebot-2010",
          kind: "article",
          title: "April 23, 1516: Bavaria Cracks Down on Beer Brewers",
          authors: ["Betsy Mason"],
          publisher: "WIRED",
          url: "https://www.wired.com/2010/04/0423deutsche-reinheitsgebot-german-beer-purity-law/",
          accessedAt: "2026-07-13",
          year: 2010,
          notes:
            "Contextual article on the 1516 Bavarian beer regulation and later purity-law framing.",
        },
        {
          id: "hornsey-2003",
          kind: "book",
          title: "A History of Beer and Brewing",
          authors: ["Ian S. Hornsey"],
          publisher: "Royal Society of Chemistry",
          url: null,
          accessedAt: null,
          year: 2003,
          notes:
            "General reference for historical brewing development, ingredients, and industrialization.",
        },
      ],
    },
    {
      slug: "lager",
      label: "Lager",
      aliases: ["bière de fermentation basse"],
      shortDefinition:
        "Famille de bières associée à une fermentation plus froide et à une maturation prolongée.",
      detailedDefinition:
        "Les lagers reposent sur une fermentation et une garde plus froides que les ales classiques. Leur essor historique est lié à la maîtrise de la levure, du froid, de la maturation et de la stabilité technique.",
      relatedTerms: ["fermentation", "malt", "reinheitsgebot"],
      sources: [
        {
          id: "hornsey-2003",
          kind: "book",
          title: "A History of Beer and Brewing",
          authors: ["Ian S. Hornsey"],
          publisher: "Royal Society of Chemistry",
          url: null,
          accessedAt: null,
          year: 2003,
          notes:
            "General reference for historical brewing development, ingredients, and industrialization.",
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
      id: "aha-brewing-with-extract",
      kind: "website",
      title: "Brewing with Extract",
      authors: ["American Homebrewers Association"],
      publisher: "American Homebrewers Association",
      url: "https://www.homebrewersassociation.org/wp-content/uploads/How-To-Extract.pdf",
      accessedAt: "2026-07-27",
      year: null,
      notes:
        "Beginner brewing process, equipment, cleaning, sanitation, fermentation, and packaging reference.",
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
      id: "oqlf-houblonnage-cru-2018",
      kind: "website",
      title: "Houblonnage à cru",
      authors: ["Office québécois de la langue française"],
      publisher: "Office québécois de la langue française",
      url: "https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/2088405/houblonnage-a-cru",
      accessedAt: "2026-07-27",
      year: 2018,
      notes: "Official French terminology and definition for dry hopping.",
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
    {
      id: "liu-raqefet-2018",
      kind: "article",
      title:
        "Fermented beverage and food storage in 13,000 y-old stone mortars at Raqefet Cave, Israel: Investigating Natufian ritual feasting",
      authors: [
        "Li Liu",
        "Jiajing Wang",
        "Danny Rosenberg",
        "Hao Zhao",
        "György Lengyel",
        "Dani Nadel",
      ],
      publisher: "Journal of Archaeological Science: Reports",
      url: "https://www.sciencedirect.com/science/article/pii/S2352409X18303468",
      accessedAt: "2026-07-13",
      year: 2018,
      notes:
        "Archaeological evidence for early cereal-based fermented beverage residues at Raqefet Cave.",
    },
    {
      id: "etcsl-ninkasi",
      kind: "website",
      title: "A hymn to Ninkasi",
      authors: ["The Electronic Text Corpus of Sumerian Literature"],
      publisher: "University of Oxford",
      url: "https://etcsl.orinst.ox.ac.uk/cgi-bin/etcsl.cgi?text=t.4.23.1",
      accessedAt: "2026-07-13",
      year: 2006,
      notes:
        "Sumerian literary source used as a textual anchor for ancient brewing vocabulary and process imagery.",
    },
    {
      id: "hornsey-2003",
      kind: "book",
      title: "A History of Beer and Brewing",
      authors: ["Ian S. Hornsey"],
      publisher: "Royal Society of Chemistry",
      url: null,
      accessedAt: null,
      year: 2003,
      notes:
        "General reference for historical brewing development, ingredients, and industrialization.",
    },
    {
      id: "wired-reinheitsgebot-2010",
      kind: "article",
      title: "April 23, 1516: Bavaria Cracks Down on Beer Brewers",
      authors: ["Betsy Mason"],
      publisher: "WIRED",
      url: "https://www.wired.com/2010/04/0423deutsche-reinheitsgebot-german-beer-purity-law/",
      accessedAt: "2026-07-13",
      year: 2010,
      notes:
        "Contextual article on the 1516 Bavarian beer regulation and later purity-law framing.",
    },
  ],
  calculatorSlugs: [
    "fermentescibles",
    "houblons",
    "couleur",
    "levures",
    "carbonatation",
    "eau",
    "rendement",
    "avances",
  ],
};
