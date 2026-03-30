import { CreateRecipeAdditiveDto } from './create-recipe-additive.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRecipeAdditiveDto extends PartialType(
  CreateRecipeAdditiveDto,
) {}
