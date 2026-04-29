import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

import { CreateRecipeDto } from '../dtos/create-recipe.dto';
import { RankedRecipeResponseDto } from '../dtos/ranked-recipe.dto';
import { RecipeIbuEstimateDto } from '../dtos/recipe-ibu-estimate.dto';
import { RecipeDto } from '../dtos/recipe.dto';
import { RecipeStepDto } from '../dtos/recipe-step.dto';
import { UpdateRecipeDto } from '../dtos/update-recipe.dto';
import { UpdateRecipeStepDto } from '../dtos/update-recipe-step.dto';
import { RecipeMatchingService } from '../services/recipe-matching.service';
import { RecipeService } from '../services/recipe.service';

/**
 * RecipeController
 *
 * Route prefix: /recipes
 * Ownership: current user only (owner_id = user.id)
 */
@ApiTags('Recipes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('recipes')
export class RecipeController {
  constructor(
    private readonly service: RecipeService,
    private readonly matching: RecipeMatchingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a recipe (current user)' })
  @ApiCreatedResponse({ type: RecipeDto })
  async create(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: CreateRecipeDto,
  ): Promise<RecipeDto> {
    const saved = await this.service.create(user.id, dto);
    return RecipeDto.fromEntity(saved);
  }

  @Post('import-from-community/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Import a community (PUBLIC or UNLISTED) recipe into my catalog (Issue #601)',
    description:
      'Deep-copies the source recipe and all its satellites (steps, hops, fermentables, yeasts, additives, water) into a new private recipe owned by the current user. The new recipe carries provenance metadata (`imported_from_recipe_id` + a human-readable `import_provenance` string).',
  })
  @ApiCreatedResponse({ type: RecipeDto })
  @ApiNotFoundResponse({ description: 'Source recipe not found' })
  @ApiForbiddenResponse({
    description: 'Source recipe is private and cannot be imported',
  })
  async importFromCommunity(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RecipeDto> {
    const saved = await this.service.importFromCommunity(user.id, id);
    return RecipeDto.fromEntity(saved);
  }

  @Get()
  @ApiOperation({ summary: 'List my recipes' })
  @ApiOkResponse({ type: RecipeDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<RecipeDto[]> {
    const rows = await this.service.listMine(user.id);
    return rows.map((row) => RecipeDto.fromEntity(row));
  }

  @Get('match/:beerId')
  @ApiOperation({
    summary:
      'Rank PUBLIC recipes by match score against a scanned beer (Issue #699)',
    description:
      'Returns the top-N PUBLIC recipes ordered by a similarity (style + ABV + bitterness + color) and quality (avg_rating + brew_count + recency) score. Weights renormalize when a criterion is missing. The official-recipe shortcut wins outright on similarity. The response includes a `low_confidence` flag when the best match scores below 40. `limit` defaults to 3 and is capped at 10.',
  })
  @ApiOkResponse({
    description:
      'Response envelope `{ rankings: [{recipe, score}], low_confidence: boolean }`',
  })
  @ApiNotFoundResponse({ description: 'Beer catalog item not found' })
  async matchForBeer(
    @Param('beerId', new ParseUUIDPipe()) beerId: string,
  ): Promise<RankedRecipeResponseDto> {
    return this.matching.rankForBeer(beerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my recipes by id' })
  @ApiOkResponse({ type: RecipeDto })
  async getMineById(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RecipeDto> {
    const row = await this.service.getMineById(user.id, id);
    return RecipeDto.fromEntity(row);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of my recipes' })
  @ApiOkResponse({ type: RecipeDto })
  async updateMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeDto,
  ): Promise<RecipeDto> {
    const saved = await this.service.updateMine(user.id, id, dto);
    return RecipeDto.fromEntity(saved);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete one of my recipes' })
  @ApiOkResponse({ description: 'Deleted' })
  async deleteMine(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: true }> {
    return this.service.deleteMine(user.id, id);
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'List steps for one of my recipes' })
  @ApiOkResponse({ type: RecipeStepDto, isArray: true })
  async listMineSteps(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RecipeStepDto[]> {
    const rows = await this.service.listMineSteps(user.id, id);
    return rows.map((row) => RecipeStepDto.fromEntity(row));
  }

  @Patch(':id/steps/:order')
  @ApiOperation({ summary: 'Update one step of one of my recipes' })
  @ApiOkResponse({ type: RecipeStepDto })
  async updateMineStep(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('order', ParseIntPipe) order: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    dto: UpdateRecipeStepDto,
  ): Promise<RecipeStepDto> {
    const saved = await this.service.updateMineStep(user.id, id, order, dto);
    return RecipeStepDto.fromEntity(saved);
  }

  @Get(':id/ibu-estimate')
  @ApiOperation({ summary: 'Estimate IBU (Tinseth) for one of my recipes' })
  @ApiOkResponse({ type: RecipeIbuEstimateDto })
  @ApiNotFoundResponse({ description: 'Recipe not found' })
  async estimateMineIbu(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RecipeIbuEstimateDto> {
    return this.service.estimateMineIbu(user.id, id);
  }
}
