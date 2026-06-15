/**
 * French UI copy for the beer catalogue screens (code stays English).
 * Mirrors the Cockburn mobile extensions of
 * `docs/architecture/diagrams/mobile-catalog/01-use-case.md`.
 */

export const BROWSE_TITLE = "Catalogue de bières";
export const BROWSE_SUBTITLE =
  "Explore les bières référencées par Brasse-Bouillon";
export const BROWSE_EMPTY_TITLE = "Catalogue vide pour le moment";
export const BROWSE_EMPTY_DESCRIPTION =
  "Scanne une bouteille pour enrichir le catalogue, ou reviens bientôt.";
export const BROWSE_ERROR = "Impossible de charger le catalogue.";

export const SEARCH_TITLE = "Rechercher une bière";
export const SEARCH_PLACEHOLDER = "Nom d'une bière…";
export const SEARCH_PROMPT_TITLE = "Tape le nom d'une bière";
export const SEARCH_PROMPT_DESCRIPTION =
  "Au moins 2 caractères pour lancer la recherche.";
export const SEARCH_EMPTY_TITLE = (term: string) =>
  `Aucune bière pour « ${term} »`;
export const SEARCH_EMPTY_DESCRIPTION =
  "Essaie un autre nom, parcours le catalogue, ou scanne la bouteille.";
export const SEARCH_ERROR = "Impossible de lancer la recherche.";

export const BEER_NOT_FOUND = "Bière introuvable.";
export const BREWERY_NOT_FOUND = "Brasserie introuvable.";
export const STYLE_NOT_FOUND = "Style introuvable.";
export const DETAIL_ERROR = "Impossible de charger cette fiche.";

export const NEXT_PAGE_ERROR = "Le chargement de la suite a échoué.";
export const RETRY_LABEL = "Réessayer";
export const END_OF_LIST = "Fin du catalogue";

export const BACK_LABEL = "Retour";
export const BACK_ACCESSIBILITY_LABEL = "Revenir en arrière";

export const VERIFIED_BADGE_LABEL = "Vérifiée";
export const SECTION_DESCRIPTION = "Description";
export const SECTION_LEGAL = "Mentions légales";
export const SECTION_PROVENANCE = "Provenance";
export const LEGAL_DENOMINATION_LABEL = "Dénomination";
export const LEGAL_COUNTRY_LABEL = "Pays d'origine";
export const LEGAL_ALLERGENS_LABEL = "Allergènes";
export const LEGAL_ALCOHOL_GROUP_LABEL = "Groupe d'alcool";
export const ABV_LABEL = "Alcool";
export const IBU_LABEL = "Amertume (IBU)";
export const COLOR_LABEL = "Couleur";
export const BREWERY_ROW_LABEL = "Brasserie";
export const STYLE_ROW_LABEL = "Style";
export const BREWERY_TYPE_LABEL = "Type";
export const BREWERY_LOCATION_LABEL = "Localisation";
export const BREWERY_WEBSITE_LABEL = "Site web";
export const STYLE_CATEGORY_LABEL = "Catégorie";
export const STYLE_FAMILY_LABEL = "Famille BJCP";
export const STYLE_ABV_RANGE_LABEL = "Plage d'alcool";
export const STYLE_IBU_RANGE_LABEL = "Plage d'amertume (IBU)";
export const STYLE_COLOR_RANGE_LABEL = "Plage de couleur";
