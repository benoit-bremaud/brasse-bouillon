import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { PersonalDataExportBundle } from "../domain/personal-data-export.types";

export async function writeAndSharePersonalDataExport(
  exportBundle: PersonalDataExportBundle,
): Promise<string> {
  const directory = FileSystem.documentDirectory;
  if (!directory) {
    throw new Error("Le stockage local n'est pas disponible.");
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Le partage de fichiers n'est pas disponible.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const uri = `${directory}brasse-bouillon-export-${timestamp}.json`;
  await FileSystem.writeAsStringAsync(
    uri,
    JSON.stringify(exportBundle, null, 2),
  );
  await Sharing.shareAsync(uri, {
    dialogTitle: "Exporter mes données Brasse Bouillon",
    mimeType: "application/json",
    UTI: "public.json",
  });

  return uri;
}
