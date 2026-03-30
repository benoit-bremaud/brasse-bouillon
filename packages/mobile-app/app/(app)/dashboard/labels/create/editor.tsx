import { LabelEditorScreen } from "@/features/labels/presentation/LabelEditorScreen";
import { useLocalSearchParams } from "expo-router";

export default function DashboardLabelEditorRoute() {
  const { draftId } = useLocalSearchParams<{ draftId?: string | string[] }>();

  return <LabelEditorScreen draftIdParam={draftId} />;
}
