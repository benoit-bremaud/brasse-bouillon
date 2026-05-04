import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { DistributorCatalogService } from '../services/distributor-catalog.service';
import { DistributorDto } from '../dtos/distributor.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

/**
 * Read-only HTTP surface for the distributor catalogue.
 * Two endpoints :
 *   GET /catalog/distributors          → list all
 *   GET /catalog/distributors/:uuid    → fetch one by UUID
 *
 * The per-product distributor list (e.g. "every distributor
 * that sells Citra") lives on the per-catalogue controllers as
 * a sub-route — see `GET /catalog/hops/:id/distributors` and
 * the equivalents for fermentables / yeasts / misc-templates /
 * equipment-templates. Keeps each catalogue's HTTP surface
 * modular instead of introducing a polymorphic shared route.
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally
 * absent — the catalogue is operator-curated reference data,
 * not user-managed content.
 */
@ApiTags('Catalog · Distributors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/distributors')
export class DistributorCatalogController {
  constructor(private readonly service: DistributorCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the distributor catalogue entries' })
  @ApiOkResponse({ type: DistributorDto, isArray: true })
  async list(): Promise<DistributorDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => DistributorDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single distributor by UUID' })
  @ApiOkResponse({ type: DistributorDto })
  @ApiNotFoundResponse({
    description: 'Distributor catalogue entry not found',
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DistributorDto> {
    const entity = await this.service.getById(id);
    return DistributorDto.fromEntity(entity);
  }
}
