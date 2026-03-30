import { ApiProperty } from '@nestjs/swagger';
import { ScanImageFace } from '../domain/enums/scan-image-face.enum';
import { ScanLabelImageOrmEntity } from '../entities/scan-label-image.orm.entity';

export class ScanLabelImageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  scan_request_id: string;

  @ApiProperty({ enum: ScanImageFace })
  face: ScanImageFace;

  @ApiProperty()
  file_path: string;

  @ApiProperty()
  mime_type: string;

  @ApiProperty()
  size_bytes: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(entity: ScanLabelImageOrmEntity): ScanLabelImageDto {
    return {
      id: entity.id,
      scan_request_id: entity.scan_request_id,
      face: entity.face,
      file_path: entity.file_path,
      mime_type: entity.mime_type,
      size_bytes: entity.size_bytes,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
