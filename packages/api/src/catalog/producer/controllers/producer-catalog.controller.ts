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
import { ProducerCatalogService } from '../services/producer-catalog.service';
import { ProducerDto } from '../dtos/producer.dto';

/**
 * Read-only HTTP surface for the producer catalogue.
 * Two endpoints:
 *   GET /catalog/producers          → list all
 *   GET /catalog/producers/:id      → fetch one by UUID
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally
 * absent — the catalogue is operator-curated reference data,
 * not user-managed content. Catalogue ingredients reference a
 * producer by UUID through `producer_id` FK columns.
 */
@ApiTags('Catalog · Producers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/producers')
export class ProducerCatalogController {
  constructor(private readonly service: ProducerCatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List the producer catalogue entries' })
  @ApiOkResponse({ type: ProducerDto, isArray: true })
  async list(): Promise<ProducerDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => ProducerDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single producer by UUID' })
  @ApiOkResponse({ type: ProducerDto })
  @ApiNotFoundResponse({
    description: 'Producer catalogue entry not found',
  })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ProducerDto> {
    const entity = await this.service.getById(id);
    return ProducerDto.fromEntity(entity);
  }
}
