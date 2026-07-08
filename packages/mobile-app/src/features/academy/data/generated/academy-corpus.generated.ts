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
          "Carte d'ensemble du brassage pour relier ingrédients, process, mesures et hygiène.",
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
          "Comprendre le déroulé global du brassage avant d'optimiser les détails.",
          "Identifier les quatre ingrédients fondamentaux d'une bière.",
          "Reconnaître les principales mesures suivies pendant un brassin.",
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
        summary:
          "Repère pratique sur le rôle du houblon dans l'amertume, l'aromatique et l'équilibre d'une bière.",
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
          "Identifier les rôles principaux du houblon dans une bière.",
          "Distinguer les ajouts d'amertume des ajouts aromatiques.",
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
          "Repère pratique sur la fermentation, le rôle des levures, le taux d'ensemencement et la température.",
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
          "Expliquer ce que la levure transforme pendant la fermentation.",
          "Identifier les principaux leviers d'une fermentation saine.",
          "Comprendre pourquoi le taux d'ensemencement et la température comptent.",
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
                label: "Profil mineral",
                sourceIds: ["brun-water-knowledge"],
              },
              {
                id: "definition-profil-mineral",
                type: "definition",
                term: "Profil mineral",
                definition:
                  "Composition de l'eau en ions principaux comme calcium, magnesium, sodium, sulfates, chlorures et bicarbonates.",
                sourceIds: ["brun-water-knowledge"],
              },
            ],
          },
          {
            id: "ions-principaux",
            title: "Les 6 ions a connaitre",
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
            title: "Le pH a chaque etape",
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
            title: "Alcalinite residuelle et ratio SO4/Cl",
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
            title: "Methode simple et fiable",
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
            title: "Pieges frequents a eviter",
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
        relatedGlossaryTerms: ["ibu"],
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
            title: "Reperes rapides",
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
                title: "Estimer alcool et attenuation",
                description:
                  "Utiliser le calculateur fermentescibles pour relier OG, FG, attenuation et ABV.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "attenuation",
            title: "Estimer la FG avec l'attenuation",
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
            title: "Plages utiles pour se reperer",
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
            title: "Pieges frequents a eviter",
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
        relatedGlossaryTerms: [],
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
            title: "Pourquoi la couleur est un repere cle",
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
            title: "Reperes rapides",
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
            title: "Pieges frequents a eviter",
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
            title: "Reperes rapides",
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
                  "Utiliser le calculateur carbonatation pour relier volume, temperature, cible CO2 et type de sucre.",
                sourceIds: ["palmer-2017"],
              },
            ],
          },
          {
            id: "co2-residuel",
            title: "CO2 residuel et temperature",
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
            title: "Pieges et securite",
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
        relatedGlossaryTerms: [],
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
            title: "Reperes rapides",
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
            title: "Rendements realistes",
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
            title: "Ou se perd le rendement",
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
            title: "Methode de progression",
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
            title: "Pieges frequents a eviter",
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
            title: "Pourquoi ces calculs sont avances",
            blocks: [
              {
                id: "role-avances-paragraph-1",
                type: "paragraph",
                text: "Les calculs avances ne servent pas a brasser une premiere biere. Ils deviennent utiles quand tu veux diagnostiquer un ecart difficile : conversion incomplete, filtration lente, fermentation moins previsible, ou adaptation a l'altitude. Le but n'est pas d'empiler des chiffres, mais de relier un symptome a une cause possible.",
                sourceIds: [],
              },
              {
                id: "example-advanced-use",
                type: "example",
                title: "Bon usage",
                body: "Si une recette donne une FG instable et une filtration lente, les indicateurs de mout peuvent aider a orienter l'analyse, mais ils ne remplacent pas les mesures terrain.",
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
                text: "Le calculateur avance est organise en trois axes. L'onglet Enzymes estime la puissance diastasique totale et moyenne a partir des malts. L'onglet Mout regroupe indice de Kolbach, viscosite estimee et FAN estime. L'onglet Altitude estime le point d'ebullition, la pression atmospherique et l'ajustement pratique d'une cible IBU.",
                sourceIds: [],
              },
              {
                id: "advanced-calculator",
                type: "calculatorCta",
                calculatorSlug: "avances",
                title: "Ouvrir les diagnostics avances",
                description:
                  "Utiliser le calculateur avances pour travailler sur enzymes, mout et altitude sans dupliquer les formules.",
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
            title: "Diagnostic du mout",
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
        relatedGlossaryTerms: ["ibu", "acide-alpha", "profil-mineral"],
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
            title: "Comment lire une entree",
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
                label: "Profil mineral",
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
            title: "Reperes incontournables",
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
            title: "Confusions frequentes",
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
            title: "Methode d'apprentissage rapide",
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
  calculatorSlugs: [
    "houblons",
    "levures",
    "eau",
    "fermentescibles",
    "couleur",
    "carbonatation",
    "rendement",
    "avances",
  ],
};
