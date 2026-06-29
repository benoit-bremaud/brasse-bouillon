import { EquipmentWizardScreen } from "@/features/equipment/presentation/EquipmentWizardScreen";

/**
 * Route delegating to {@link EquipmentWizardScreen}. No business logic lives
 * here (mirrors `equipment/index.tsx`).
 */
export default function EquipmentWizardRoute() {
  return <EquipmentWizardScreen />;
}
