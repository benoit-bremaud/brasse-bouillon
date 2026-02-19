import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Patch,
  UseGuards,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

import { RecipeIngredientsService } from '../services/recipe-ingredients.service';
import { CreateRecipeFermentableDto } from '../dtos/create-recipe-fermentable.dto';
import { CreateRecipeHopDto } from '../dtos/create-recipe-hop.dto';
import { CreateRecipeYeastDto } from '../dtos/create-recipe-yeast.dto';
import { CreateRecipeAdditiveDto } from '../dtos/create-recipe-additive.dto';
import { UpsertRecipeWaterDto } from '../dtos/upsert-recipe-water.dto';
import { RecipeFermentableDto } from '../dtos/recipe-fermentable.dto';
import { RecipeHopDto } from '../dtos/recipe-hop.dto';
import { RecipeYeastDto } from '../dtos/recipe-yeast.dto';
import { RecipeAdditiveDto } from '../dtos/recipe-additive.dto';
import { RecipeWaterDto } from '../dtos/recipe-water.dto';
import { UpdateRecipeFermentableDto } from '../dtos/update-recipe-fermentable.dto';
import { UpdateRecipeHopDto } from '../dtos/update-recipe-hop.dto';
import { UpdateRecipeYeastDto } from '../dtos/update-recipe-yeast.dto';
import { UpdateRecipeAdditiveDto } from '../dtos/update-recipe-additive.dto';

/**
 * RecipeIngredientsController
 *
 * Route prefix: /recipes/:recipeId/...
 * Ownership: current user only (owner_id = user.id, enforced by service)
 *
 * Sub-resources:
 *   /fermentables  — grains, extracts, sugars, adjuncts (1:N)
 *   /hops          — hop additions (1:N)
 *   /yeasts        — yeast strains (1:N)
 *   /additives     — spices, finings, acids, etc. (1:N)
 *   /water         — water profile (1:1, upsert via PUT)
 */
@ApiTags('Recipe Ingredients')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('recipes/:recipeId')
export class RecipeIngredientsController {
  constructor(private readonly service: RecipeIngredientsService) {}

  // ─── Fermentables ───────────────────────────────────────────────────────────

