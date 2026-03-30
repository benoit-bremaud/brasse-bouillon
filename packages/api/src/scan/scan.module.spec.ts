import { ScanCatalogItemOrmEntity } from './entities/scan-catalog-item.orm.entity';
import { ScanLabelImageOrmEntity } from './entities/scan-label-image.orm.entity';
import { ScanModule } from './scan.module';
import { ScanRequestOrmEntity } from './entities/scan-request.orm.entity';
import { ScanReviewQueueOrmEntity } from './entities/scan-review-queue.orm.entity';
import { ScanService } from './services/scan.service';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

describe('ScanModule', () => {
  it('should expose ScanService with in-memory sqlite', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            User,
            ScanRequestOrmEntity,
            ScanCatalogItemOrmEntity,
            ScanLabelImageOrmEntity,
            ScanReviewQueueOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        ScanModule,
      ],
    }).compile();

    const scanService = moduleRef.get(ScanService);

    expect(scanService).toBeInstanceOf(ScanService);
  });
});
