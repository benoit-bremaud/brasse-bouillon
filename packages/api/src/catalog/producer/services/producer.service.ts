import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ProducerOrmEntity } from '../entities/producer.orm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(ProducerOrmEntity)
    private readonly producers: Repository<ProducerOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name. The
   * catalogue is small (~16 rows) so no pagination or filtering
   * is offered yet — added when the catalogue grows past ~100
   * entries or when the picker UI needs server-side type
   * facets.
   */
  async list(): Promise<ProducerOrmEntity[]> {
    return this.producers.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, matching the
   * convention used by every other catalogue service
   * (Hop / Yeast / Style / Fermentable / Mash / Water /
   * Equipment / Misc). Name lookups are intentionally not
   * exposed: the picker UI carries the UUID once the user
   * selects an entry. (Note: the table enforces UNIQUE(name)
   * so a future name-lookup endpoint would still return at
   * most one row.)
   */
  async getById(id: string): Promise<ProducerOrmEntity> {
    const entity = await this.producers.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Producer catalogue entry ${id} not found`);
    }
    return entity;
  }
}
