import { listBatches } from "@/features/batches/application/batches.use-cases";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { dataSource } from "@/core/data/data-source";
import { listCurrentUserScans } from "@/features/scan/data/scan.api";

export type BrewerLevel = "Apprenti" | "Brasseur" | "Maître Brasseur";

export type BrewerStats = {
  activeBatches: number;
  completedBatches: number;
  authoredRecipes: number;
  submittedScans: number;
  level: BrewerLevel;
};

export function getBrewerLevel(completedBatches: number): BrewerLevel {
  if (completedBatches >= 20) {
    return "Maître Brasseur";
  }

  if (completedBatches >= 5) {
    return "Brasseur";
  }

  return "Apprenti";
}

export async function getBrewerStats(): Promise<BrewerStats> {
  const [batches, recipes, scans] = await Promise.all([
    listBatches(),
    listRecipes(),
    dataSource.useDemoData ? Promise.resolve([]) : listCurrentUserScans(),
  ]);
  const completedBatches = batches.filter(
    (batch) => batch.status === "completed",
  ).length;

  return {
    activeBatches: batches.filter((batch) => batch.status === "in_progress")
      .length,
    completedBatches,
    authoredRecipes: recipes.length,
    submittedScans: scans.length,
    level: getBrewerLevel(completedBatches),
  };
}
