import { ImageSourcePropType } from "react-native";

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
  focus: string;
  order: number;
  estimatedReadTime: string;
  hasCalculator: boolean;
  status: AcademyTopicStatus;
  mascotVariant: AcademyMascotVariant;
  mascotImage: ImageSourcePropType;
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

export const CALCULATOR_TOPICS: readonly CalculatorSlug[] = [
  "fermentescibles",
  "couleur",
  "houblons",
  "eau",
  "rendement",
  "levures",
  "carbonatation",
  "avances",
];
