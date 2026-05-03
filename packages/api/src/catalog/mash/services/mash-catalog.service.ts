import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { MashProfileOrmEntity } from '../entities/mash-profile.orm.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MashCatalogService {
  constructor(
    @InjectRepository(MashProfileOrmEntity)
    private readonly profiles: Repository<MashProfileOrmEntity>,
  ) {}

  /**
   * Returns every mash profile ordered alphabetically by name. The
   * steps array is omitted from list responses (lean payload for
   * the picker UI). Callers needing the full tree should use
   * `getById` which eager-loads `steps`.
   */
  async list(): Promise<MashProfileOrmEntity[]> {
    return this.profiles.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Returns a single mash profile with its ordered steps eager-
   * loaded. The steps array is sorted by `step_index` ASC at the
   * DTO layer (see `MashProfileDto.fromEntity`) — TypeORM does not
   * guarantee ordering on a OneToMany relation by default.
   */
  async getById(id: string): Promise<MashProfileOrmEntity> {
    const entity = await this.profiles.findOne({
      where: { id },
      relations: ['steps'],
    });
    if (!entity) {
      throw new NotFoundException(`Mash profile ${id} not found`);
    }
    return entity;
  }
}
