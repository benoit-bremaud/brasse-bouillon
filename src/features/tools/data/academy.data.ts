import { AcademyTopic } from "../domain/academy.types";

export const academyHighlights = [
  "14 200 mots structurés",
  "8 chapitres thématiques",
  "50+ formules expliquées",
  "30+ tableaux de référence",
] as const;

const academyTopicsData: AcademyTopic[] = [
  {
    slug: "introduction",
    title: "Introduction au brassage",
    shortDescription:
      "Les fondamentaux du brassage, les 4 ingrédients et la logique scientifique des calculs.",
    focus: "Contexte historique et pédagogique",
    order: 1,
    estimatedReadTime: "8 min",
    hasCalculator: false,
    status: "coming-soon",
    mascotVariant: "historian",
    mascotAlt: "Mascotte Brasse-Bouillon en professeur d'histoire",
  },
  {
    slug: "fermentescibles",
    title: "Fermentescibles",
    shortDescription:
      "OG, FG, ABV, atténuation et calcul des points de densité pour structurer la base alcoolique.",
    calculatorDescription:
      "Calcule le degré d'alcool et l'atténuation de ta bière",
    calculatorOrder: 1,
    focus: "Densité et alcool",
    order: 2,
    estimatedReadTime: "10 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique fermentescibles",
  },
  {
    slug: "couleur",
    title: "Couleur",
    shortDescription:
      "MCU, SRM, EBC et formule de Morey pour piloter précisément le profil visuel de la bière.",
    calculatorDescription: "Prédit la couleur finale de ta bière (SRM / EBC)",
    calculatorOrder: 3,
    focus: "Colorimétrie bière",
    order: 3,
    estimatedReadTime: "9 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique couleur",
  },
  {
    slug: "houblons",
    title: "Houblons",
    shortDescription:
      "IBU Tinseth, BU:GU et stratégie d'ajouts pour équilibrer amertume, saveur et arômes.",
    calculatorDescription:
      "Calcule l'amertume (IBU) et équilibre tes ajouts de houblon",
    calculatorOrder: 2,
    focus: "Amertume et aromatique",
    order: 4,
    estimatedReadTime: "10 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "hop-expert",
    mascotAlt: "Mascotte Brasse-Bouillon experte des houblons",
  },
  {
    slug: "eau",
    title: "Eau",
    shortDescription:
      "Profils minéraux, pH, ratio sulfates/chlorures et ajustements pour chaque style brassicole.",
    calculatorDescription: "Ajuste le profil minéral de ton eau de brassage",
    calculatorOrder: 6,
    focus: "Chimie de l'eau",
    order: 5,
    estimatedReadTime: "11 min",
    hasCalculator: true,
    status: "ready",
    mascotVariant: "chemist",
    mascotAlt: "Mascotte Brasse-Bouillon en chimiste de l'eau",
  },
  {
    slug: "rendement",
    title: "Rendement",
    shortDescription:
      "Efficacité d'extraction, pertes process et planification des volumes empâtage/rinçage.",
    calculatorDescription:
      "Estime les pertes et optimise tes volumes d'empâtage et de rinçage",
    calculatorOrder: 7,
    focus: "Performance brassage",
    order: 6,
    estimatedReadTime: "8 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique rendement",
  },
  {
    slug: "levures",
    title: "Levures",
    shortDescription:
      "Pitching rate, starters et atténuation pour sécuriser des fermentations propres et prévisibles.",
    calculatorDescription:
      "Calcule la quantité de levures et prépare un starter",
    calculatorOrder: 4,
    focus: "Fermentation",
    order: 7,
    estimatedReadTime: "9 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "yeast-lab",
    mascotAlt: "Mascotte Brasse-Bouillon en laboratoire levures",
  },
  {
    slug: "carbonatation",
    title: "Carbonatation",
    shortDescription:
      "Volumes de CO₂, priming et sécurité bouteille/fût pour une pétillance maîtrisée.",
    calculatorDescription:
      "Dose le sucre de refermentation pour maîtriser ta pétillance",
    calculatorOrder: 5,
    focus: "Conditionnement",
    order: 8,
    estimatedReadTime: "8 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique carbonatation",
  },
  {
    slug: "avances",
    title: "Calculs avancés",
    shortDescription:
      "Pouvoir diastasique, indice de Kolbach, β-glucanes et autres indicateurs de stabilité.",
    calculatorDescription: "Indicateurs techniques pour brasseurs expérimentés",
    calculatorOrder: 8,
    focus: "Analyse avancée",
    order: 9,
    estimatedReadTime: "12 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "chemist",
    mascotAlt: "Mascotte Brasse-Bouillon thématique calculs avancés",
  },
  {
    slug: "glossaire",
    title: "Glossaire brassicole",
    shortDescription:
      "120+ termes clés d'ABV à °Z pour consolider le vocabulaire technique.",
    focus: "Référence A-Z",
    order: 10,
    estimatedReadTime: "15 min",
    hasCalculator: false,
    status: "coming-soon",
    mascotVariant: "historian",
    mascotAlt: "Mascotte Brasse-Bouillon thématique glossaire",
  },
];

export const academyTopics = academyTopicsData.sort(
  (a, b) => a.order - b.order,
);

export function getAcademyTopicBySlug(slug?: string) {
  if (!slug) return undefined;
  return academyTopics.find((topic) => topic.slug === slug);
}
