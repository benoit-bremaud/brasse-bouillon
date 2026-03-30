/**
 * LabelEditableFields
 *
 * User-editable front-label fields persisted in label drafts.
 */
export interface LabelEditableFields {
  readonly name: string | null;
  readonly subtitle: string | null;
  readonly paletteId: string | null;
  readonly iconId: string | null;
}
