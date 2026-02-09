import { render, screen } from '@testing-library/react-native';

import { BatchesScreen } from '@/features/batches/presentation/BatchesScreen';
import React from 'react';

jest.mock('@/features/batches/application/batches.use-cases', () => ({
  listBatches: jest.fn().mockResolvedValue([]),
}));

describe('BatchesScreen', () => {
  it('renders header and empty state', async () => {
    render(<BatchesScreen />);

    expect(screen.getByText('My Batches')).toBeTruthy();
    expect(await screen.findByText('Aucun batch démarré')).toBeTruthy();
  });
});
