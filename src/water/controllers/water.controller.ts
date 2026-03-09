import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { User } from '../../user/entities/user.entity';
import { GetWaterProfileQueryDto } from '../dtos/get-water-profile-query.dto';
import { WaterProfileDto } from '../dtos/water-profile.dto';
import { WaterService } from '../services/water.service';

@ApiTags('Water')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('water')
export class WaterController {
  constructor(private readonly waterService: WaterService) {}

  @Get()
  @ApiOperation({
    summary: 'Get aggregated water profile for a city',
  })
  @ApiOkResponse({
    type: WaterProfileDto,
    description: 'Aggregated water profile with minerals and hardness',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
  })
  @ApiNotFoundResponse({
    description: 'No data available for this city/year',
  })
  @ApiBadGatewayResponse({
    description: 'Error while calling external provider',
  })
  async getWaterProfile(
    @CurrentUser() _user: User,
    @Query() query: GetWaterProfileQueryDto,
  ): Promise<WaterProfileDto> {
    const profile = await this.waterService.getWaterProfile({
      codeInsee: query.codeInsee,
      year: query.year,
      provider: query.provider,
    });

    return WaterProfileDto.fromEntity(profile);
  }
}
