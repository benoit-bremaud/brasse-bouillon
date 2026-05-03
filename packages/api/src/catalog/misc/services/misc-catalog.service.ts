import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { MiscTemplateOrmEntity } from '../entities/misc-template.orm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MiscCatalogService {
  constructor(
    @InjectRepository(MiscTemplateOrmEntity)
    private readonly templates: Repository<MiscTemplateOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name. The
   * catalogue is small (~10 rows) so no pagination or filtering
   * is offered yet — added when the catalogue grows past ~100
   * entries or when the picker UI needs server-side type/use_at
   * facets.
   */
  async list(): Promise<MiscTemplateOrmEntity[]> {
    return this.templates.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, matching the
   * convention used by every other catalogue service
   * (Hop / Yeast / Style / Fermentable / Mash / Water /
   * Equipment). Name lookups are intentionally not exposed: the
   * picker UI carries the UUID once the user selects an entry,
   * and adding a non-UUID-validated lookup path would broaden
   * the API surface for no current use case. (Note: the table
   * enforces UNIQUE(name) so a future name-lookup endpoint
   * would still return at most one row.)
   */
  async getById(id: string): Promise<MiscTemplateOrmEntity> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Misc template catalogue entry ${id} not found`,
      );
    }
    return entity;
  }
}
