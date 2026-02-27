import type { WaterProfile } from "@/core/brewing-calculations";

export type IonRange = {
  min: number;
  max: number;
};

export type WaterLocationProfile = WaterProfile & {
  name: string;
  region: string;
  description: string;
};

export type WaterStylePresetId =
  | "pilsner-lager"
  | "pale-ale"
  | "ipa"
  | "amber-maltee"
  | "stout-porter";

export type WaterStylePreset = {
  id: WaterStylePresetId;
  name: string;
  description: string;
  ca: IonRange;
  mg: IonRange;
  na: IonRange;
  so4: IonRange;
  cl: IonRange;
  hco3: IonRange;
};
