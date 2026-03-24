import { RecipeWorkflowService } from './services/recipe-workflow.service';
import { RecipeStepType } from './enums/recipe-step-type.enum';

describe('RecipeWorkflowService', () => {
  let service: RecipeWorkflowService;

  beforeEach(() => {
    service = new RecipeWorkflowService();
  });

  it('should return the standard brewing workflow in the correct order', () => {
    const steps = service.getDefaultWorkflow();

    expect(steps.map((step) => step.type)).toEqual<RecipeStepType[]>([
      RecipeStepType.MASH,
      RecipeStepType.BOIL,
      RecipeStepType.WHIRLPOOL,
      RecipeStepType.FERMENTATION,
      RecipeStepType.PACKAGING,
    ]);

    // Ensure orders are sequential starting at 0
    expect(steps.map((step) => step.order)).toEqual([0, 1, 2, 3, 4]);
  });
});
