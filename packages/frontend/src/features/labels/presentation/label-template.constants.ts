import {
  LABEL_BOTTLE_FORMAT_LABELS,
  LABEL_TEMPLATE_LABELS,
  LabelBottleFormat,
  LabelTemplateId,
} from "@/features/labels/domain/label.types";

export interface LabelBottleFormatOption {
  id: LabelBottleFormat;
  label: string;
  description: string;
}

export interface LabelTemplateOption {
  id: LabelTemplateId;
  label: string;
  description: string;
}

export const LABEL_BOTTLE_FORMAT_OPTIONS: LabelBottleFormatOption[] = [
  {
    id: "33cl_long_neck",
    label: LABEL_BOTTLE_FORMAT_LABELS["33cl_long_neck"],
    description: "Format polyvalent pour bières du quotidien.",
  },
  {
    id: "75cl_champenoise",
    label: LABEL_BOTTLE_FORMAT_LABELS["75cl_champenoise"],
    description: "Format premium pour garde et partage.",
  },
  {
    id: "44cl_can",
    label: LABEL_BOTTLE_FORMAT_LABELS["44cl_can"],
    description: "Format moderne orienté dégustation houblonnée.",
  },
];

export const LABEL_TEMPLATE_OPTIONS: LabelTemplateOption[] = [
  {
    id: "template_1",
    label: LABEL_TEMPLATE_LABELS.template_1,
    description: "Look traditionnel, hiérarchie claire.",
  },
  {
    id: "template_2",
    label: LABEL_TEMPLATE_LABELS.template_2,
    description: "Design équilibré orienté marque.",
  },
  {
    id: "template_3",
    label: LABEL_TEMPLATE_LABELS.template_3,
    description: "Approche minimaliste avec accent produit.",
  },
];
