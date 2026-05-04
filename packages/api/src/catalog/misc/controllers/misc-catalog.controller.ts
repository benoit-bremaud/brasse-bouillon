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

import {
  CatalogDistributorLinkDto,
  mapJunctionRowToDto,
} from '../../distributor/dtos/catalog-distributor-link.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { MiscCatalogService } from '../services/misc-catalog.service';
import { MiscTemplateDto } from '../dtos/misc-template.dto';

/**
 * Read-only HTTP surface for the misc template catalogue.
 * Two endpoints:
 *   GET /catalog/misc-templates           → list all
 *   GET /catalog/misc-templates/:id       → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally
 * absent — the catalogue is operator-curated reference data,
 * not user-managed content. Recipes that include miscellaneous
 * ingredients will reference this catalogue by UUID through the
 * recipe-misc junction table introduced post Phase 3.
 */
@ApiTags('Catalog · Misc templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/misc-templates')
export class MiscCatalogController {
  constructor(private readonly service: MiscCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the misc template catalogue entries' })
  @ApiOkResponse({ type: MiscTemplateDto, isArray: true })
  async list(): Promise<MiscTemplateDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => MiscTemplateDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single misc template by UUID' })
  @ApiOkResponse({ type: MiscTemplateDto })
  @ApiNotFoundResponse({
    description: 'Misc template catalogue entry not found',
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MiscTemplateDto> {
    const entity = await this.service.getById(id);
    return MiscTemplateDto.fromEntity(entity);
  }

  @Get(':id/distributors')
  @ApiOperation({
    summary:
      'List distributors that sell this misc template (boutique foundation)',
  })
  @ApiOkResponse({ type: CatalogDistributorLinkDto, isArray: true })
  @ApiNotFoundResponse({
    description: 'Misc template catalogue entry not found',
  })
  async getDistributors(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CatalogDistributorLinkDto[]> {
    const rows = await this.service.getDistributors(id);
    return rows.map(mapJunctionRowToDto);
  }
}
