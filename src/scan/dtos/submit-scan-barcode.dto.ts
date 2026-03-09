import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class SubmitScanBarcodeDto {
  @ApiProperty({
    example: '3271234567890',
    description: 'EAN/UPC barcode containing 8 to 14 digits',
  })
  @IsString()
  @Matches(/^\d{8,14}$/)
  barcode: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Explicit user opt-in for using label images in future AI training dataset',
  })
  @IsOptional()
  @IsBoolean()
  consent_ai_training?: boolean;
}
