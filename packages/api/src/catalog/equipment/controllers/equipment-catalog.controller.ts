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

import { EquipmentCatalogService } from '../services/equipment-catalog.service';
import { EquipmentTemplateDto } from '../dtos/equipment-template.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

/**
 * Read-only HTTP surface for the equipment template catalogue.
 * Two endpoints:
 *   GET /catalog/equipment-templates           → list all
 *   GET /catalog/equipment-templates/:id       → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally
 * absent — the catalogue is operator-curated reference data, not
 * user-managed content. Users create their own personal
 * `equipment_profile` (existing user-owned table) by copying from
 * a template here.
 */
@ApiTags('Catalog · Equipment templates')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/equipment-templates')
export class EquipmentCatalogController {
  constructor(private readonly service: EquipmentCatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'List the equipment template catalogue entries',
  })
  @ApiOkResponse({ type: EquipmentTemplateDto, isArray: true })
  async list(): Promise<EquipmentTemplateDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => EquipmentTemplateDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single equipment template by UUID' })
  @ApiOkResponse({ type: EquipmentTemplateDto })
  @ApiNotFoundResponse({
    description: 'Equipment template catalogue entry not found',
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<EquipmentTemplateDto> {
    const entity = await this.service.getById(id);
    return EquipmentTemplateDto.fromEntity(entity);
  }
}
