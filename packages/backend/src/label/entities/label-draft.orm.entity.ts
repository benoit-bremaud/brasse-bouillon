import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BottleFormat } from '../domain/enums/bottle-format.enum';
import { LabelDraftStatus } from '../domain/enums/label-draft-status.enum';
import type { LabelEditableFields } from '../domain/entities/label-editable-fields.entity';
import type { LabelPreviewSnapshot } from '../domain/entities/label-preview-snapshot.entity';
import { TemplateId } from '../domain/enums/template-id.enum';

@Entity('label_drafts')
@Index('IDX_label_drafts_owner_updated_at', ['owner_id', 'updated_at'])
@Index('IDX_label_drafts_owner_status', ['owner_id', 'status'])
@Index('IDX_label_drafts_batch_id', ['batch_id'])
export class LabelDraftOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  owner_id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  batch_id: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: LabelDraftStatus,
    nullable: false,
    default: LabelDraftStatus.DRAFT,
  })
  status: LabelDraftStatus;

  @Column({
    type: 'varchar',
    length: 40,
    enum: BottleFormat,
    nullable: false,
  })
  bottle_format: BottleFormat;

  @Column({
    type: 'varchar',
    length: 40,
    enum: TemplateId,
    nullable: false,
  })
  template_id: TemplateId;

  @Column({ type: 'simple-json', nullable: false })
  editable_fields: LabelEditableFields;

  @Column({ type: 'simple-json', nullable: true })
  preview_snapshot?: LabelPreviewSnapshot | null;

  @Column({ type: 'integer', nullable: false, default: 1 })
  version: number;

  @Column({ type: 'datetime', nullable: true })
  deleted_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
