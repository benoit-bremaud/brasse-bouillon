import { AcademyTopic, DisplayableAcademyTopic } from "../domain/academy.types";

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
    order: 1,
    status: "ready",
    mascotVariant: "historian",
    mascotAlt: "Mascotte Brasse-Bouillon en professeur d'histoire",
  },
  {
    slug: "fermentescibles",
    calculatorDescription:
      "Calcule le degré d'alcool et l'atténuation de ta bière",
    calculatorOrder: 1,
    hasCalculator: true,
    order: 2,
    status: "ready",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique fermentescibles",
  },
  {
    slug: "couleur",
    calculatorDescription: "Prédit la couleur finale de ta bière (SRM / EBC)",
    calculatorOrder: 3,
    hasCalculator: true,
    order: 3,
    status: "ready",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique couleur",
  },
  {
    slug: "houblons",
    calculatorDescription:
      "Calcule l'amertume (IBU) et équilibre tes ajouts de houblon",
    calculatorOrder: 2,
    hasCalculator: true,
    order: 4,
    status: "ready",
    mascotVariant: "hop-expert",
    mascotAlt: "Mascotte Brasse-Bouillon experte des houblons",
  },
  {
    slug: "eau",
    calculatorDescription: "Ajuste le profil minéral de ton eau de brassage",
    calculatorOrder: 6,
    hasCalculator: true,
    order: 5,
    status: "ready",
    mascotVariant: "chemist",
    mascotAlt: "Mascotte Brasse-Bouillon en chimiste de l'eau",
  },
  {
    slug: "rendement",
    calculatorDescription:
      "Estime les pertes et optimise tes volumes d'empâtage et de rinçage",
    calculatorOrder: 7,
    hasCalculator: true,
    order: 6,
    status: "ready",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique rendement",
  },
  {
    slug: "levures",
    calculatorDescription:
      "Calcule la quantité de levures et prépare un starter",
    calculatorOrder: 4,
    hasCalculator: true,
    order: 7,
    status: "ready",
    mascotVariant: "yeast-lab",
    mascotAlt: "Mascotte Brasse-Bouillon en laboratoire levures",
  },
  {
    slug: "carbonatation",
    calculatorDescription:
      "Dose le sucre de refermentation pour maîtriser ta pétillance",
    calculatorOrder: 5,
    hasCalculator: true,
    order: 8,
    status: "ready",
    mascotVariant: "default",
    mascotAlt: "Mascotte Brasse-Bouillon thématique carbonatation",
  },
  {
    slug: "avances",
    calculatorDescription: "Indicateurs techniques pour brasseurs expérimentés",
    calculatorOrder: 8,
    hasCalculator: true,
    order: 9,
    status: "ready",
    mascotVariant: "chemist",
    mascotAlt: "Mascotte Brasse-Bouillon thématique calculs avancés",
  },
  {
    slug: "glossaire",
    order: 10,
    status: "ready",
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

export function getDisplayableAcademyTopicBySlug(
  slug?: string,
): DisplayableAcademyTopic | undefined {
  const topic = getAcademyTopicBySlug(slug);
  return topic && isDisplayableAcademyTopic(topic) ? topic : undefined;
}

function isDisplayableAcademyTopic(
  topic: AcademyTopic,
): topic is DisplayableAcademyTopic {
  return Boolean(
    topic.title &&
    topic.shortDescription &&
    topic.focus &&
    topic.estimatedReadTime,
  );
}
