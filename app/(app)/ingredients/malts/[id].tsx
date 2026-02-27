import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function MaltDetailsRoute() {
  const { id, returnTo, returnRecipeId } = useLocalSearchParams<{
    id?: string | string[];
    returnTo?: string | string[];
    returnRecipeId?: string | string[];
  }>();

  return (
    <MaltDetailsScreen
      maltIdParam={id}
      returnToParam={returnTo}
      returnRecipeIdParam={returnRecipeId}
    />
  );
}
