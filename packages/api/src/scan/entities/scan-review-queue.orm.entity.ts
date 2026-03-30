import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScanReviewStatus } from '../domain/enums/scan-review-status.enum';

@Entity('scan_review_queue')
@Index('UQ_scan_review_queue_scan_request_id', ['scan_request_id'], {
  unique: true,
})
@Index('IDX_scan_review_queue_status_created_at', ['status', 'created_at'])
export class ScanReviewQueueOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  scan_request_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ScanReviewStatus,
    nullable: false,
    default: ScanReviewStatus.PENDING,
  })
  status: ScanReviewStatus;

  @Column({ type: 'text', nullable: true })
  internal_note?: string | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  reviewed_by?: string | null;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
