import { AcademyTopic } from "../domain/academy.types";

export const academyHighlights = [
  "14 200 mots structurés",
  "9 chapitres thématiques",
  "50+ formules expliquées",
  "30+ tableaux de référence",
] as const;

const academyTopicsData: AcademyTopic[] = [
  {
    slug: "histoire",
    title: "Histoire de la bière",
    shortDescription:
      "Des premières bières sumériennes aux brasseries artisanales — 10 000 ans de fermentation, de culture et d'innovation.",
    focus: "Histoire et culture",
    order: 0,
    estimatedReadTime: "10 min",
    hasCalculator: false,
    status: "coming-soon",
    mascotVariant: "historian",
    mascotAlt: "Mascotte Brasse-Bouillon en historien de la bière",
  },
  {
    slug: "introduction",
    title: "Introduction au brassage",
    shortDescription:
      "Comprends comment fonctionne le brassage — les 4 ingrédients, le processus et la logique des recettes.",
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
    title: "Alcool & Densité",
    shortDescription:
      "Comment le sucre devient alcool — densité, fermentation et calcul du degré de ta bière.",
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
      "De la Pilsner pâle à la Stout noire — comprendre et maîtriser la couleur de ta bière.",
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
      "Amertume, arômes, équilibre — le rôle du houblon et comment l'utiliser dans ta recette.",
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
      "Comment l'eau façonne le goût — profils minéraux, pH et ajustements par style brassicole.",
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
      "Volumes, pertes et efficacité — comment optimiser ton processus de brassage.",
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
      "La levure : actrice principale de la fermentation et des arômes de ta bière.",
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
      "Comment carbonater ta bière — refermentation, volumes de CO₂ et dosage.",
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
      "Pour aller plus loin — indicateurs techniques avancés pour brasseurs expérimentés.",
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
      "120+ termes brassicoles expliqués — du vocabulaire de base aux termes techniques experts.",
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
