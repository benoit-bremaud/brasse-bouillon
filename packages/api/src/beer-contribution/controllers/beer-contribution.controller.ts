import {
  Controller,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotImplementedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CreateBeerContributionDto } from '../dtos/create-beer-contribution.dto';

/**
 * Beer contribution controller — **501 stub** (Epic #693 part 4/5).
 *
 * The community contribution flow lands in v0.2+ (per Scan brainstorm
 * §D and ADR-0001 clause 3). Until then, both endpoints are exposed
 * with their final shape and return `501 Not Implemented`, so
 * frontend code can be written and tested against the contract
 * without waiting for the implementation.
 *
 * The two endpoints anticipated by Epic #693 §4:
 *
 * - `POST /beer-contributions` — a logged-in user submits a new beer
 *   to the catalog (community provenance).
 * - `POST /beer-contributions/:id/approve` — an admin approves a
 *   pending contribution and writes it into `scan_catalog_items`.
 */
@ApiTags('Beer Contribution')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('beer-contributions')
export class BeerContributionController {
  @Post()
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({
    summary:
      'Submit a new beer contribution (501 stub — implementation in v0.2+)',
    description:
      'Stub endpoint that anticipates the v0.2+ community contribution flow. Returns 501 Not Implemented per ADR-0001 clause 3.',
  })
  @ApiBody({ type: CreateBeerContributionDto })
  @ApiNotImplementedResponse({
    description: 'Community contribution is not implemented in v0.1.',
  })
  submitContribution(): never {
    // Body intentionally not consumed — the stub throws before any
    // input handling. The full validation pipeline lands when the
    // service is implemented in v0.2+. The shape stays advertised on
    // OpenAPI via @ApiBody so frontend integrations can be written
    // against the future contract.
    throw new NotImplementedException(
      'Community beer contribution lands in v0.2+. See Epic #693 part 4/5 and the scan brainstorm §D.',
    );
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({
    summary:
      'Approve a pending beer contribution (501 stub — moderation in v0.2+)',
    description:
      'Stub endpoint that anticipates the v0.2+ admin moderation flow. Returns 501 Not Implemented per ADR-0001 clause 3.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the beer contribution to approve.',
    type: 'string',
  })
  @ApiNotImplementedResponse({
    description: 'Beer contribution moderation is not implemented in v0.1.',
  })
  approveContribution(): never {
    // :id intentionally not consumed in the stub for the same reason
    // as submitContribution above. ParseUUIDPipe + role guards land in
    // v0.2+ alongside the real implementation.
    throw new NotImplementedException(
      'Beer contribution moderation lands in v0.2+. See Epic #693 part 4/5 and the scan brainstorm §D.',
    );
  }
}
