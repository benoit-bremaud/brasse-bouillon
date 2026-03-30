import { BottleFormat } from '../enums/bottle-format.enum';
import { LabelDraftStatus } from '../enums/label-draft-status.enum';
import { LabelEditableFields } from './label-editable-fields.entity';
import { LabelPreviewSnapshot } from './label-preview-snapshot.entity';
import { TemplateId } from '../enums/template-id.enum';

export type LabelDraftId = string;
export type OwnerId = string;
export type BatchId = string;

/**
 * LabelDraft
 *
 * Domain representation of a persisted front-label draft.
 */
export interface LabelDraft {
  readonly id: LabelDraftId;
  readonly ownerId: OwnerId;
  readonly batchId: BatchId;
  readonly status: LabelDraftStatus;
  readonly bottleFormat: BottleFormat;
  readonly templateId: TemplateId;
  readonly editableFields: LabelEditableFields;
  readonly previewSnapshot?: LabelPreviewSnapshot | null;
  readonly version: number;
  readonly deletedAt?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
