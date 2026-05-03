import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { StyleCatalogService } from '../services/style-catalog.service';
import { StyleDto } from '../dtos/style.dto';
import { StyleType } from '../domain/enums/style-type.enum';

/**
 * Read-only HTTP surface for the BJCP style catalogue. Two endpoints:
 *   GET /catalog/styles         → list all (optionally filtered)
 *   GET /catalog/styles/:id     → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data. An admin
 * CRUD surface is planned for a later iteration once an admin role
 * / interface exists.
 */
@ApiTags('Catalog · Styles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/styles')
export class StyleCatalogController {
  constructor(private readonly service: StyleCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the BJCP style catalogue entries' })
  @ApiQuery({
    name: 'type',
    enum: StyleType,
    required: false,
    description: 'Filter by style family',
  })
  @ApiQuery({
    name: 'style_guide',
    type: String,
    required: false,
    description: 'Filter by guide version (e.g. "BJCP 1999", "BJCP 2021")',
  })
  @ApiOkResponse({ type: StyleDto, isArray: true })
  async list(
    @Query('type', new ParseEnumPipe(StyleType, { optional: true }))
    type?: StyleType,
    @Query('style_guide') styleGuide?: string,
  ): Promise<StyleDto[]> {
    const rows = await this.service.list({ type, style_guide: styleGuide });
    return rows.map((row) => StyleDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single BJCP style catalogue entry by UUID' })
  @ApiOkResponse({ type: StyleDto })
  @ApiNotFoundResponse({ description: 'Style catalogue entry not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StyleDto> {
    const entity = await this.service.getById(id);
    return StyleDto.fromEntity(entity);
  }
}
