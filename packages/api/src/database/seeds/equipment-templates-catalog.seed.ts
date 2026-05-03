import { EquipmentTemplateOrmEntity } from '../../catalog/equipment/entities/equipment-template.orm.entity';
import { Repository } from 'typeorm';
import { idempotentUpsertById } from './seed-utils';

/**
 * Seed for the `equipment_templates` reference catalogue (Issue
 * #708 / #869, Phase 3 PR #7). Operator-curated entries — drawn
 * from the BeerXML 1.0 reference fixture
 * (`docs/architecture/specs/fixtures/libraries/equipment.xml`,
 * 2 entries) and from manufacturer datasheets for the modern
 * setups (Grainfather, Klarstein, Anvil).
 *
 * The 9 entries cover the full beginner-to-pro spectrum:
 *   • 1 Brasse-Bouillon original kitchen starter:
 *     Casserole cuisine 5L (kit d'initiation extract — true
 *     beginner who only owns kitchen pots and wants to try
 *     brewing once before investing).
 *   • 2 BeerXML canonical (verbatim from libraries/equipment.xml):
 *     Brew Pot 4 Gal (extract), Brew Pot 6+gal + Igloo Cooler 5
 *     Gal (all-grain classic).
 *   • 6 popular modern setups: BIAB 20L, BIAB 30L, Grainfather G30
 *     (electric all-in-one), Klarstein Brauheld Pro 30L (EU entry-
 *     level), Anvil Foundry 6.5 Gal (US popular electric), 3-Vessel
 *     HERMS Recirculating (advanced / pro).
 *
 * UUID range `00000000-0000-4000-9000-6000-...` is reserved for
 * equipment templates (hops `0`, fermentables `1`, yeasts `2`,
 * styles `3`, mash `4`, waters `5`, equipment `6`).
 */

export interface EquipmentTemplateSeed {
  id: string;
  name: string;
  boil_size_l: number | null;
  batch_size_l: number | null;
  tun_volume_l: number | null;
  tun_weight_kg: number | null;
  tun_specific_heat: number | null;
  top_up_water_l: number | null;
  trub_chiller_loss_l: number | null;
  evap_rate_percent: number | null;
  boil_time_min: number | null;
  calc_boil_volume: boolean;
  lauter_deadspace_l: number | null;
  top_up_kettle_l: number | null;
  hop_utilization_percent: number | null;
  notes: string | null;
}

