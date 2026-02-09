import { render, screen } from '@testing-library/react-native';

import { RecipeDetailsScreen } from '@/features/recipes/presentation/RecipeDetailsScreen';
import React from 'react';

jest.mock('@/features/recipes/application/recipes.use-cases', () => ({
  getRecipeDetails: jest.fn().mockResolvedValue({
    id: 'r1',
    name: 'Test Recipe',
    description: 'Test description',
  }),
  listRecipeSteps: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/features/batches/application/batches.use-cases', () => ({
  startBatch: jest.fn().mockResolvedValue({ id: 'b1' }),
}));

describe('RecipeDetailsScreen', () => {
  it('renders recipe details', async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText('Test Recipe')).toBeTruthy();
    expect(screen.getByText('Start batch')).toBeTruthy();
    expect(screen.getByText('Steps')).toBeTruthy();
  });
});
