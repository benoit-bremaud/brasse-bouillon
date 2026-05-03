import {
  Controller,
  Get,
  Param,
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

import { HopCatalogService } from '../services/hop-catalog.service';
import { HopDto } from '../dtos/hop.dto';
import { HopForm } from '../domain/enums/hop-form.enum';
import { HopUsageType } from '../domain/enums/hop-usage-type.enum';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

/**
 * Read-only HTTP surface for the hop catalogue. Two endpoints:
 *   GET /catalog/hops          → list all (optionally filtered)
 *   GET /catalog/hops/:id      → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data, not user
 * content. An admin CRUD surface is planned for a later iteration
 * once an admin role / interface exists.
 */
@ApiTags('Catalog · Hops')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/hops')
export class HopCatalogController {
  constructor(private readonly service: HopCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the hop catalogue entries' })
  @ApiQuery({
    name: 'usage_type',
    enum: HopUsageType,
    required: false,
    description: 'Filter by aromatic role',
  })
  @ApiQuery({
    name: 'form',
    enum: HopForm,
    required: false,
    description: 'Filter by physical form',
  })
  @ApiOkResponse({ type: HopDto, isArray: true })
  async list(
    @Query('usage_type') usageType?: HopUsageType,
    @Query('form') form?: HopForm,
  ): Promise<HopDto[]> {
    const rows = await this.service.list({ usage_type: usageType, form });
    return rows.map((row) => HopDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hop catalogue entry by UUID' })
  @ApiOkResponse({ type: HopDto })
  @ApiNotFoundResponse({ description: 'Hop catalogue entry not found' })
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HopDto> {
    const entity = await this.service.getById(id);
    return HopDto.fromEntity(entity);
  }
}
