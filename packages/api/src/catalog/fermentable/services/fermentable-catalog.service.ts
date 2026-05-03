import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { FermentableOrmEntity } from '../entities/fermentable.orm.entity';
import { FermentableType } from '../domain/enums/fermentable-type.enum';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Optional filters accepted by the list endpoint. All filters are
 * AND-combined; absence of a filter means "any value".
 */
export interface ListFermentablesFilters {
  type?: FermentableType;
}

@Injectable()
export class FermentableCatalogService {
  constructor(
    @InjectRepository(FermentableOrmEntity)
    private readonly fermentables: Repository<FermentableOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name, optionally
   * filtered by type. The catalogue is small (~20 rows on day one)
   * so no pagination is offered yet — added when the catalogue
   * grows past ~100 entries.
   */
  async list(
    filters: ListFermentablesFilters = {},
  ): Promise<FermentableOrmEntity[]> {
    const where: FindOptionsWhere<FermentableOrmEntity> = {};
    if (filters.type) where.type = filters.type;

    return this.fermentables.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, since the same display
   * name can theoretically refer to distinct varieties (Crystal 60L
   * UK vs Crystal 60L Belgian) once the catalogue grows.
   */
  async getById(id: string): Promise<FermentableOrmEntity> {
    const entity = await this.fermentables.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(
        `Fermentable catalogue entry ${id} not found`,
      );
    }
    return entity;
  }
}
