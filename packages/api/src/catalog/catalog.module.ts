import { FermentableModule } from './fermentable/fermentable.module';
import { HopModule } from './hop/hop.module';
import { Module } from '@nestjs/common';

/**
 * Root module for the operator-curated reference catalogues
 * consumed by the recipe and brewing flows. Hosts one sub-module
 * per catalogue (Issue #708 / #869):
 *   • Phase 1: HopModule, FermentableModule (PR #2), YeastModule (PR #3)
 *   • Phase 2: StyleModule, MashProfileModule
 *   • Phase 3: WaterModule, EquipmentModule, MiscModule
 *
 * Each sub-module owns its own ORM entity, service, controller,
 * and DTOs. CatalogModule re-exports nothing for now — direct
 * sub-module dependencies are explicit at the consumer side.
 */
@Module({
  imports: [HopModule, FermentableModule],
})
export class CatalogModule {}
