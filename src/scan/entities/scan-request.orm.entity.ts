import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScanRequestStatus } from '../domain/enums/scan-request-status.enum';

@Entity('scan_requests')
@Index('IDX_scan_requests_owner_created_at', ['owner_id', 'created_at'])
@Index('IDX_scan_requests_owner_status', ['owner_id', 'status'])
@Index('IDX_scan_requests_barcode', ['barcode'])
@Index(
  'UQ_scan_requests_owner_idempotency_key',
  ['owner_id', 'idempotency_key'],
  {
    unique: true,
  },
)
export class ScanRequestOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  owner_id: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  barcode: string;

  @Column({
    type: 'varchar',
    length: 32,
    enum: ScanRequestStatus,
    nullable: false,
  })
  status: ScanRequestStatus;

  @Column({ type: 'varchar', length: 128, nullable: false })
  idempotency_key: string;

  @Column({ type: 'text', nullable: false })
  idempotency_response: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  consent_ai_training: boolean;

  @Column({ type: 'datetime', nullable: false })
  retention_until: Date;

  @Column({ type: 'varchar', length: 36, nullable: true })
  catalog_item_id?: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
