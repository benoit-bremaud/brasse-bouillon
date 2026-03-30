import { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export type DiscoverySpace = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: Href;
  iconName: keyof typeof Ionicons.glyphMap;
  accentEmoji: string;
};

export const DISCOVERY_SPACES: DiscoverySpace[] = [
  {
    id: "recipes-public",
    title: "Recettes de la communauté",
    subtitle: "Nouveautés à tester",
    description:
      "Parcours les recettes publiques, repère les profils qui t'inspirent et lance des variantes maison.",
    href: "/(app)/recipes",
    iconName: "flame-outline",
    accentEmoji: "🔥",
  },
  {
    id: "ingredients-themed",
    title: "Parcours thématique ingrédients",
    subtitle: "La Malterie · La Houblonnière · Le Fermentoir",
    description:
      "Navigue dans les univers ingrédients thématiques et compare rapidement les fiches techniques utiles.",
    href: "/(app)/ingredients",
    iconName: "leaf-outline",
    accentEmoji: "🌿",
  },
  {
    id: "water-space",
    title: "Le Puits 💧",
    subtitle: "Eau de brassage",
    description:
      "Accède au calculateur eau pour ajuster ton profil minéral selon le style et viser un pH cohérent.",
    href: {
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    },
    iconName: "water-outline",
    accentEmoji: "💧",
  },
  {
    id: "spice-space",
    title: "L'Épicerie 🌶️",
    subtitle: "Adjuvants & Épices",
    description:
      "Retrouve les adjuvants et épices via la boutique pour enrichir les recettes selon ton profil aromatique.",
    href: {
      pathname: "/(app)/shop/[category]",
      params: { category: "accessoires" },
    },
    iconName: "restaurant-outline",
    accentEmoji: "🌶️",
  },
  {
    id: "equipment-space",
    title: "L'Office 🍽️",
    subtitle: "Matériel",
    description:
      "Gère ton inventaire matériel, vérifie tes capacités et sécurise les volumes cibles de brassin.",
    href: "/(app)/equipment",
    iconName: "construct-outline",
    accentEmoji: "🍽️",
  },
  {
    id: "academy-guided",
    title: "Parcours guidés Académie",
    subtitle: "Lecture + calculateur",
    description:
      "Explore la théorie brassicole et ouvre les calculateurs depuis les chapitres pour ancrer la pratique.",
    href: "/(app)/academy",
    iconName: "school-outline",
    accentEmoji: "🎓",
  },
];
