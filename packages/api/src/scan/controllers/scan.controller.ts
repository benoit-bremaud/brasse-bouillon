import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../user/entities/user.entity';
import { ScanLookupResultDto } from '../dtos/scan-lookup-result.dto';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { SubmitScanBarcodeDto } from '../dtos/submit-scan-barcode.dto';
import type { UploadedImageFile } from '../scan.types';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ScanService } from '../services/scan.service';

@ApiTags('Scan')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('scan')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post('barcode')
  @ApiOperation({
    summary: 'Submit a barcode for scan lookup (idempotent per user/key)',
  })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Idempotency key to avoid duplicate scan creation',
  })
  @ApiCreatedResponse({ type: ScanRequestDto })
  @ApiBadRequestResponse({
    description: 'Missing or invalid barcode / idempotency key',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  async submitBarcode(
    @CurrentUser() user: User,
    @Headers('x-idempotency-key') idempotencyKey: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: SubmitScanBarcodeDto,
  ): Promise<ScanRequestDto> {
    if (!idempotencyKey?.trim()) {
      throw new BadRequestException('X-Idempotency-Key header is required');
    }

    return this.scanService.submitBarcode(user.id, idempotencyKey, dto);
  }

  @Post(':scanId/label-images/:face')
  @ApiOperation({
    summary:
      'Upload a label image for an unknown barcode scan (face: front or back)',
  })
  @ApiParam({ name: 'scanId', format: 'uuid' })
  @ApiParam({ name: 'face', enum: ['front', 'back'] })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @ApiOkResponse({ type: ScanRequestDto })
  @ApiBadRequestResponse({ description: 'Invalid image, face, or scan status' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @UseInterceptors(FileInterceptor('image'))
  async uploadLabelImage(
    @CurrentUser() user: User,
    @Param('scanId', new ParseUUIDPipe()) scanId: string,
    @Param('face') face: string,
    @UploadedFile() image?: UploadedImageFile,
  ): Promise<ScanRequestDto> {
    if (!image) {
      throw new BadRequestException('image file is required');
    }

    return this.scanService.uploadLabelImage(user.id, scanId, face, image);
  }

  @Get()
  @ApiOperation({ summary: 'List current user scan requests' })
  @ApiOkResponse({ type: ScanRequestDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<ScanRequestDto[]> {
    return this.scanService.listMine(user.id);
  }

  @Get(':scanId')
  @ApiOperation({ summary: 'Get one scan request for current user' })
  @ApiParam({ name: 'scanId', format: 'uuid' })
  @ApiOkResponse({ type: ScanRequestDto })
  async getMineById(
    @CurrentUser() user: User,
    @Param('scanId', new ParseUUIDPipe()) scanId: string,
  ): Promise<ScanRequestDto> {
    return this.scanService.getMineById(user.id, scanId);
  }

  @Get('lookup/:ean')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({
    summary:
      'Look up a beer by EAN-13 (cache-first, falls back to OpenFoodFacts)',
    description:
      'Issue #696. Returns the cached scan_catalog row when fresh (seed/manual rows never expire; OFF rows are fresh for 1h). Otherwise hits OpenFoodFacts, persists the response with source = openfoodfacts, and returns the new row. Auth-protected for now; will switch to @Public once #718 lands.',
  })
  @ApiParam({
    name: 'ean',
    description: 'EAN-13 barcode (digits only)',
    example: '5060277380011',
  })
  @ApiOkResponse({ type: ScanLookupResultDto })
  async lookupByBarcode(
    @CurrentUser() _user: User,
    @Param('ean') ean: string,
  ): Promise<ScanLookupResultDto> {
    return this.scanService.lookupByBarcode(ean);
  }
}
