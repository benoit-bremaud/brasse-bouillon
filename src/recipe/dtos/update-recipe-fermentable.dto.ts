import { CreateRecipeFermentableDto } from './create-recipe-fermentable.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRecipeFermentableDto extends PartialType(
  CreateRecipeFermentableDto,
) {}
