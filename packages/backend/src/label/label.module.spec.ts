import { LabelCatalogService } from './services/label-catalog.service';
import { LabelDefaultsService } from './services/label-defaults.service';
import { LabelDraftOrmEntity } from './entities/label-draft.orm.entity';
import { LabelDraftService } from './services/label-draft.service';
import { LabelModule } from './label.module';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('LabelModule', () => {
  it('should expose core label services', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [LabelDraftOrmEntity],
          synchronize: true,
          logging: false,
        }),
        LabelModule,
      ],
    }).compile();

    const draftService = moduleRef.get(LabelDraftService);
    const catalogService = moduleRef.get(LabelCatalogService);
    const defaultsService = moduleRef.get(LabelDefaultsService);

    expect(draftService).toBeInstanceOf(LabelDraftService);
    expect(catalogService).toBeInstanceOf(LabelCatalogService);
    expect(defaultsService).toBeInstanceOf(LabelDefaultsService);
  });
});
