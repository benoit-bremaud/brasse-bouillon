import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

/**
 * Static client-side brewing glossary (Issue #783).
 *
 * 30 essential brewing terms covering five categories: brewing
 * process, measurement, equipment, ingredient, and style. Each
 * entry carries a French pedagogical definition for the persona
 * Nicolas le Débutant + Léa la Curieuse audience, plus optional
 * aliases (FR/EN variants) that the auto-linker also detects.
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
      "Phase de cuisson du moût à 100 °C où l'on ajoute les houblons d'amertume et d'arôme. Stérilise le moût et concentre les sucres avant la fermentation.",
    category: "brewing-process",
    aliases: ["ébullition", "boiling"],
  },
  {
    term: "cold crash",
    displayLabel: "Choc thermique (cold crash)",
    definition:
      "Refroidissement rapide du fermenteur à 1-4 °C en fin de fermentation pour faire précipiter les levures et les protéines en suspension. Clarifie la bière avant l'embouteillage.",
    category: "brewing-process",
    aliases: ["choc thermique", "cold crashing"],
  },
  {
    term: "conditioning",
    displayLabel: "Garde",
    definition:
      "Période de maturation post-fermentation pendant laquelle la bière s'affine en bouteille ou en cuve. La carbonatation se développe et les arômes se stabilisent.",
    category: "brewing-process",
    aliases: ["garde", "maturation"],
  },
  {
    term: "dry hop",
    displayLabel: "Houblonnage à cru",
    definition:
      "Ajout de houblons aromatiques directement dans le fermenteur après la fermentation primaire. Apporte un nez intense de fruits/agrumes/résine sans amertume supplémentaire.",
    category: "brewing-process",
    aliases: ["houblonnage à cru", "dry hopping", "dry-hop"],
  },
  {
    term: "krausen",
    displayLabel: "Krausen",
    definition:
      "Couche de mousse dense et crémeuse qui se forme à la surface du fermenteur pendant la fermentation primaire active. Indique que les levures travaillent à plein régime.",
    category: "brewing-process",
    aliases: ["kraeusen"],
  },
  {
    term: "lagering",
    displayLabel: "Lagering",
    definition:
      "Garde longue à basse température (0-4 °C) typique des bières de style Lager. Affine les saveurs, élimine les composés indésirables et donne une bière nette et propre.",
    category: "brewing-process",
    aliases: ["garde froide"],
  },
  {
    term: "lauter",
    displayLabel: "Filtration (lauter)",
    definition:
      "Étape de séparation du moût clair des drêches après l'empâtage. Le moût s'écoule à travers le lit de drêches qui sert de filtre naturel.",
    category: "brewing-process",
    aliases: ["filtration", "lautering"],
  },
  {
    term: "mash",
    displayLabel: "Empâtage",
    definition:
      "Étape de brassage où l'on mélange le malt concassé avec l'eau chaude (62-72 °C) pour activer les enzymes qui convertissent l'amidon en sucres fermentescibles.",
    category: "brewing-process",
    aliases: ["empâtage", "mashing", "maische"],
  },
  {
    term: "pitch",
    displayLabel: "Ensemencement",
    definition:
      "Action d'ajouter la levure au moût refroidi pour démarrer la fermentation. La température et la quantité de levure sont critiques pour un démarrage propre.",
    category: "brewing-process",
    aliases: ["ensemencement", "pitching"],
  },
  {
    term: "primary fermentation",
    displayLabel: "Fermentation primaire",
    definition:
      "Première phase de fermentation (4-10 jours) où la levure consomme la majorité des sucres et produit l'alcool et le CO₂. La densité chute fortement.",
    category: "brewing-process",
    aliases: ["fermentation primaire"],
  },
  {
    term: "sparge",
    displayLabel: "Rinçage des drêches",
    definition:
      "Rinçage du lit de drêches avec de l'eau chaude (75-78 °C) pour extraire les sucres résiduels après la filtration. Maximise le rendement d'extraction.",
    category: "brewing-process",
    aliases: ["rinçage", "sparging"],
  },
  {
    term: "whirlpool",
    displayLabel: "Whirlpool",
    definition:
      "Mise en rotation du moût en fin d'ébullition pour rassembler les particules (trub) au centre. Permet aussi un dernier ajout de houblons à 75-85 °C pour préserver les arômes volatils.",
    category: "brewing-process",
    aliases: ["whirlpooling"],
  },

  // --- Measurement ---
  {
    term: "abv",
    displayLabel: "ABV — Taux d'alcool",
    definition:
      "Alcohol By Volume : pourcentage d'alcool en volume dans la bière finie. Calculé à partir de la chute de densité entre OG et FG. Standard d'étiquetage international.",
    category: "measurement",
    aliases: ["taux d'alcool", "alcohol by volume"],
  },
  {
    term: "attenuation",
    displayLabel: "Atténuation",
    definition:
      "Pourcentage de sucres consommés par la levure pendant la fermentation. Une atténuation de 75 % signifie que 3/4 des sucres ont été convertis en alcool et CO₂.",
    category: "measurement",
    aliases: ["atténuation"],
  },
  {
    term: "ebc",
    displayLabel: "EBC — Couleur",
    definition:
      "European Brewery Convention : échelle européenne de couleur de la bière. Plus la valeur est élevée, plus la bière est foncée (4 = blonde claire, 80+ = stout).",
    category: "measurement",
    aliases: ["couleur ebc"],
  },
  {
    term: "fg",
    displayLabel: "FG — Densité finale",
    definition:
      "Final Gravity : densité du moût après fermentation, mesurée juste avant l'embouteillage. La différence avec l'OG donne le taux d'alcool. Typiquement entre 1.005 et 1.020.",
    category: "measurement",
    aliases: ["densité finale", "final gravity"],
  },
  {
    term: "flocculation",
    displayLabel: "Floculation",
    definition:
      "Capacité d'une levure à s'agréger et précipiter au fond du fermenteur en fin de fermentation. Une floculation forte donne une bière plus claire naturellement.",
    category: "measurement",
    aliases: ["floculation"],
  },
  {
    term: "ibu",
    displayLabel: "IBU — Amertume",
    definition:
      "International Bitterness Units : mesure de l'amertume apportée par les houblons. Une lager douce tourne autour de 10-15 IBU, une IPA assumée 50-70 IBU.",
    category: "measurement",
    aliases: ["amertume ibu"],
  },
  {
    term: "og",
    displayLabel: "OG — Densité initiale",
    definition:
      "Original Gravity : densité du moût avant la fermentation, mesurée après refroidissement. Indique la quantité de sucres disponibles. Typiquement entre 1.040 et 1.080.",
    category: "measurement",
    aliases: ["densité initiale", "original gravity"],
  },
  {
    term: "srm",
    displayLabel: "SRM — Couleur (US)",
    definition:
      "Standard Reference Method : échelle américaine de couleur de la bière. Équivaut grossièrement à EBC ÷ 1.97. Plus la valeur est élevée, plus la bière est foncée.",
    category: "measurement",
    aliases: ["couleur srm"],
  },

  // --- Equipment ---
  {
    term: "airlock",
    displayLabel: "Barboteur",
    definition:
      "Petit dispositif rempli d'eau placé sur le bouchon du fermenteur. Laisse échapper le CO₂ produit par la fermentation tout en empêchant l'air et les contaminants d'entrer.",
    category: "equipment",
    aliases: ["barboteur", "bubbler"],
  },
  {
    term: "fermenter",
    displayLabel: "Fermenteur",
    definition:
      "Récipient hermétique (verre, plastique alimentaire ou inox) où se déroule la fermentation. Doit pouvoir être fermé avec un barboteur et nettoyé/désinfecté facilement.",
    category: "equipment",
    aliases: ["fermenteur", "fermentor"],
  },
  {
    term: "hydrometer",
    displayLabel: "Densimètre",
    definition:
      "Tube de verre flotteur gradué qui mesure la densité du moût. Plonge dans une éprouvette remplie de moût ; la lecture au niveau du liquide donne la densité (OG ou FG).",
    category: "equipment",
    aliases: ["densimètre"],
  },
  {
    term: "refractometer",
    displayLabel: "Réfractomètre",
    definition:
      "Instrument optique qui mesure la densité du moût à partir de quelques gouttes seulement. Plus rapide qu'un densimètre, mais nécessite une correction après fermentation (présence d'alcool).",
    category: "equipment",
    aliases: ["réfractomètre"],
  },

  // --- Ingredient ---
  {
    term: "finings",
    displayLabel: "Clarifiants",
    definition:
      "Agents de clarification (gélatine, isinglass, Irish moss) ajoutés en fin d'ébullition ou en garde pour précipiter les protéines et levures en suspension. Donnent une bière plus limpide.",
    category: "ingredient",
    aliases: ["clarifiants", "agents de clarification"],
  },
  {
    term: "hop",
    displayLabel: "Houblon",
    definition:
      "Fleur de la plante Humulus lupulus, source d'amertume, d'arôme et de propriétés antibactériennes. Présentée en pellets, fleurs entières ou extrait. Centaine de variétés disponibles.",
    category: "ingredient",
    aliases: ["houblon", "houblons", "hops"],
  },
  {
    term: "malt",
    displayLabel: "Malt",
    definition:
      "Grain (généralement orge) germé puis séché et torréfié. Apporte les sucres fermentescibles, la couleur et le profil de saveur de base. Existe en dizaines de variétés (Pale, Munich, Caramel, Chocolate, etc.).",
    category: "ingredient",
    aliases: ["malts"],
  },
  {
    term: "yeast",
    displayLabel: "Levure",
    definition:
      "Champignon unicellulaire qui consomme les sucres du moût et produit l'alcool, le CO₂ et de nombreux esters/phénols. Deux familles : ale (haute fermentation) et lager (basse fermentation).",
    category: "ingredient",
    aliases: ["levure", "levures", "yeasts"],
  },

  // --- Style ---
  {
    term: "ipa",
    displayLabel: "IPA",
    definition:
      "India Pale Ale : style anglais du XIXᵉ siècle généreusement houblonné, ressuscité par la scène craft américaine. Profil houblonné dominant, amertume marquée (40-70 IBU), nombreuses sous-familles (NEIPA, West Coast, Session).",
    category: "style",
  },
  {
    term: "pilsner",
    displayLabel: "Pilsner",
    definition:
      "Lager blonde dorée originaire de Plzeň (Tchéquie) en 1842. Houblons nobles (Saaz), malt pilsner, fermentation basse longue. Profil net, sec, finale légèrement amère. Style le plus brassé au monde.",
    category: "style",
    aliases: ["pils"],
  },
  {
    term: "porter",
    displayLabel: "Porter",
    definition:
      "Style anglais du XVIIIᵉ siècle, ancêtre du Stout. Brun foncé à noir, malts caramel et brown malt, notes de café et chocolat plus douces que le Stout. Sous-familles : Brown Porter, Robust Porter, Baltic Porter.",
    category: "style",
  },
  {
    term: "saison",
    displayLabel: "Saison",
    definition:
      "Style belge/wallon rustique fermenté à haute température (28-32 °C) avec une levure spécifique. Sec, légèrement épicé, finale poivrée et acidulée. Origine paysanne, désaltérant.",
    category: "style",
  },
  {
    term: "stout",
    displayLabel: "Stout",
    definition:
      "Style noir originaire d'Irlande (Guinness) à base de malts torréfiés et roasted barley. Notes de café, chocolat, parfois vanille ou avoine. Peut être sec, sweet, oatmeal ou Imperial.",
    category: "style",
  },
  {
    term: "tripel",
    displayLabel: "Tripel",
    definition:
      "Style belge fort (8-10 % ABV) sur base pilsner et sucre candi clair. Levure belge marquée (esters fruités, phénols poivrés), finale sèche malgré la densité élevée. Westmalle, Chimay Blanche, Karmeliet.",
    category: "style",
  },
  {
    term: "witbier",
    displayLabel: "Witbier",
    definition:
      "Style belge à base de blé non malté et orge maltée (50/50), traditionnellement épicé à la coriandre et l'écorce d'orange amère de Curaçao. Trouble naturel, finale acidulée. Hoegaarden a relancé le style.",
    category: "style",
    aliases: ["bière blanche", "wit"],
  },
];
