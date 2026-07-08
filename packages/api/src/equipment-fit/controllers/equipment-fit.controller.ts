import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
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
import { CapacityFitDto } from '../dtos/capacity-fit.dto';
import { GetEquipmentFitQueryDto } from '../dtos/get-equipment-fit-query.dto';
import { EquipmentFitService } from '../services/equipment-fit.service';

@ApiTags('Equipment fit')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('recipes/:id/equipment-fit')
export class EquipmentFitController {
  constructor(private readonly equipmentFitService: EquipmentFitService) {}

  @Get()
  @ApiOperation({
    summary: 'Advisory capacity fit-check of a recipe against my equipment',
  })
  @ApiOkResponse({ type: CapacityFitDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNotFoundResponse({
    description: 'Recipe not readable, or the given profileId is not mine',
  })
  async getEquipmentFit(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) recipeId: string,
    @Query() query: GetEquipmentFitQueryDto,
  ): Promise<CapacityFitDto> {
    const fit = await this.equipmentFitService.getFit(
      user.id,
      recipeId,
      query.profileId,
    );
    return CapacityFitDto.fromDomain(fit);
  }
}
