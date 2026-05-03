import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { HopForm } from '../domain/enums/hop-form.enum';
import { HopOrmEntity } from '../entities/hop.orm.entity';
import { HopUsageType } from '../domain/enums/hop-usage-type.enum';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Optional filters accepted by the list endpoint. All filters are
 * AND-combined; absence of a filter means "any value".
 */
export interface ListHopsFilters {
  usage_type?: HopUsageType;
  form?: HopForm;
}

@Injectable()
export class HopCatalogService {
  constructor(
    @InjectRepository(HopOrmEntity)
    private readonly hops: Repository<HopOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered by name (alphabetical), optionally
   * filtered by usage_type and / or form. The catalogue is small
   * (~20 rows on day one) so no pagination is offered yet — added
   * when the catalogue grows past ~100 entries.
   */
  async list(filters: ListHopsFilters = {}): Promise<HopOrmEntity[]> {
    const where: FindOptionsWhere<HopOrmEntity> = {};
    if (filters.usage_type) where.usage_type = filters.usage_type;
    if (filters.form) where.form = filters.form;

    return this.hops.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, since the same display
   * name can theoretically refer to distinct varieties (Goldings UK
   * vs Goldings Canada) once the catalogue grows.
   */
  async getById(id: string): Promise<HopOrmEntity> {
    const entity = await this.hops.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Hop catalogue entry ${id} not found`);
    }
    return entity;
  }
}
