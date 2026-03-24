import { ScanFermentationType } from '../enums/scan-fermentation-type.enum';

export type ScanCatalogItemId = string;

export interface ScanCatalogItem {
  readonly id: ScanCatalogItemId;
  readonly barcode: string;
  readonly name: string;
  readonly brewery: string;
  readonly style: string;
  readonly abv?: number;
  readonly ibu?: number;
  readonly colorEbc?: number;
  readonly fermentationType: ScanFermentationType;
  readonly aromaticTags?: string;
  readonly notesSource?: string;
  readonly isAbvEstimated: boolean;
  readonly isIbuEstimated: boolean;
  readonly isColorEbcEstimated: boolean;
  readonly isStyleEstimated: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
