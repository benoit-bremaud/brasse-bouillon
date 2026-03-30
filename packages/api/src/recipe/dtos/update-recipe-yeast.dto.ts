import { CreateRecipeYeastDto } from './create-recipe-yeast.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRecipeYeastDto extends PartialType(CreateRecipeYeastDto) {}
