export type AcademyTopicStatus = "ready" | "coming-soon";

export type AcademyMascotVariant =
  | "default"
  | "historian"
  | "chemist"
  | "hop-expert"
  | "yeast-lab";

export type AcademyTopic = {
  slug: string;
  title: string;
  shortDescription: string;
  calculatorDescription?: string;
  calculatorOrder?: number;
  focus: string;
  order: number;
  estimatedReadTime: string;
  hasCalculator: boolean;
  status: AcademyTopicStatus;
  mascotVariant: AcademyMascotVariant;
  mascotAlt: string;
};

export type CalculatorSlug =
  | "fermentescibles"
  | "couleur"
  | "houblons"
  | "eau"
  | "rendement"
  | "levures"
  | "carbonatation"
  | "avances";
