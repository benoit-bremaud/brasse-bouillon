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

import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';
import { WaterCatalogService } from '../services/water-catalog.service';
import { WaterDto } from '../dtos/water.dto';

/**
 * Read-only HTTP surface for the brewing water catalogue. Two endpoints:
 *   GET /catalog/waters         → list all
 *   GET /catalog/waters/:id     → fetch one by UUID
 *
 * No filters in this PR — the catalogue is small (~10 rows) and
 * the picker UX scrolls the full list. Add pagination / search
 * once the catalogue grows past ~100 entries.
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data.
 */
@ApiTags('Catalog · Waters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/waters')
export class WaterCatalogController {
  constructor(private readonly service: WaterCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the water profile catalogue entries' })
  @ApiOkResponse({ type: WaterDto, isArray: true })
  async list(): Promise<WaterDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => WaterDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single water profile by UUID' })
  @ApiOkResponse({ type: WaterDto })
  @ApiNotFoundResponse({ description: 'Water profile not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<WaterDto> {
    const entity = await this.service.getById(id);
    return WaterDto.fromEntity(entity);
  }
}
