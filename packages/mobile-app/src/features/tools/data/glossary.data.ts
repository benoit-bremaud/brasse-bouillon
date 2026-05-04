import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

/**
 * Static client-side brewing glossary (Issue #783).
 *
 * 35 essential brewing terms covering five categories: brewing
 * process, measurement, equipment, ingredient, and style. Each
 * entry carries a short French definition (~1 sentence) for the
 * persona Nicolas le Débutant + Léa la Curieuse audience, plus
 * optional aliases (FR/EN variants) that the auto-linker also
 * detects.
 *
 * Definitions are kept punchy on purpose — the long-press popup
 * surfaces them in-context inside a recipe description, and the
 * full Académie article is one tap away via the "Académie →" link.
 *
 * Ordering: alphabetical by canonical `term` within each category
 * block — keeps the editorial diff stable when adding entries.
 *
 * v0.2 migration: this const becomes the seed for a backend
 * `/academy/glossary` endpoint; the entry shape is identical so
 * consumers don't change.
 */
export const GLOSSARY_ENTRIES: ReadonlyArray<GlossaryEntry> = [
  // --- Brewing process ---
  {
    term: "boil",
    displayLabel: "Ébullition",
    definition:
      "Phase de cuisson du moût à 100 °C où l'on ajoute les houblons d'amertume et d'arôme.",
    category: "brewing-process",
    aliases: ["ébullition", "boiling"],
  },
  {
    term: "cold crash",
    displayLabel: "Choc thermique (cold crash)",
    definition:
      "Refroidissement rapide à 1-4 °C en fin de fermentation pour clarifier la bière.",
    category: "brewing-process",
    aliases: ["choc thermique", "cold crashing"],
  },
  {
    term: "conditioning",
    displayLabel: "Garde",
    definition:
      "Période de maturation post-fermentation où la bière s'affine et la carbonatation se développe.",
    category: "brewing-process",
    aliases: ["garde", "maturation"],
  },
  {
    term: "dry hop",
    displayLabel: "Houblonnage à cru",
    definition:
      "Ajout de houblons aromatiques dans le fermenteur pour un nez intense, sans amertume ajoutée.",
    category: "brewing-process",
    aliases: ["houblonnage à cru", "dry hopping", "dry-hop"],
  },
  {
    term: "krausen",
    displayLabel: "Krausen",
    definition:
      "Mousse dense qui se forme à la surface du fermenteur pendant la fermentation primaire active.",
    category: "brewing-process",
    aliases: ["kraeusen"],
  },
  {
    term: "lagering",
    displayLabel: "Lagering",
    definition:
      "Garde longue à 0-4 °C typique des Lagers, qui affine les saveurs et donne une bière nette.",
    category: "brewing-process",
    aliases: ["garde froide"],
  },
  {
    term: "lauter",
    displayLabel: "Filtration (lauter)",
    definition:
      "Séparation du moût clair des drêches après l'empâtage, par filtration sur le lit de drêches.",
    category: "brewing-process",
    aliases: ["filtration", "lautering"],
  },
  {
    term: "mash",
    displayLabel: "Empâtage",
    definition:
      "Mélange du malt concassé avec l'eau chaude (62-72 °C) pour convertir l'amidon en sucres.",
    category: "brewing-process",
    aliases: ["empâtage", "mashing", "maische"],
  },
  {
    term: "pitch",
    displayLabel: "Ensemencement",
    definition:
      "Ajout de la levure au moût refroidi pour démarrer la fermentation.",
    category: "brewing-process",
    aliases: ["ensemencement", "pitching"],
  },
  {
    term: "primary fermentation",
    displayLabel: "Fermentation primaire",
    definition:
      "Première phase (4-10 j) où la levure consomme les sucres et produit l'alcool et le CO₂.",
    category: "brewing-process",
    aliases: ["fermentation primaire"],
  },
  {
    term: "sparge",
    displayLabel: "Rinçage des drêches",
    definition:
      "Rinçage des drêches à l'eau chaude (75-78 °C) pour extraire les sucres résiduels.",
    category: "brewing-process",
    aliases: ["rinçage", "sparging"],
  },
  {
    term: "whirlpool",
    displayLabel: "Whirlpool",
    definition:
      "Mise en rotation du moût en fin d'ébullition pour rassembler les particules au centre.",
    category: "brewing-process",
    aliases: ["whirlpooling"],
  },

  // --- Measurement ---
  {
    term: "abv",
    displayLabel: "ABV — Taux d'alcool",
    definition:
      "Pourcentage d'alcool en volume, calculé à partir de la chute de densité entre OG et FG.",
    category: "measurement",
    aliases: ["taux d'alcool", "alcohol by volume"],
  },
  {
    term: "attenuation",
    displayLabel: "Atténuation",
    definition:
      "Pourcentage de sucres consommés par la levure pendant la fermentation.",
    category: "measurement",
    aliases: ["atténuation"],
  },
  {
    term: "ebc",
    displayLabel: "EBC — Couleur",
    definition:
      "Échelle européenne de couleur de la bière (4 = blonde claire, 80+ = stout).",
    category: "measurement",
    aliases: ["couleur ebc"],
  },
  {
    term: "fg",
    displayLabel: "FG — Densité finale",
    definition:
      "Densité du moût après fermentation, mesurée juste avant l'embouteillage.",
    category: "measurement",
    aliases: ["densité finale", "final gravity"],
  },
  {
    term: "flocculation",
    displayLabel: "Floculation",
    definition:
      "Capacité d'une levure à s'agréger et précipiter au fond du fermenteur en fin de fermentation.",
    category: "measurement",
    aliases: ["floculation"],
  },
  {
    term: "ibu",
    displayLabel: "IBU — Amertume",
    definition:
      "Mesure de l'amertume apportée par les houblons (10-15 = lager douce, 50-70 = IPA).",
    category: "measurement",
    aliases: ["amertume ibu"],
  },
  {
    term: "og",
    displayLabel: "OG — Densité initiale",
    definition:
      "Densité du moût avant fermentation, indique la quantité de sucres disponibles.",
    category: "measurement",
    aliases: ["densité initiale", "original gravity"],
  },
  {
    term: "srm",
    displayLabel: "SRM — Couleur (US)",
    definition:
      "Échelle américaine de couleur de la bière, équivaut à EBC ÷ 1.97.",
    category: "measurement",
    aliases: ["couleur srm"],
  },

  // --- Equipment ---
  {
    term: "airlock",
    displayLabel: "Barboteur",
    definition:
      "Petit dispositif rempli d'eau qui laisse échapper le CO₂ tout en bloquant l'air extérieur.",
    category: "equipment",
    aliases: ["barboteur", "bubbler"],
  },
  {
    term: "fermenter",
    displayLabel: "Fermenteur",
    definition:
      "Récipient hermétique où se déroule la fermentation, fermé par un barboteur.",
    category: "equipment",
    aliases: ["fermenteur", "fermentor"],
  },
  {
    term: "hydrometer",
    displayLabel: "Densimètre",
    definition:
      "Tube de verre flotteur gradué qui mesure la densité du moût (OG ou FG).",
    category: "equipment",
    aliases: ["densimètre"],
  },
  {
    term: "refractometer",
    displayLabel: "Réfractomètre",
    definition:
      "Instrument optique qui mesure la densité du moût à partir de quelques gouttes seulement.",
    category: "equipment",
    aliases: ["réfractomètre"],
  },

  // --- Ingredient ---
  {
    term: "finings",
    displayLabel: "Clarifiants",
    definition:
      "Agents (gélatine, isinglass) ajoutés en fin de cuisson pour précipiter protéines et levures.",
    category: "ingredient",
    aliases: ["clarifiants", "agents de clarification"],
  },
  {
    term: "hop",
    displayLabel: "Houblon",
    definition:
      "Fleur de Humulus lupulus, source d'amertume et d'arôme — pellets, fleurs ou extrait.",
    category: "ingredient",
    aliases: ["houblon", "houblons", "hops"],
  },
  {
    term: "malt",
    displayLabel: "Malt",
    definition:
      "Grain (orge généralement) germé puis séché — apporte sucres, couleur et profil de saveur.",
    category: "ingredient",
    aliases: ["malts"],
  },
  {
    term: "yeast",
    displayLabel: "Levure",
    definition:
      "Champignon unicellulaire qui consomme les sucres et produit l'alcool, le CO₂ et les arômes.",
    category: "ingredient",
    aliases: ["levure", "levures", "yeasts"],
  },

  // --- Style ---
  {
    term: "ipa",
    displayLabel: "IPA",
    definition:
      "India Pale Ale : style généreusement houblonné, amertume marquée (40-70 IBU).",
    category: "style",
  },
  {
    term: "pilsner",
    displayLabel: "Pilsner",
    definition:
      "Lager blonde dorée née à Plzeň en 1842, profil net, sec, finale légèrement amère.",
    category: "style",
    aliases: ["pils"],
  },
  {
    term: "porter",
    displayLabel: "Porter",
    definition:
      "Style anglais brun foncé, malts caramel et brown — notes de café et chocolat plus douces qu'un Stout.",
    category: "style",
  },
  {
    term: "saison",
    displayLabel: "Saison",
    definition:
      "Style belge rustique fermenté chaud, sec, légèrement épicé, finale poivrée et acidulée.",
    category: "style",
  },
  {
    term: "stout",
    displayLabel: "Stout",
    definition:
      "Style noir irlandais à base de malts torréfiés — notes de café et chocolat amer.",
    category: "style",
  },
  {
    term: "tripel",
    displayLabel: "Tripel",
    definition:
      "Style belge fort (8-10 % ABV) sur base pilsner et sucre candi, finale sèche.",
    category: "style",
  },
  {
    term: "witbier",
    displayLabel: "Witbier",
    definition:
      "Style belge à base de blé non malté, épicé coriandre + écorce d'orange, trouble naturel.",
    category: "style",
    aliases: ["bière blanche", "wit"],
  },
];
