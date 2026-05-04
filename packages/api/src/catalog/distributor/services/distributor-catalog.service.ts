import { Injectable, NotFoundException } from '@nestjs/common';

import { DistributorOrmEntity } from '../entities/distributor.orm.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DistributorCatalogService {
  constructor(
    @InjectRepository(DistributorOrmEntity)
    private readonly distributors: Repository<DistributorOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name. The
   * catalogue is small (~12 rows initially) so no pagination
   * or filtering is offered yet — added when the catalogue
   * grows past ~100 entries or when the boutique UI needs
   * server-side country / ships_to facets.
   */
  async list(): Promise<DistributorOrmEntity[]> {
    return this.distributors.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, matching the
   * convention used by every other catalogue service
   * (Hop / Yeast / Style / Fermentable / Mash / Water /
   * Equipment / Misc / Producer). Name lookups are
   * intentionally not exposed: the picker UI carries the UUID
   * once the user selects an entry, and adding a non-UUID-
   * validated lookup path would broaden the API surface for
   * no current use case.
   */
  async getById(id: string): Promise<DistributorOrmEntity> {
    const entity = await this.distributors.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Distributor catalogue entry ${id} not found`,
      );
    }
    return entity;
  }
}
