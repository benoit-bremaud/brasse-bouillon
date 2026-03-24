import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScanImageFace } from '../domain/enums/scan-image-face.enum';

@Entity('scan_label_images')
@Index('IDX_scan_label_images_scan_request_id', ['scan_request_id'])
@Index(
  'UQ_scan_label_images_scan_request_id_face',
  ['scan_request_id', 'face'],
  {
    unique: true,
  },
)
export class ScanLabelImageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  scan_request_id: string;

  @Column({
    type: 'varchar',
    length: 10,
    enum: ScanImageFace,
    nullable: false,
  })
  face: ScanImageFace;

  @Column({ type: 'varchar', length: 512, nullable: false })
  file_path: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  mime_type: string;

  @Column({ type: 'integer', nullable: false })
  size_bytes: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
