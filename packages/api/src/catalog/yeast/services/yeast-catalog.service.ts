import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { YeastForm } from '../domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../entities/yeast.orm.entity';
import { YeastType } from '../domain/enums/yeast-type.enum';

/**
 * Optional filters accepted by the list endpoint. All filters are
 * AND-combined; absence of a filter means "any value".
 */
export interface ListYeastsFilters {
  type?: YeastType;
  form?: YeastForm;
}

@Injectable()
export class YeastCatalogService {
  constructor(
    @InjectRepository(YeastOrmEntity)
    private readonly yeasts: Repository<YeastOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered alphabetically by name, optionally
   * filtered by type and / or form. The catalogue is small (~20
   * rows on day one) so no pagination is offered yet — added when
   * the catalogue grows past ~100 entries.
   */
  async list(filters: ListYeastsFilters = {}): Promise<YeastOrmEntity[]> {
    const where: FindOptionsWhere<YeastOrmEntity> = {};
    if (filters.type) where.type = filters.type;
    if (filters.form) where.form = filters.form;

    return this.yeasts.find({
      where,
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, since multiple lab
   * products can have similar display names (e.g. WLP004 Irish
   * Ale vs Wyeast 1084 Irish Ale Yeast).
   */
  async getById(id: string): Promise<YeastOrmEntity> {
    const entity = await this.yeasts.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Yeast catalogue entry ${id} not found`);
    }
    return entity;
  }
}
