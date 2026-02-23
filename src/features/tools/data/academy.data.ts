import mascotDefault from "../../../../assets/images/icon.png";
import { AcademyTopic } from "../domain/academy.types";

const fallbackMascot = mascotDefault;

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
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon en professeur d'histoire",
  },
  {
    slug: "fermentescibles",
    title: "Fermentescibles",
    shortDescription:
      "OG, FG, ABV, atténuation et calcul des points de densité pour structurer la base alcoolique.",
    focus: "Densité et alcool",
    order: 2,
    estimatedReadTime: "10 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon thématique fermentescibles",
  },
  {
    slug: "couleur",
    title: "Couleur",
    shortDescription:
      "MCU, SRM, EBC et formule de Morey pour piloter précisément le profil visuel de la bière.",
    focus: "Colorimétrie bière",
    order: 3,
    estimatedReadTime: "9 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon thématique couleur",
  },
  {
    slug: "houblons",
    title: "Houblons",
    shortDescription:
      "IBU Tinseth, BU:GU et stratégie d'ajouts pour équilibrer amertume, saveur et arômes.",
    focus: "Amertume et aromatique",
    order: 4,
    estimatedReadTime: "10 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "hop-expert",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon experte des houblons",
  },
  {
    slug: "eau",
    title: "Eau",
    shortDescription:
      "Profils minéraux, pH, ratio sulfates/chlorures et ajustements pour chaque style brassicole.",
    focus: "Chimie de l'eau",
    order: 5,
    estimatedReadTime: "11 min",
    hasCalculator: true,
    status: "ready",
    mascotVariant: "chemist",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon en chimiste de l'eau",
  },
  {
    slug: "rendement",
    title: "Rendement",
    shortDescription:
      "Efficacité d'extraction, pertes process et planification des volumes empâtage/rinçage.",
    focus: "Performance brassage",
    order: 6,
    estimatedReadTime: "8 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon thématique rendement",
  },
  {
    slug: "levures",
    title: "Levures",
    shortDescription:
      "Pitching rate, starters et atténuation pour sécuriser des fermentations propres et prévisibles.",
    focus: "Fermentation",
    order: 7,
    estimatedReadTime: "9 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "yeast-lab",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon en laboratoire levures",
  },
  {
    slug: "carbonatation",
    title: "Carbonatation",
    shortDescription:
      "Volumes de CO₂, priming et sécurité bouteille/fût pour une pétillance maîtrisée.",
    focus: "Conditionnement",
    order: 8,
    estimatedReadTime: "8 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "default",
    mascotImage: fallbackMascot,
    mascotAlt: "Mascotte Brasse-Bouillon thématique carbonatation",
  },
  {
    slug: "avances",
    title: "Calculs avancés",
    shortDescription:
      "Pouvoir diastasique, indice de Kolbach, β-glucanes et autres indicateurs de stabilité.",
    focus: "Analyse avancée",
    order: 9,
    estimatedReadTime: "12 min",
    hasCalculator: true,
    status: "coming-soon",
    mascotVariant: "chemist",
    mascotImage: fallbackMascot,
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
    mascotImage: fallbackMascot,
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
