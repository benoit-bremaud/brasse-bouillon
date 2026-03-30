import type { AcademyMascotVariant } from "@/features/tools/domain";
import type { ImageSourcePropType } from "react-native";
import mascotDefault from "../../../../assets/images/icon.png";

const mascotByVariant: Record<AcademyMascotVariant, ImageSourcePropType> = {
  default: mascotDefault,
  historian: mascotDefault,
  chemist: mascotDefault,
  "hop-expert": mascotDefault,
  "yeast-lab": mascotDefault,
};

export function getAcademyMascotImage(
  mascotVariant: AcademyMascotVariant,
): ImageSourcePropType {
  return mascotByVariant[mascotVariant];
}
