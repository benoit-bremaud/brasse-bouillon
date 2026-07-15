import { AcademyCategory, AcademyLevel } from "../domain";

export function formatAcademyLevelLabel(level: AcademyLevel): string {
  switch (level) {
    case "beginner":
      return "Débutant";
    case "intermediate":
      return "Intermédiaire";
    case "advanced":
      return "Avancé";
  }
}

export function formatAcademyCategoryLabel(category: AcademyCategory): string {
  switch (category) {
    case "getting-started":
      return "Premiers pas";
    case "history":
      return "Histoire";
    case "ingredients":
      return "Ingrédients";
    case "process":
      return "Process";
    case "fermentation":
      return "Fermentation";
    case "water":
      return "Eau";
    case "equipment":
      return "Matériel";
    case "beer-styles":
      return "Styles";
    case "safety":
      return "Sécurité";
    case "troubleshooting":
      return "Dépannage";
    case "glossary":
      return "Glossaire";
  }
}

export function formatAcademyReadTime(minutes: number): string {
  return `${minutes} min`;
}
