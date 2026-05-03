import { Repository } from 'typeorm';

import { StyleOrmEntity } from '../../catalog/style/entities/style.orm.entity';
import { StyleType } from '../../catalog/style/domain/enums/style-type.enum';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `styles` BJCP reference catalogue (Issue #708 /
 * #869, Phase 2 PR #4). Operator-curated entries — drawn from the
 * BeerXML 1.0 reference fixture (`docs/architecture/specs/fixtures/
 * libraries/style.xml`, 5 entries tagged BJCP 1999) and from the
 * official BJCP 2021 guidelines (15 modern entries needed by the
 * demo recipes), but deliberately not a verbatim copy of either
 * source. French notes / profile / ingredients / examples follow
 * the convention used by the Phase 1 catalogues and
 * PUBLIC_RECIPES_SEED.description.
 *
 * The 20 entries are split:
 *   • 5 BeerXML canonical (BJCP 1999): American Wheat, Bohemian
 *     Pilsner, California Common Beer, Dry Stout (Irish),
 *     Traditional Bock — verbatim from libraries/style.xml.
 *   • 15 modern (BJCP 2021 + 1 hybrid post-2010 White IPA)
 *     covering every demo recipe: American IPA, American Pale
 *     Ale, New England IPA, White IPA, Belgian Tripel, Belgian
 *     Strong Golden Ale, Saison, Witbier, Hefeweizen, Kölsch,
 *     Wee Heavy, Russian Imperial Stout, Baltic Porter, Vienna
 *     Lager, Strong Bitter (ESB).
 *
 * UUID range `00000000-0000-4000-9000-3000-...` is reserved for
 * styles (hops use `0`, fermentables `1`, yeasts `2`, styles `3`).
 *
 * Colour values are stored in EBC (project convention — see
 * `feedback_normalized_colors`). BJCP / BeerXML quote SRM; the
 * conversion used is EBC ≈ SRM × 1.97.
 */

export interface StyleCatalogSeed {
  id: string;
  name: string;
  category: string;
  category_number: number;
  style_letter: string;
  style_guide: string;
  type: StyleType;
  og_min: number | null;
  og_max: number | null;
  fg_min: number | null;
  fg_max: number | null;
  ibu_min: number | null;
  ibu_max: number | null;
  color_ebc_min: number | null;
  color_ebc_max: number | null;
  carb_min: number | null;
  carb_max: number | null;
  abv_min: number | null;
  abv_max: number | null;
  notes: string | null;
  profile: string | null;
  ingredients: string | null;
  examples: string | null;
}

export const STYLES_CATALOG_SEED: readonly StyleCatalogSeed[] = [
  // ─── 5 BeerXML canonical entries (BJCP 1999, libraries/style.xml) ────────
  {
    id: '00000000-0000-4000-9000-300000000001',
    name: 'American Wheat',
    category: 'Light Ale',
    category_number: 3,
    style_letter: 'B',
    style_guide: 'BJCP 1999',
    type: StyleType.MIXED,
    og_min: 1.035,
    og_max: 1.055,
    fg_min: 1.008,
    fg_max: 1.015,
    ibu_min: 10,
    ibu_max: 30,
    color_ebc_min: 4,
    color_ebc_max: 16,
    carb_min: 2.3,
    carb_max: 2.6,
    abv_min: 3.7,
    abv_max: 5.5,
    notes:
      'Bière de blé américaine, fermentée avec une levure ale ' +
      'standard. Sans les notes banane / clou de girofle des ' +
      'Weizen allemandes. Plus proche des American Light Ales.',
    profile:
      'Saveur et corps légers, croustillants. Amertume basse à ' +
      'modérée, arôme houblon discret. Couleur paille à dorée. ' +
      'Pas de phénols, faible diacétyle.',
    ingredients:
      "Malt pâle américain, jusqu'à 60% de malt de blé. Levure " +
      'ale américaine ou occasionnellement lager.',
    examples: 'Sam Adams Summer Wheat, Wheat Hook Ale, Anchor Wheat.',
  },
  {
    id: '00000000-0000-4000-9000-300000000002',
    name: 'Bohemian Pilsner',
    category: 'European Pale Lager',
    category_number: 2,
    style_letter: 'A',
    style_guide: 'BJCP 1999',
    type: StyleType.LAGER,
    og_min: 1.044,
    og_max: 1.056,
    fg_min: 1.013,
    fg_max: 1.017,
    ibu_min: 35,
    ibu_max: 45,
    color_ebc_min: 6,
    color_ebc_max: 10,
    carb_min: 2.3,
    carb_max: 2.6,
    abv_min: 4,
    abv_max: 5.3,
    notes:
      'Bière emblématique de Plzeň, République tchèque. Brassée ' +
      'avec une eau très douce et un fort taux de houblonnage.',
    profile:
      'Corps léger à moyen avec une douceur résiduelle. Saveur ' +
      'et arôme Saaz prononcés, sans amertume persistante. ' +
      'Saveur propre, faible diacétyle. Houblonnée et maltée ' +
      'sans arrière-goût.',
    ingredients:
      'Houblon Saaz, malt pilsner clair, levure pilsner, profil ' +
      'eau douce.',
    examples: 'Budvar, Pilsner Urquell, Gambrinus',
  },
  {
    id: '00000000-0000-4000-9000-300000000003',
    name: 'California Common Beer',
    category: 'American Pale Ale',
    category_number: 6,
    style_letter: 'C',
    style_guide: 'BJCP 1999',
    type: StyleType.MIXED,
    og_min: 1.044,
    og_max: 1.055,
    fg_min: 1.011,
    fg_max: 1.014,
    ibu_min: 35,
    ibu_max: 45,
    color_ebc_min: 16,
    color_ebc_max: 28,
    carb_min: 2.4,
    carb_max: 2.8,
    abv_min: 4,
    abv_max: 5.5,
    notes:
      'Connu sous le nom commercial déposé "Steam Beer" par ' +
      'Anchor Brewing. Style hybride, fortement houblonné, ' +
      'fermenté avec une levure lager à températures ale puis ' +
      'lagering à froid.',
    profile:
      'Saveur houblon distinctive (Northern Brewer). Saveur ' +
      'lager propre mais caractère ale. Sec, avec une touche ' +
      'caramel toasté. Couleur ambrée. Faible esters fruités.',
    ingredients:
      'Malts pâle et caramel moyen. Houblon Northern Brewer. ' +
      'Levure lager fermentée à températures ale.',
    examples: 'Anchor Steam Beer',
  },
  {
    id: '00000000-0000-4000-9000-300000000004',
    name: 'Dry Stout (Irish)',
    category: 'Stout',
    category_number: 16,
    style_letter: 'A',
    style_guide: 'BJCP 1999',
    type: StyleType.ALE,
    og_min: 1.035,
    og_max: 1.05,
    fg_min: 1.007,
    fg_max: 1.011,
    ibu_min: 30,
    ibu_max: 50,
    color_ebc_min: 69,
    color_ebc_max: 394,
    carb_min: 1.6,
    carb_max: 2.1,
    abv_min: 3.2,
    abv_max: 5.5,
    notes:
      'Stout irlandais célèbre (Guinness). Saveur torréfiée ' +
      'presque café. Faible densité initiale en version ' +
      'irlandaise. Parfois mélangé avec de la bière acidifiée ' +
      'pasteurisée pour une légère acidité.',
    profile:
      'Sensation de corps plein grâce au flaked barley malgré ' +
      'la basse densité. Saveur torréfiée sèche. Houblonnage ' +
      'généreux mais saveur maltée dominante. Saveur fruitée ' +
      'complexe. Couleur noire opaque.',
    ingredients:
      'Malt anglais, Roasted Barley et Flaked Barley pour le ' +
      'tout-grain. Houblon Goldings ou Fuggles. Eau peu ' +
      'sulfatée, riche en calcium.',
    examples: 'Guinness Stout',
  },
  {
    id: '00000000-0000-4000-9000-300000000005',
    name: 'Traditional Bock',
    category: 'Bock',
    category_number: 14,
    style_letter: 'A',
    style_guide: 'BJCP 1999',
    type: StyleType.LAGER,
    og_min: 1.064,
    og_max: 1.072,
    fg_min: 1.013,
    fg_max: 1.02,
    ibu_min: 20,
    ibu_max: 35,
    color_ebc_min: 28,
    color_ebc_max: 59,
    carb_min: 2.2,
    carb_max: 2.7,
    abv_min: 6,
    abv_max: 7.5,
    notes:
      "Lager forte d'Einbeck, Allemagne. Caractère malté lisse " +
      'avec une touche chocolat ou toasté. La loi allemande ' +
      "exige une densité initiale d'au moins 16 plato (1.064).",
    profile:
      'Corps moyen à plein, saveur maltée avec un arôme ' +
      'chocolat. Peu ou pas de caractère torréfié. Faible ' +
      'arôme et saveur de houblon pour équilibrer le malt. ' +
      'Couleur ambrée à brune. Carbonatation modérée.',
    ingredients:
      'Saveur et couleur principalement issues du malt Munich ' +
      'foncé. Très peu de malt foncé ou chocolat. Houblon ' +
      'allemand pour amertume seulement. Levure lager allemande.',
    examples: 'Aass Bock, Einbecker Ur-bock',
  },
  // ─── 15 modern BJCP 2021 entries for the demo recipes ───────────────────
  {
    id: '00000000-0000-4000-9000-300000000006',
    name: 'American IPA',
    category: 'IPA',
    category_number: 21,
    style_letter: 'A',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.056,
    og_max: 1.07,
    fg_min: 1.008,
    fg_max: 1.014,
    ibu_min: 40,
    ibu_max: 70,
    color_ebc_min: 12,
    color_ebc_max: 28,
    carb_min: 2.2,
    carb_max: 2.7,
    abv_min: 5.5,
    abv_max: 7.5,
    notes:
      'IPA américaine moderne, déclinaison hop-forward de la ' +
      'Pale Ale. Style emblématique de la révolution craft US. ' +
      'Référence : Punk IPA de BrewDog.',
    profile:
      'Arôme houblon explosif (agrumes, tropical, résineux). ' +
      'Amertume marquée mais équilibrée. Couleur dorée à ' +
      'ambrée claire. Finition sèche. Saveur maltée discrète ' +
      'pour laisser le houblon dominer.',
    ingredients:
      "Pale Ale Malt (US 2-Row) base, jusqu'à 10% de Crystal " +
      'Malt léger. Houblons américains (Citra, Mosaic, Simcoe, ' +
      'Centennial). Levure American Ale propre (US-05, WLP001).',
    examples: 'Punk IPA, Stone IPA, Russian River Blind Pig',
  },
  {
    id: '00000000-0000-4000-9000-300000000007',
    name: 'American Pale Ale',
    category: 'Pale American Ale',
    category_number: 18,
    style_letter: 'B',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.045,
    og_max: 1.06,
    fg_min: 1.01,
    fg_max: 1.015,
    ibu_min: 30,
    ibu_max: 50,
    color_ebc_min: 10,
    color_ebc_max: 20,
    carb_min: 2.3,
    carb_max: 2.8,
    abv_min: 4.5,
    abv_max: 6.2,
    notes:
      "Pale Ale américaine, plus douce et accessible que l'IPA. " +
      'Référence Sierra Nevada Pale Ale (la pionnière 1980). ' +
      'Bon équilibre malt/houblon.',
    profile:
      'Arôme et saveur houblon américains présents (agrumes, ' +
      'pin, fleurs) sans dominer le malt. Amertume modérée. ' +
      'Corps léger à moyen, finition sèche.',
    ingredients:
      'Pale Ale Malt (US 2-Row), parfois un peu de Crystal Malt. ' +
      'Houblons américains (Cascade classique). Levure ' +
      'American Ale neutre.',
    examples: 'Sierra Nevada Pale Ale, Half Acre Daisy Cutter',
  },
  {
    id: '00000000-0000-4000-9000-300000000008',
    name: 'New England IPA',
    category: 'IPA',
    category_number: 21,
    style_letter: 'B',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.06,
    og_max: 1.085,
    fg_min: 1.01,
    fg_max: 1.015,
    ibu_min: 25,
    ibu_max: 60,
    color_ebc_min: 6,
    color_ebc_max: 14,
    carb_min: 2.4,
    carb_max: 2.9,
    abv_min: 6,
    abv_max: 9,
    notes:
      'NEIPA / Hazy IPA. Style apparu vers 2010 (The Alchemist ' +
      'Heady Topper, Tree House Brewing). Trouble par design, ' +
      'sensation tropicale juteuse, faible amertume perçue.',
    profile:
      'Aspect trouble (haze) caractéristique. Arôme tropical ' +
      'massif (mangue, fruit de la passion, agrumes). Bouche ' +
      "crémeuse, juteuse. Amertume douce malgré l'IBU élevé. " +
      "Faible houblonnage à l'ébullition, énorme dry hop.",
    ingredients:
      'Pale Ale Malt + 15-20% Wheat Malt + Flaked Oats pour la ' +
      'crème. Houblons tropicaux (Citra, Mosaic, Galaxy). ' +
      'Levure London Ale III (Wyeast 1318) pour les esters et ' +
      'le haze.',
    examples: 'The Alchemist Heady Topper, Tree House Julius',
  },
  {
    id: '00000000-0000-4000-9000-300000000009',
    name: 'White IPA',
    category: 'IPA Hybride',
    category_number: 21,
    style_letter: 'X',
    style_guide: 'Hybrid post-2010',
    type: StyleType.ALE,
    og_min: 1.054,
    og_max: 1.065,
    fg_min: 1.01,
    fg_max: 1.014,
    ibu_min: 30,
    ibu_max: 55,
    color_ebc_min: 10,
    color_ebc_max: 16,
    carb_min: 2.4,
    carb_max: 2.9,
    abv_min: 5.5,
    abv_max: 7,
    notes:
      'Hybride Witbier + American IPA, popularisé fin 2000s ' +
      '(Deschutes Chainbreaker White IPA). Pas de catégorie ' +
      'BJCP officielle stricte, classé en pratique sous IPA ' +
      'Hybride.',
    profile:
      "Base Witbier (wheat, coriandre, écorce d'orange) + " +
      'arôme houblon américain. Couleur dorée trouble. ' +
      'Amertume modérée. Levure belge donne phénols et esters ' +
      'fruités.',
    ingredients:
      'Pilsner Malt + Wheat Malt + Flaked Oats. Coriandre + ' +
      "écorce d'orange amère. Houblons américains aromatiques " +
      '(Citra, Amarillo). Levure belge Witbier (WLP410).',
    examples: 'Deschutes Chainbreaker, Boulevard White IPA',
  },
  {
    id: '00000000-0000-4000-9000-30000000000a',
    name: 'Belgian Tripel',
    category: 'Strong Belgian Ale',
    category_number: 26,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.075,
    og_max: 1.085,
    fg_min: 1.008,
    fg_max: 1.014,
    ibu_min: 20,
    ibu_max: 40,
    color_ebc_min: 8,
    color_ebc_max: 14,
    carb_min: 2.7,
    carb_max: 3.2,
    abv_min: 7.5,
    abv_max: 9.5,
    notes:
      'Tripel belge, classique trappiste (Westmalle, Chimay ' +
      'Tripel). Forte mais paradoxalement légère et sèche en ' +
      'bouche. Style très carbonaté.',
    profile:
      'Couleur dorée brillante. Mousse riche et persistante. ' +
      'Arôme épicé (poivre), fruité (poire, agrumes), phénolique ' +
      'discret. Finition sèche malgré la densité élevée. ' +
      'Alcool perceptible mais bien intégré.',
    ingredients:
      'Pilsner Malt base + 10-20% sucre candi clair (atténuation ' +
      'extrême). Houblons nobles européens (Saaz, Styrian ' +
      'Goldings). Levure belge Trappiste (Wyeast 3787, WLP500).',
    examples: 'Westmalle Tripel, Chimay Tripel, Tripel Karmeliet',
  },
  {
    id: '00000000-0000-4000-9000-30000000000b',
    name: 'Belgian Strong Golden Ale',
    category: 'Strong Belgian Ale',
    category_number: 25,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.07,
    og_max: 1.095,
    fg_min: 1.005,
    fg_max: 1.016,
    ibu_min: 22,
    ibu_max: 35,
    color_ebc_min: 6,
    color_ebc_max: 12,
    carb_min: 2.7,
    carb_max: 3.2,
    abv_min: 7.5,
    abv_max: 10.5,
    notes:
      'Sœur plus pâle et plus sèche du Tripel. Référence Duvel. ' +
      'Très fortement carbonatée, légère, dangereusement ' +
      "descendable malgré l'alcool.",
    profile:
      'Couleur paille à dorée pâle. Mousse abondante très ' +
      'persistante. Arôme fruité (pomme, poire), épicé, ' +
      'légèrement phénolique. Finition très sèche. Amertume ' +
      "plus marquée qu'un Tripel.",
    ingredients:
      "Pilsner Malt + sucre candi clair (jusqu'à 25%). Houblons " +
      'nobles. Levure belge à esters (WLP570 Belgian Golden Ale).',
    examples: 'Duvel, Delirium Tremens, Lucifer',
  },
  {
    id: '00000000-0000-4000-9000-30000000000c',
    name: 'Saison',
    category: 'Strong Belgian Ale',
    category_number: 25,
    style_letter: 'B',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.048,
    og_max: 1.065,
    fg_min: 1.002,
    fg_max: 1.012,
    ibu_min: 20,
    ibu_max: 35,
    color_ebc_min: 10,
    color_ebc_max: 28,
    carb_min: 2.8,
    carb_max: 3.5,
    abv_min: 5,
    abv_max: 7,
    notes:
      'Bière de ferme du Hainaut belge. Historiquement brassée ' +
      "l'hiver pour les saisonniers (saison) qui la boivent " +
      "l'été. Très atténuée, très sèche, désaltérante.",
    profile:
      'Couleur dorée à orangée. Carbonatation très élevée. ' +
      'Arôme épicé (poivre noir), agrumes, terreux. Finition ' +
      'extrêmement sèche, légèrement acidulée. Phénols et ' +
      'esters belges proéminents.',
    ingredients:
      "Pilsner Malt base + jusqu'à 25% wheat / spelt / oats. " +
      'Parfois sucre. Houblons nobles européens. Levure Saison ' +
      '(Wyeast 3711 French Saison) — atténuation extrême.',
    examples: 'Saison Dupont, Fantôme, Brasserie de la Senne Taras Boulba',
  },
  {
    id: '00000000-0000-4000-9000-30000000000d',
    name: 'Witbier',
    category: 'Belgian Ale',
    category_number: 24,
    style_letter: 'A',
    style_guide: 'BJCP 2021',
    type: StyleType.WHEAT,
    og_min: 1.044,
    og_max: 1.052,
    fg_min: 1.008,
    fg_max: 1.012,
    ibu_min: 8,
    ibu_max: 20,
    color_ebc_min: 4,
    color_ebc_max: 8,
    carb_min: 2.5,
    carb_max: 3,
    abv_min: 4.5,
    abv_max: 5.5,
    notes:
      'Bière de blé belge épicée. Recréée par Pierre Celis dans ' +
      'les années 60 (Hoegaarden). Trouble par design, légère, ' +
      'rafraîchissante.',
    profile:
      'Couleur paille pâle, trouble dense (haze). Arôme ' +
      "coriandre + écorce d'orange amère + esters fruités " +
      'légers + phénols épicés. Bouche douce, légèrement ' +
      'acidulée. Faible amertume.',
    ingredients:
      '50% Pilsner Malt + 50% Wheat Malt non malté + Flaked ' +
      "Oats parfois. Coriandre + écorce d'orange amère de " +
      'Curaçao. Houblons nobles (Saaz, Hallertau). Levure ' +
      'belge Witbier (WLP400, WLP410).',
    examples: 'Hoegaarden, Allagash White, Blue Moon',
  },
  {
    id: '00000000-0000-4000-9000-30000000000e',
    name: 'Hefeweizen',
    category: 'German Wheat Beer',
    category_number: 10,
    style_letter: 'A',
    style_guide: 'BJCP 2021',
    type: StyleType.WHEAT,
    og_min: 1.044,
    og_max: 1.052,
    fg_min: 1.01,
    fg_max: 1.014,
    ibu_min: 8,
    ibu_max: 15,
    color_ebc_min: 4,
    color_ebc_max: 12,
    carb_min: 3.3,
    carb_max: 4.5,
    abv_min: 4.3,
    abv_max: 5.6,
    notes:
      'Bière de blé bavaroise non filtrée (Hefe = levure). ' +
      'Style historique brassé depuis le XVIᵉ siècle. ' +
      'Carbonatation très élevée (verre Weizen évasé).',
    profile:
      'Couleur paille à dorée, trouble dense. Arôme banane ' +
      "(acétate d'isoamyle) + clou de girofle (4-vinyl " +
      'guaïacol) caractéristique de la levure. Bouche pleine ' +
      'malgré la faible densité (wheat). Finition douce.',
    ingredients:
      '50-70% Wheat Malt + Pilsner Malt base. Houblons nobles ' +
      "pour amertume seulement (pas d'arôme). Levure " +
      'Weihenstephan Weizen (Wyeast 3068, WLP300).',
    examples:
      'Weihenstephaner Hefeweissbier, Schneider Weisse, Paulaner Hefe-Weizen',
  },
  {
    id: '00000000-0000-4000-9000-30000000000f',
    name: 'Kölsch',
    category: 'Pale Bitter European Beer',
    category_number: 5,
    style_letter: 'B',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.044,
    og_max: 1.05,
    fg_min: 1.007,
    fg_max: 1.011,
    ibu_min: 18,
    ibu_max: 30,
    color_ebc_min: 7,
    color_ebc_max: 10,
    carb_min: 2.4,
    carb_max: 2.8,
    abv_min: 4.4,
    abv_max: 5.2,
    notes:
      'Bière hybride de Cologne (appellation protégée Kölsch ' +
      'Konvention). Fermentée chaude par une levure ale puis ' +
      'lagering à froid. Servie en verre Stange élancé.',
    profile:
      'Couleur paille brillante. Saveur maltée douce, ' +
      'légèrement noble (Tettnanger). Finition croustillante ' +
      "et nette. Très peu d'esters, pas de phénols. Plus de " +
      "caractère qu'une lager standard.",
    ingredients:
      'Pilsner Malt base. Houblons nobles allemands ' +
      '(Tettnanger, Hallertau). Levure Kölsch hybride ' +
      '(Wyeast 2565).',
    examples: 'Reissdorf Kölsch, Früh Kölsch, Gaffel Kölsch',
  },
  {
    id: '00000000-0000-4000-9000-300000000010',
    name: 'Wee Heavy / Strong Scotch Ale',
    category: 'Scottish Ale',
    category_number: 17,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.07,
    og_max: 1.13,
    fg_min: 1.018,
    fg_max: 1.04,
    ibu_min: 17,
    ibu_max: 35,
    color_ebc_min: 28,
    color_ebc_max: 79,
    carb_min: 1.8,
    carb_max: 2.4,
    abv_min: 6.5,
    abv_max: 10,
    notes:
      'Scotch Ale forte écossaise. Maltée à fond, parfois une ' +
      'touche tourbée optionnelle. Maturation 3 mois recommandée. ' +
      "Caramélisation prolongée du moût lors de l'ébullition.",
    profile:
      'Couleur cuivre à brun foncé. Saveur maltée intense ' +
      '(caramel cuit, fruits secs cuits, mélasse). Faible ' +
      'amertume. Corps plein, finition douce mais pas sucrée. ' +
      'Alcool chaleureux mais non agressif.',
    ingredients:
      'Maris Otter base + Crystal Malt foncé + une touche de ' +
      'malt torréfié pour la couleur. Houblons anglais ' +
      '(East Kent Goldings) en discrétion. Levure ' +
      'écossaise / English Ale.',
    examples: 'Founders Dirty Bastard, Belhaven Wee Heavy, Traquair House Ale',
  },
  {
    id: '00000000-0000-4000-9000-300000000011',
    name: 'Russian Imperial Stout',
    category: 'American Porter and Stout',
    category_number: 20,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.075,
    og_max: 1.115,
    fg_min: 1.018,
    fg_max: 1.03,
    ibu_min: 50,
    ibu_max: 90,
    color_ebc_min: 59,
    color_ebc_max: 79,
    carb_min: 1.8,
    carb_max: 2.5,
    abv_min: 8,
    abv_max: 12,
    notes:
      'Imperial Stout, version musclée du stout exportée à la ' +
      'cour impériale russe au XVIIIᵉ. Très alcoolisée, ' +
      'intensément torréfiée. Idéale en vieillissement bouteille ' +
      '6-12 mois.',
    profile:
      'Couleur noire opaque. Mousse beige persistante. Arôme ' +
      'café noir, chocolat amer, fruits noirs cuits, parfois ' +
      'vanille / bourbon (versions barrel-aged). Amertume ' +
      'élevée mais équilibrée par la richesse maltée. Alcool ' +
      'chaleureux assumé.',
    ingredients:
      'Pale Ale Malt base + multiples malts torréfiés ' +
      '(Chocolate, Roasted Barley, Black Patent). Houblons ' +
      'amérisants haut alpha (Magnum, Columbus). Levure American ' +
      "Ale tolérante à l'alcool (US-05, WLP001).",
    examples: 'North Coast Old Rasputin, BrewDog Tokyo, Founders KBS',
  },
  {
    id: '00000000-0000-4000-9000-300000000012',
    name: 'Baltic Porter',
    category: 'European Brown Beer',
    category_number: 9,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.LAGER,
    og_min: 1.06,
    og_max: 1.09,
    fg_min: 1.016,
    fg_max: 1.024,
    ibu_min: 20,
    ibu_max: 40,
    color_ebc_min: 34,
    color_ebc_max: 59,
    carb_min: 2,
    carb_max: 2.6,
    abv_min: 6.5,
    abv_max: 9.5,
    notes:
      'Porter de la mer Baltique fermenté à froid avec une ' +
      'levure lager. Plus propre que le Russian Imperial Stout. ' +
      'Notes de pruneau, café, chocolat noir.',
    profile:
      'Couleur brun foncé à noire. Saveur maltée riche, fruits ' +
      'secs cuits, chocolat, café modéré. Alcool intégré sans ' +
      'chaleur agressive (fermentation froide). Finition plus ' +
      "sèche qu'un Imperial Stout. Pas de torréfié âpre.",
    ingredients:
      'Pilsner Malt + Munich + Crystal foncé + petite touche de ' +
      'Chocolate Malt. Houblons nobles. Levure lager (WLP800, ' +
      'W-34/70) fermentée à froid.',
    examples: 'Żywiec Porter, Sinebrychoff Porter, Okocim Porter',
  },
  {
    id: '00000000-0000-4000-9000-300000000013',
    name: 'Vienna Lager',
    category: 'Amber Malty European Lager',
    category_number: 7,
    style_letter: 'A',
    style_guide: 'BJCP 2021',
    type: StyleType.LAGER,
    og_min: 1.048,
    og_max: 1.055,
    fg_min: 1.01,
    fg_max: 1.014,
    ibu_min: 18,
    ibu_max: 30,
    color_ebc_min: 18,
    color_ebc_max: 30,
    carb_min: 2.4,
    carb_max: 2.8,
    abv_min: 4.7,
    abv_max: 5.5,
    notes:
      'Lager ambrée de Vienne créée par Anton Dreher en 1841 ' +
      '(grâce au malt Vienna inventé pour ce style). Quasi ' +
      'éteinte en Europe au XXᵉ, préservée au Mexique ' +
      '(Negra Modelo).',
    profile:
      'Couleur ambrée à cuivre clair. Arôme malté doux, ' +
      'légèrement toasté (Vienna Malt). Houblonnage modéré. ' +
      'Finition propre, sèche. Bel équilibre malt-amertume.',
    ingredients:
      'Vienna Malt base (60-70%) + Pilsner Malt + petite touche ' +
      'de Munich. Houblons nobles allemands. Levure lager ' +
      'continentale.',
    examples: 'Negra Modelo, Brooklyn Lager, Devils Backbone Vienna Lager',
  },
  {
    id: '00000000-0000-4000-9000-300000000014',
    name: 'Strong Bitter (ESB)',
    category: 'British Bitter',
    category_number: 11,
    style_letter: 'C',
    style_guide: 'BJCP 2021',
    type: StyleType.ALE,
    og_min: 1.048,
    og_max: 1.06,
    fg_min: 1.01,
    fg_max: 1.016,
    ibu_min: 30,
    ibu_max: 50,
    color_ebc_min: 16,
    color_ebc_max: 36,
    carb_min: 1.6,
    carb_max: 2.2,
    abv_min: 4.6,
    abv_max: 6.2,
    notes:
      'Extra Special Bitter, sommet de la pyramide des bitters ' +
      'anglaises (Ordinary < Best < Strong / ESB). Le nom est à ' +
      "l'origine une marque déposée par Fuller's, devenue style à " +
      'part entière.',
    profile:
      'Couleur ambrée à cuivre. Saveur maltée biscuitée ' +
      'caractéristique du Maris Otter. Amertume franche ' +
      'East Kent Goldings. Esters fruités modérés. Carbonatation ' +
      'basse (cask ale tradition). Finition équilibrée.',
    ingredients:
      'Maris Otter base + Crystal Malt anglais + parfois sucre ' +
      'invert. Houblons East Kent Goldings + Fuggles. Levure ' +
      'English Ale (S-04, WLP002).',
    examples: "Fuller's ESB, Adnams Broadside, Shepherd Neame Spitfire",
  },
];

/**
 * Result returned by `seedStylesCatalog` for instrumentation /
 * verification. Lets callers (tests, CLI, npm scripts) report what
 * happened without re-querying the DB.
 */
export interface SeedStylesCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the BJCP style reference catalogue. Insert
 * if the id is unknown, update in place otherwise. Re-running the
 * loader never duplicates rows — see `idempotentUpsertById` for the
 * shared upsert pattern.
 */
export async function seedStylesCatalog(
  repository: Repository<StyleOrmEntity>,
  styles: readonly StyleCatalogSeed[] = STYLES_CATALOG_SEED,
): Promise<SeedStylesCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const style of styles) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: style.id },
      {
        name: style.name,
        category: style.category,
        category_number: style.category_number,
        style_letter: style.style_letter,
        style_guide: style.style_guide,
        type: style.type,
        og_min: style.og_min,
        og_max: style.og_max,
        fg_min: style.fg_min,
        fg_max: style.fg_max,
        ibu_min: style.ibu_min,
        ibu_max: style.ibu_max,
        color_ebc_min: style.color_ebc_min,
        color_ebc_max: style.color_ebc_max,
        carb_min: style.carb_min,
        carb_max: style.carb_max,
        abv_min: style.abv_min,
        abv_max: style.abv_max,
        notes: style.notes,
        profile: style.profile,
        ingredients: style.ingredients,
        examples: style.examples,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
