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
import { MashCatalogService } from '../services/mash-catalog.service';
import { MashProfileDto } from '../dtos/mash-profile.dto';
import { MashProfileSummaryDto } from '../dtos/mash-profile-summary.dto';

/**
 * Read-only HTTP surface for the mash profile catalogue. Two
 * endpoints with different response shapes:
 *   GET /catalog/mash-profiles         → MashProfileSummaryDto[] (no steps, ~10x lighter)
 *   GET /catalog/mash-profiles/:id     → MashProfileDto (full profile + ordered steps)
 *
 * The list endpoint returns the **summary** DTO (id, name, notes,
 * timestamps only). Fetch the full tree (profile + ordered steps)
 * via `:id` when the user opens the detail view.
 *
 * Write endpoints (POST / PATCH / DELETE) are intentionally absent
 * — the catalogue is operator-curated reference data. An admin
 * CRUD surface is planned for a later iteration once an admin role
 * / interface exists.
 */
@ApiTags('Catalog · Mash profiles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('catalog/mash-profiles')
export class MashCatalogController {
  constructor(private readonly service: MashCatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'List the mash profile catalogue entries (summary, no steps)',
  })
  @ApiOkResponse({ type: MashProfileSummaryDto, isArray: true })
  async list(): Promise<MashProfileSummaryDto[]> {
    const rows = await this.service.list();
    return rows.map((row) => MashProfileSummaryDto.fromEntity(row));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single mash profile with its ordered steps',
  })
  @ApiOkResponse({ type: MashProfileDto })
  @ApiNotFoundResponse({ description: 'Mash profile not found' })
  async getById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MashProfileDto> {
    const entity = await this.service.getById(id);
    return MashProfileDto.fromEntity(entity);
  }
}
