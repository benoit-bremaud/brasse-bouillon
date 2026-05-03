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

import { FermentableCatalogService } from '../services/fermentable-catalog.service';
import { FermentableDto } from '../dtos/fermentable.dto';
import { FermentableType } from '../domain/enums/fermentable-type.enum';
import { JwtAuthGuard } from '../../../auth/guards/jwt.guard';

/**
 * Read-only HTTP surface for the fermentable catalogue. Two endpoints:
 *   GET /catalog/fermentables          → list all (optionally filtered)
 *   GET /catalog/fermentables/:id      → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data. An admin
 * CRUD surface is planned for a later iteration once an admin role
 * / interface exists.
 */
@ApiTags('Catalog · Fermentables')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/fermentables')
export class FermentableCatalogController {
  constructor(private readonly service: FermentableCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the fermentable catalogue entries' })
  @ApiQuery({
    name: 'type',
    enum: FermentableType,
    required: false,
    description: 'Filter by fermentable family',
  })
  @ApiOkResponse({ type: FermentableDto, isArray: true })
  async list(
    @Query('type', new ParseEnumPipe(FermentableType, { optional: true }))
    type?: FermentableType,
  ): Promise<FermentableDto[]> {
    const rows = await this.service.list({ type });
    return rows.map((row) => FermentableDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single fermentable catalogue entry by UUID',
  })
  @ApiOkResponse({ type: FermentableDto })
  @ApiNotFoundResponse({ description: 'Fermentable catalogue entry not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<FermentableDto> {
    const entity = await this.service.getById(id);
    return FermentableDto.fromEntity(entity);
  }
}
