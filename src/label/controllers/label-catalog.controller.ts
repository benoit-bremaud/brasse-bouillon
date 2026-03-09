import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Controller } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Labels')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('labels/catalog')
export class LabelCatalogController {}
