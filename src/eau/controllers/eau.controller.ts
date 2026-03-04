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
import { EauService } from '../services/eau.service';

@ApiTags('Eau')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('eau')
export class EauController {
  constructor(private readonly eauService: EauService) {}

  @Get()
  @ApiOperation({
    summary: "Obtenir le profil d'eau agrégé d'une commune",
  })
  @ApiOkResponse({
    type: WaterProfileDto,
    description: "Profil d'eau agrégé avec minéraux et dureté",
  })
  @ApiBadRequestResponse({
    description: 'Paramètres de requête invalides',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT manquant ou invalide',
  })
  @ApiNotFoundResponse({
    description: 'Aucune donnée disponible pour cette commune/année',
  })
  @ApiBadGatewayResponse({
    description: "Erreur lors de l'appel au provider externe",
  })
  async getWaterProfile(
    @CurrentUser() _user: User,
    @Query() query: GetWaterProfileQueryDto,
  ): Promise<WaterProfileDto> {
    const profile = await this.eauService.getWaterProfile({
      codeInsee: query.codeInsee,
      annee: query.annee,
      provider: query.provider,
    });

    return WaterProfileDto.fromEntity(profile);
  }
}
