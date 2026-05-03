import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaterOrmEntity } from '../entities/water.orm.entity';

@Injectable()
export class WaterCatalogService {
  constructor(
    @InjectRepository(WaterOrmEntity)
    private readonly waters: Repository<WaterOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name. The
   * catalogue is small (~10 rows on day one) so no pagination
   * or filtering is offered yet — added when the catalogue grows
   * past ~100 entries.
   */
  async list(): Promise<WaterOrmEntity[]> {
    return this.waters.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, since the same
   * historical city name can refer to entries from different
   * source datasets ("Burton on Trent, UK" verbatim from BeerXML
   * vs a hypothetical "Burton on Trent, modern reading").
   */
  async getById(id: string): Promise<WaterOrmEntity> {
    const entity = await this.waters.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Water profile ${id} not found`);
    }
    return entity;
  }
}
