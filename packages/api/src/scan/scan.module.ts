import { Module } from '@nestjs/common';
import { ScanAdminReviewController } from './controllers/scan-admin-review.controller';
import { ScanCatalogItemOrmEntity } from './entities/scan-catalog-item.orm.entity';
import { ScanController } from './controllers/scan.controller';
import { ScanLabelImageOrmEntity } from './entities/scan-label-image.orm.entity';
import { ScanRequestOrmEntity } from './entities/scan-request.orm.entity';
import { ScanReviewQueueOrmEntity } from './entities/scan-review-queue.orm.entity';
import { ScanService } from './services/scan.service';
import { ScanStorageService } from './services/scan-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ScanRequestOrmEntity,
      ScanCatalogItemOrmEntity,
      ScanLabelImageOrmEntity,
      ScanReviewQueueOrmEntity,
    ]),
  ],
  controllers: [ScanController, ScanAdminReviewController],
  providers: [ScanService, ScanStorageService],
  exports: [ScanService],
})
export class ScanModule {}
