import { DistributorCatalogModule } from './distributor/distributor.module';
import { EquipmentCatalogModule } from './equipment/equipment.module';
import { FermentableModule } from './fermentable/fermentable.module';
import { HopModule } from './hop/hop.module';
import { MashModule } from './mash/mash.module';
import { MiscCatalogModule } from './misc/misc.module';
import { Module } from '@nestjs/common';
import { ProducerCatalogModule } from './producer/producer.module';
import { StyleModule } from './style/style.module';
import { WaterCatalogModule } from './water/water.module';
import { YeastModule } from './yeast/yeast.module';

/**
 * Root module for the operator-curated reference catalogues
 * consumed by the recipe and brewing flows. Hosts one sub-module
 * per catalogue (Issue #708 / #869):
 *   • Phase 1: HopModule, FermentableModule (PR #2), YeastModule (PR #3)
 *   • Phase 2: StyleModule, MashProfileModule
 *   • Phase 3: WaterCatalogModule, EquipmentCatalogModule,
 *     MiscCatalogModule
 *
 * Each sub-module owns its own ORM entity, service, controller,
 * and DTOs. CatalogModule re-exports nothing for now — direct
 * sub-module dependencies are explicit at the consumer side.
 *
 * Post-Phase 3 follow-ups (cross-catalogue dimensions) :
 *   • ProducerCatalogModule — brand owners (FK 1:1, PR #902)
 *   • DistributorCatalogModule — resellers (M:N junctions per
 *     catalogue, PR #901). Each per-catalogue module also
 *     registers its own junction entity in TypeOrmModule.forFeature
 *     so the per-catalogue service can load distributors directly.
 */
@Module({
  imports: [
    HopModule,
    FermentableModule,
    YeastModule,
    StyleModule,
    MashModule,
    WaterCatalogModule,
    EquipmentCatalogModule,
    MiscCatalogModule,
    ProducerCatalogModule,
    DistributorCatalogModule,
  ],
})
export class CatalogModule {}