export const EQUIPMENT_TEMPLATES_CATALOG_SEED: readonly EquipmentTemplateSeed[] =
  [
    // ─── Kitchen starter (Brasse-Bouillon original — true beginner) ──────
    {
      id: '00000000-0000-4000-9000-600000000000',
      name: 'Casserole cuisine 5L (kit initiation extract)',
      boil_size_l: 7,
      batch_size_l: 5,
      tun_volume_l: 10,
      tun_weight_kg: 1.2,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 0.3,
      evap_rate_percent: 12,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 0,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        "Profil 'kit d'initiation' : juste une casserole 5-10 L sur la " +
        'plaque de cuisine, brassage extract uniquement. Brassins de ' +
        '4-5 L finaux (~6 bouteilles 75 cL), parfait pour une première ' +
        'fois sans investissement. Permet de découvrir le brassage à ' +
        "partir d'extraits de malt liquides ou secs (DME/LME) avec un " +
        'houblonnage simple. Évolution naturelle ensuite : passer au ' +
        'Brew Pot 4 Gal ou au BIAB 20 L.',
    },
    // ─── 2 BeerXML canonical entries (libraries/equipment.xml) ──────────
    {
      id: '00000000-0000-4000-9000-600000000001',
      name: 'Brew Pot 4 Gal (extract brewing)',
      boil_size_l: 12.3,
      batch_size_l: 18.9,
      tun_volume_l: 15.1,
      tun_weight_kg: 1.8,
      tun_specific_heat: 0.12,
      top_up_water_l: 8.5,
      trub_chiller_loss_l: 0,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 0.95,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Casserole 4 gallons (~15 L) pour brassage extract ou partial ' +
        "mash. Volume utile d'ébullition d'environ 12 L après réservation " +
        "de l'espace pour le krausen. Setup typique du débutant qui se " +
        "lance sans investir dans une cuve d'empâtage isolée.",
    },
    {
      id: '00000000-0000-4000-9000-600000000002',
      name: 'Brew Pot 6+gal + Igloo Cooler 5 Gal (all-grain classic)',
      boil_size_l: 22.7,
      batch_size_l: 18.9,
      tun_volume_l: 18.9,
      tun_weight_kg: 1.8,
      tun_specific_heat: 0.3,
      top_up_water_l: 0,
      trub_chiller_loss_l: 0.95,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 0.95,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Setup all-grain classique américain : glacière Gott / Igloo 5 ' +
        "gal isolée comme cuve d'empâtage avec faux-fond, plus une " +
        'casserole 6-9 gallons capable de bouillir au moins 6 gallons ' +
        'de moût. Privilégie les empâtages mono-palier infusion.',
    },
    // ─── 6 popular modern setups for the demo recipes ────────────────────
    {
      id: '00000000-0000-4000-9000-600000000003',
      name: 'BIAB 20L (Brew In A Bag, entry-level)',
      boil_size_l: 24,
      batch_size_l: 19,
      tun_volume_l: 20,
      tun_weight_kg: 2.5,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 0.5,
      evap_rate_percent: 10,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 0,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Brew In A Bag : marmite 20 L + sac à grains en nylon, méthode ' +
        'la plus simple du tout-grain. Pas de cuve dédiée, tout se fait ' +
        'dans la marmite. Investissement minimum (~80€), idéal débutant ' +
        "qui passe de l'extract à l'all-grain.",
    },
    {
      id: '00000000-0000-4000-9000-600000000004',
      name: 'BIAB 30L (Brew In A Bag, intermediate)',
      boil_size_l: 32,
      batch_size_l: 23,
      tun_volume_l: 30,
      tun_weight_kg: 3,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 0.7,
      evap_rate_percent: 10,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 0,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'BIAB 30 L pour brassins de 23 L finaux (volume standard ' +
        'homebrew). Permet de brasser des bières fortes (Tripel, ' +
        'Imperial Stout) qui demandent plus de grains. Évolution ' +
        'naturelle du BIAB 20L.',
    },
    {
      id: '00000000-0000-4000-9000-600000000005',
      name: 'Grainfather G30 (electric all-in-one)',
      boil_size_l: 30,
      batch_size_l: 23,
      tun_volume_l: 30,
      tun_weight_kg: 4,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Système électrique tout-en-un néo-zélandais, devenu référence ' +
        'mondiale du homebrew avancé. Recirculation automatique, ' +
        'contrôle PID de la température. Setup populaire pour ' +
        "brasseurs avancés qui veulent s'affranchir de la flamme nue.",
    },
    {
      id: '00000000-0000-4000-9000-600000000006',
      name: 'Klarstein Brauheld Pro 30L (EU entry-level)',
      boil_size_l: 30,
      batch_size_l: 23,
      tun_volume_l: 30,
      tun_weight_kg: 5,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1,
      top_up_kettle_l: 0,
      hop_utilization_percent: 95,
      notes:
        'Système électrique tout-en-un allemand, très populaire en ' +
        'Europe pour son rapport qualité-prix (~400€). Alternative ' +
        'budget au Grainfather. Recirculation moins puissante mais ' +
        'fonctionnelle pour la plupart des recettes.',
    },
    {
      id: '00000000-0000-4000-9000-600000000007',
      name: 'Anvil Foundry 6.5 Gal (US popular electric)',
      boil_size_l: 24.6,
      batch_size_l: 19,
      tun_volume_l: 24.6,
      tun_weight_kg: 4,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1,
      evap_rate_percent: 10,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Système électrique américain populaire, alternative au ' +
        'Grainfather. 6.5 gallons (~24 L) pour des brassins de 19 L. ' +
        "Pompe optionnelle, contrôleur PID, prix d'entrée plus " +
        'accessible que le Grainfather aux US.',
    },
    {
      id: '00000000-0000-4000-9000-600000000008',
      name: '3-Vessel HERMS Recirculating (advanced / pro)',
      boil_size_l: 30,
      batch_size_l: 23,
      tun_volume_l: 30,
      tun_weight_kg: 8,
      tun_specific_heat: 0.3,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1.5,
      evap_rate_percent: 8,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1.5,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes:
        'Setup 3 cuves HERMS (Heat Exchange Recirculating Mash System) : ' +
        "HLT (Hot Liquor Tank) + cuve d'empâtage + bouilloire. Permet " +
        "des programmes d'empâtage à paliers complexes avec contrôle " +
        'précis. Investissement conséquent (1500-3000€), pour ' +
        'brasseurs très avancés ou semi-pros.',
    },
  ];

/**
 * Result returned by `seedEquipmentTemplatesCatalog` for
 * instrumentation / verification.
 */
export interface SeedEquipmentTemplatesCatalogResult {
  inserted: number;
  updated: number;
  total: number;
}

/**
 * Idempotent loader for the equipment template reference
 * catalogue. Insert if the id is unknown, update in place
 * otherwise. Re-running the loader never duplicates rows.
 */
export async function seedEquipmentTemplatesCatalog(
  repository: Repository<EquipmentTemplateOrmEntity>,
  templates: readonly EquipmentTemplateSeed[] = EQUIPMENT_TEMPLATES_CATALOG_SEED,
): Promise<SeedEquipmentTemplatesCatalogResult> {
  let inserted = 0;
  let updated = 0;

  for (const template of templates) {
    const outcome = await idempotentUpsertById(
      repository,
      { id: template.id },
      {
        name: template.name,
        boil_size_l: template.boil_size_l,
        batch_size_l: template.batch_size_l,
        tun_volume_l: template.tun_volume_l,
        tun_weight_kg: template.tun_weight_kg,
        tun_specific_heat: template.tun_specific_heat,
        top_up_water_l: template.top_up_water_l,
        trub_chiller_loss_l: template.trub_chiller_loss_l,
        evap_rate_percent: template.evap_rate_percent,
        boil_time_min: template.boil_time_min,
        calc_boil_volume: template.calc_boil_volume,
        lauter_deadspace_l: template.lauter_deadspace_l,
        top_up_kettle_l: template.top_up_kettle_l,
        hop_utilization_percent: template.hop_utilization_percent,
        notes: template.notes,
      },
    );
    inserted += outcome.inserted;
    updated += outcome.updated;
  }

  return { inserted, updated, total: inserted + updated };
}
