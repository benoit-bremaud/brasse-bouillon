import { Injectable, NotFoundException } from '@nestjs/common';

import { EquipmentTemplateOrmEntity } from '../entities/equipment-template.orm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EquipmentCatalogService {
  constructor(
    @InjectRepository(EquipmentTemplateOrmEntity)
    private readonly templates: Repository<EquipmentTemplateOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name. The
   * catalogue is small (~10 rows) so no pagination or filtering
   * is offered yet — added when the catalogue grows past ~100
   * entries.
   */
  async list(): Promise<EquipmentTemplateOrmEntity[]> {
    return this.templates.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, matching the
   * convention used by every other catalogue service
   * (Hop / Yeast / Style / Fermentable / Mash / Water). Name
   * lookups are intentionally not exposed: the picker UI carries
   * the UUID once the user selects an entry, and adding a
   * non-UUID-validated lookup path would broaden the API surface
   * for no current use case. (Note: the table enforces
   * UNIQUE(name) so a future name-lookup endpoint would still
   * return at most one row.)
   */
  async getById(id: string): Promise<EquipmentTemplateOrmEntity> {
    const entity = await this.templates.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Equipment template catalogue entry ${id} not found`,
      );
    }
    return entity;
  }
}
