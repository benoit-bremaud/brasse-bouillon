import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { StyleGuide } from '../domain/enums/style-guide.enum';
import { StyleOrmEntity } from '../entities/style.orm.entity';
import { StyleType } from '../domain/enums/style-type.enum';

/**
 * Optional filters accepted by the list endpoint. All filters are
 * AND-combined; absence of a filter means "any value". `style_guide`
 * is typed as the closed `StyleGuide` enum so callers cannot pass
 * arbitrary strings — typos are rejected at the controller layer
 * via ParseEnumPipe.
 */
export interface ListStylesFilters {
  type?: StyleType;
  style_guide?: StyleGuide;
}

@Injectable()
export class StyleCatalogService {
  constructor(
    @InjectRepository(StyleOrmEntity)
    private readonly styles: Repository<StyleOrmEntity>,
  ) {}

  /**
   * Returns the catalogue ordered by BJCP `category_number` then
   * `style_letter` (the canonical BJCP order — same way the
   * official guidelines are read). The catalogue is small (~20
   * rows on day one) so no pagination is offered yet — added when
   * the catalogue grows past ~100 entries.
   */
  async list(filters: ListStylesFilters = {}): Promise<StyleOrmEntity[]> {
    const where: FindOptionsWhere<StyleOrmEntity> = {};
    if (filters.type) where.type = filters.type;
    if (filters.style_guide) where.style_guide = filters.style_guide;

    return this.styles.find({
      where,
      order: { category_number: 'ASC', style_letter: 'ASC' },
    });
  }

  /**
   * Returns a single catalogue entry by its UUID, or throws 404.
   * Strict UUID match — no name lookup here, since the same display
   * name can refer to entries from different style guides ("Pale
   * Ale" in BJCP 1999 vs BJCP 2021 has different ranges).
   */
  async getById(id: string): Promise<StyleOrmEntity> {
    const entity = await this.styles.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Style catalogue entry ${id} not found`);
    }
    return entity;
  }
}
