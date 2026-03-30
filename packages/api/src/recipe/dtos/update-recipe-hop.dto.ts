import { CreateRecipeHopDto } from './create-recipe-hop.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateRecipeHopDto extends PartialType(CreateRecipeHopDto) {}