  @Get('fermentables')
  @ApiOperation({ summary: 'List fermentables for a recipe' })
  @ApiOkResponse({ type: RecipeFermentableDto, isArray: true })
  async listFermentables(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<RecipeFermentableDto[]> {
    const rows = await this.service.listFermentables(user.id, recipeId);
    return rows.map((r) => RecipeFermentableDto.fromEntity(r));
  }

  @Post('fermentables')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a fermentable to a recipe' })
  @ApiCreatedResponse({ type: RecipeFermentableDto })
  async addFermentable(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateRecipeFermentableDto,
  ): Promise<RecipeFermentableDto> {
    const saved = await this.service.addFermentable(user.id, recipeId, dto);
    return RecipeFermentableDto.fromEntity(saved);
  }

  @Patch('fermentables/:fermentableId')
  @ApiOperation({ summary: 'Update a fermentable' })
  @ApiOkResponse({ type: RecipeFermentableDto })
  @ApiNotFoundResponse({ description: 'Fermentable not found' })
  async updateFermentable(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('fermentableId', new ParseUUIDPipe()) fermentableId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeFermentableDto,
  ): Promise<RecipeFermentableDto> {
    const saved = await this.service.updateFermentable(
      user.id,
      recipeId,
      fermentableId,
      dto,
    );
    return RecipeFermentableDto.fromEntity(saved);
  }

  @Delete('fermentables/:fermentableId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a fermentable from a recipe' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Fermentable not found' })
  async removeFermentable(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('fermentableId', new ParseUUIDPipe()) fermentableId: string,
  ): Promise<{ deleted: true }> {
    return this.service.removeFermentable(user.id, recipeId, fermentableId);
  }

  // ─── Hops ───────────────────────────────────────────────────────────────────

  @Get('hops')
  @ApiOperation({ summary: 'List hops for a recipe' })
  @ApiOkResponse({ type: RecipeHopDto, isArray: true })
  async listHops(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<RecipeHopDto[]> {
    const rows = await this.service.listHops(user.id, recipeId);
    return rows.map((r) => RecipeHopDto.fromEntity(r));
  }

  @Post('hops')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a hop to a recipe' })
  @ApiCreatedResponse({ type: RecipeHopDto })
  async addHop(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateRecipeHopDto,
  ): Promise<RecipeHopDto> {
    const saved = await this.service.addHop(user.id, recipeId, dto);
    return RecipeHopDto.fromEntity(saved);
  }

  @Patch('hops/:hopId')
  @ApiOperation({ summary: 'Update a hop addition' })
  @ApiOkResponse({ type: RecipeHopDto })
  @ApiNotFoundResponse({ description: 'Hop not found' })
  async updateHop(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('hopId', new ParseUUIDPipe()) hopId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeHopDto,
  ): Promise<RecipeHopDto> {
    const saved = await this.service.updateHop(user.id, recipeId, hopId, dto);
    return RecipeHopDto.fromEntity(saved);
  }

  @Delete('hops/:hopId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a hop from a recipe' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Hop not found' })
  async removeHop(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('hopId', new ParseUUIDPipe()) hopId: string,
  ): Promise<{ deleted: true }> {
    return this.service.removeHop(user.id, recipeId, hopId);
  }

  // ─── Yeasts ─────────────────────────────────────────────────────────────────

  @Get('yeasts')
  @ApiOperation({ summary: 'List yeasts for a recipe' })
  @ApiOkResponse({ type: RecipeYeastDto, isArray: true })
  async listYeasts(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<RecipeYeastDto[]> {
    const rows = await this.service.listYeasts(user.id, recipeId);
    return rows.map((r) => RecipeYeastDto.fromEntity(r));
  }

  @Post('yeasts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a yeast to a recipe' })
  @ApiCreatedResponse({ type: RecipeYeastDto })
  async addYeast(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateRecipeYeastDto,
  ): Promise<RecipeYeastDto> {
    const saved = await this.service.addYeast(user.id, recipeId, dto);
    return RecipeYeastDto.fromEntity(saved);
  }

  @Patch('yeasts/:yeastId')
  @ApiOperation({ summary: 'Update a yeast' })
  @ApiOkResponse({ type: RecipeYeastDto })
  @ApiNotFoundResponse({ description: 'Yeast not found' })
  async updateYeast(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('yeastId', new ParseUUIDPipe()) yeastId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeYeastDto,
  ): Promise<RecipeYeastDto> {
    const saved = await this.service.updateYeast(
      user.id,
      recipeId,
      yeastId,
      dto,
    );
    return RecipeYeastDto.fromEntity(saved);
  }

  @Delete('yeasts/:yeastId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a yeast from a recipe' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Yeast not found' })
  async removeYeast(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('yeastId', new ParseUUIDPipe()) yeastId: string,
  ): Promise<{ deleted: true }> {
    return this.service.removeYeast(user.id, recipeId, yeastId);
  }

  // ─── Additives ──────────────────────────────────────────────────────────────

  @Get('additives')
  @ApiOperation({ summary: 'List additives for a recipe' })
  @ApiOkResponse({ type: RecipeAdditiveDto, isArray: true })
  async listAdditives(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<RecipeAdditiveDto[]> {
    const rows = await this.service.listAdditives(user.id, recipeId);
    return rows.map((r) => RecipeAdditiveDto.fromEntity(r));
  }

  @Post('additives')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an additive to a recipe' })
  @ApiCreatedResponse({ type: RecipeAdditiveDto })
  async addAdditive(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateRecipeAdditiveDto,
  ): Promise<RecipeAdditiveDto> {
    const saved = await this.service.addAdditive(user.id, recipeId, dto);
    return RecipeAdditiveDto.fromEntity(saved);
  }

  @Patch('additives/:additiveId')
  @ApiOperation({ summary: 'Update an additive' })
  @ApiOkResponse({ type: RecipeAdditiveDto })
  @ApiNotFoundResponse({ description: 'Additive not found' })
  async updateAdditive(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('additiveId', new ParseUUIDPipe()) additiveId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeAdditiveDto,
  ): Promise<RecipeAdditiveDto> {
    const saved = await this.service.updateAdditive(
      user.id,
      recipeId,
      additiveId,
      dto,
    );
    return RecipeAdditiveDto.fromEntity(saved);
  }

  @Delete('additives/:additiveId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an additive from a recipe' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNotFoundResponse({ description: 'Additive not found' })
  async removeAdditive(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Param('additiveId', new ParseUUIDPipe()) additiveId: string,
  ): Promise<{ deleted: true }> {
    return this.service.removeAdditive(user.id, recipeId, additiveId);
  }

  // ─── Water Profile (1:1) ────────────────────────────────────────────────────

  @Get('water')
  @ApiOperation({ summary: 'Get the water profile for a recipe' })
  @ApiOkResponse({ type: RecipeWaterDto })
  @ApiNotFoundResponse({ description: 'Water profile not found' })
  async getWater(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<RecipeWaterDto> {
    const entity = await this.service.getWater(user.id, recipeId);
    if (!entity) throw new NotFoundException('Water profile not found');
    return RecipeWaterDto.fromEntity(entity);
  }

  @Put('water')
  @ApiOperation({ summary: 'Upsert the water profile for a recipe' })
  @ApiOkResponse({ type: RecipeWaterDto })
  async upsertWater(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpsertRecipeWaterDto,
  ): Promise<RecipeWaterDto> {
    const saved = await this.service.upsertWater(user.id, recipeId, dto);
    return RecipeWaterDto.fromEntity(saved);
  }

  @Delete('water')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove the water profile from a recipe' })
  @ApiOkResponse({ description: 'Deleted' })
  @ApiNoContentResponse({ description: 'Water profile not found' })
  async removeWater(
    @CurrentUser() user: User,
    @Param('recipeId', new ParseUUIDPipe()) recipeId: string,
  ): Promise<{ deleted: true }> {
    return this.service.removeWater(user.id, recipeId);
  }
}
