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
   * Strict UUID match — no name lookup here, since variants of
   * the same hardware (e.g. "Grainfather G30 v3" vs "Grainfather
   * G30 v4") may share the same display name across revisions.
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
