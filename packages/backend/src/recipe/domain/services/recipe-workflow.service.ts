import { RecipeStep } from '../entities/recipe-step.entity';
import { RecipeStepType } from '../enums/recipe-step-type.enum';

/**
 * RecipeWorkflowService
 *
 * Pure domain service responsible for providing the canonical
 * brewing workflow for a recipe.
 *
 * The initial MVP uses a fixed sequence of steps:
 * MASH -> BOIL -> WHIRLPOOL -> FERMENTATION -> PACKAGING
 */
export class RecipeWorkflowService {
  /**
   * Returns the default ordered list of steps for a brewing recipe.
   */
  getDefaultWorkflow(): ReadonlyArray<RecipeStep> {
    const steps: RecipeStep[] = [
      {
        order: 0,
        type: RecipeStepType.MASH,
        label: 'Mash',
        description: 'Mash grains to extract fermentable sugars.',
      },
      {
        order: 1,
        type: RecipeStepType.BOIL,
        label: 'Boil',
        description: 'Boil wort and add hops according to schedule.',
      },
      {
        order: 2,
        type: RecipeStepType.WHIRLPOOL,
        label: 'Whirlpool',
        description: 'Whirlpool and cool the wort before fermentation.',
      },
      {
        order: 3,
        type: RecipeStepType.FERMENTATION,
        label: 'Fermentation',
        description: 'Ferment wort with yeast until final gravity is reached.',
      },
      {
        order: 4,
        type: RecipeStepType.PACKAGING,
        label: 'Packaging',
        description: 'Package beer (bottling/kegging) and carbonate.',
      },
    ];

    return steps;
  }
}
