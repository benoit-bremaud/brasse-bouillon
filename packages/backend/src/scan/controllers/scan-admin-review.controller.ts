import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../common/enums/role.enum';
import { User } from '../../user/entities/user.entity';
import { AdminMarkScanReviewNotFoundDto } from '../dtos/admin-mark-scan-review-not-found.dto';
import { AdminResolveScanReviewDto } from '../dtos/admin-resolve-scan-review.dto';
import { ScanRequestDto } from '../dtos/scan-request.dto';
import { ScanReviewPendingCountDto } from '../dtos/scan-review-pending-count.dto';
import { ScanService } from '../services/scan.service';

@ApiTags('Scan Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/scan/reviews')
export class ScanAdminReviewController {
  constructor(private readonly scanService: ScanService) {}

  @Get('pending')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'List pending scan reviews requiring manual admin validation',
  })
  @ApiOkResponse({ type: ScanRequestDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role is required' })
  async listPending(): Promise<ScanRequestDto[]> {
    return this.scanService.listPendingReviewForAdmin();
  }

  @Get('pending/count')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get pending scan review count for admin dashboard badges',
  })
  @ApiOkResponse({ type: ScanReviewPendingCountDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role is required' })
  async countPending(): Promise<ScanReviewPendingCountDto> {
    const pending = await this.scanService.countPendingReviewForAdmin();

    return { pending };
  }

  @Patch(':scanId/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Resolve a pending scan review by creating/updating a catalog item match',
  })
  @ApiParam({ name: 'scanId', format: 'uuid' })
  @ApiOkResponse({ type: ScanRequestDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload or review item is not pending',
  })
  @ApiNotFoundResponse({
    description: 'Scan request or review queue not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role is required' })
  async resolve(
    @CurrentUser() user: User,
    @Param('scanId', new ParseUUIDPipe()) scanId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: AdminResolveScanReviewDto,
  ): Promise<ScanRequestDto> {
    return this.scanService.adminResolveReview(user.id, scanId, dto);
  }

  @Patch(':scanId/not-found')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary:
      'Mark a pending scan review as not found when no reliable match exists',
  })
  @ApiParam({ name: 'scanId', format: 'uuid' })
  @ApiOkResponse({ type: ScanRequestDto })
  @ApiBadRequestResponse({ description: 'Review item is not pending' })
  @ApiNotFoundResponse({
    description: 'Scan request or review queue not found',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT token' })
  @ApiForbiddenResponse({ description: 'Admin role is required' })
  async markNotFound(
    @CurrentUser() user: User,
    @Param('scanId', new ParseUUIDPipe()) scanId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: AdminMarkScanReviewNotFoundDto,
  ): Promise<ScanRequestDto> {
    return this.scanService.adminMarkReviewNotFound(user.id, scanId, dto);
  }
}
