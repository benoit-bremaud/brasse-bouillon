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

/**
 * Read-only HTTP surface for the mash profile catalogue. Two
 * endpoints:
 *   GET /catalog/mash-profiles         → list (no steps, lean)
 *   GET /catalog/mash-profiles/:id     → single profile + steps
 *
 * Steps are intentionally omitted from the list response to keep
 * payloads lean for the picker UI. Fetch the full tree (profile +
 * ordered steps) via `:id`.
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
    summary: 'List the mash profile catalogue entries (steps omitted)',
  })
  @ApiOkResponse({ type: MashProfileDto, isArray: true })
  async list(): Promise<MashProfileDto[]> {
    const rows = await this.service.list();
    // Even when steps aren't loaded, MashProfileDto.fromEntity
    // gracefully renders an empty array via `entity.steps ?? []`.
    return rows.map((row) => MashProfileDto.fromEntity(row));
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
