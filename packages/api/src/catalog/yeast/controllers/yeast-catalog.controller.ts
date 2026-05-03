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
import { YeastCatalogService } from '../services/yeast-catalog.service';
import { YeastDto } from '../dtos/yeast.dto';
import { YeastForm } from '../domain/enums/yeast-form.enum';
import { YeastType } from '../domain/enums/yeast-type.enum';

/**
 * Read-only HTTP surface for the yeast catalogue. Two endpoints:
 *   GET /catalog/yeasts          → list all (optionally filtered)
 *   GET /catalog/yeasts/:id      → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data. An admin
 * CRUD surface is planned for a later iteration once an admin role
 * / interface exists.
 */
@ApiTags('Catalog · Yeasts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/yeasts')
export class YeastCatalogController {
  constructor(private readonly service: YeastCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the yeast catalogue entries' })
  @ApiQuery({
    name: 'type',
    enum: YeastType,
    required: false,
    description: 'Filter by yeast category',
  })
  @ApiQuery({
    name: 'form',
    enum: YeastForm,
    required: false,
    description: 'Filter by physical form',
  })
  @ApiOkResponse({ type: YeastDto, isArray: true })
  async list(
    @Query('type', new ParseEnumPipe(YeastType, { optional: true }))
    type?: YeastType,
    @Query('form', new ParseEnumPipe(YeastForm, { optional: true }))
    form?: YeastForm,
  ): Promise<YeastDto[]> {
    const rows = await this.service.list({ type, form });
    return rows.map((row) => YeastDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single yeast catalogue entry by UUID' })
  @ApiOkResponse({ type: YeastDto })
  @ApiNotFoundResponse({ description: 'Yeast catalogue entry not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<YeastDto> {
    const entity = await this.service.getById(id);
    return YeastDto.fromEntity(entity);
  }
}
