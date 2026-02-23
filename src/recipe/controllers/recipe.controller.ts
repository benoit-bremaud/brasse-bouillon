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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';

import { CreateRecipeDto } from '../dtos/create-recipe.dto';
import { RecipeDto } from '../dtos/recipe.dto';
import { RecipeStepDto } from '../dtos/recipe-step.dto';
import { UpdateRecipeDto } from '../dtos/update-recipe.dto';
import { UpdateRecipeStepDto } from '../dtos/update-recipe-step.dto';
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
  constructor(private readonly service: RecipeService) {}

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

  @Get()
  @ApiOperation({ summary: 'List my recipes' })
  @ApiOkResponse({ type: RecipeDto, isArray: true })
  async listMine(@CurrentUser() user: User): Promise<RecipeDto[]> {
    const rows = await this.service.listMine(user.id);
    return rows.map((row) => RecipeDto.fromEntity(row));
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
}
