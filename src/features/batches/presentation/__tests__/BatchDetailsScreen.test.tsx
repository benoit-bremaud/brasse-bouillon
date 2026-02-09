import { render, screen } from '@testing-library/react-native';

import { BatchDetailsScreen } from '@/features/batches/presentation/BatchDetailsScreen';

jest.mock('@/features/batches/application/batches.use-cases', () => ({
  getBatchDetails: jest.fn().mockResolvedValue({
    id: 'b1',
    status: 'in_progress',
    currentStepOrder: 0,
    steps: [],
  }),
  completeCurrentBatchStep: jest.fn().mockResolvedValue({
    id: 'b1',
    status: 'completed',
    currentStepOrder: 0,
    steps: [],
  }),
}));

describe('BatchDetailsScreen', () => {
  it('renders batch details', async () => {
    render(<BatchDetailsScreen batchId="b1" />);

    expect(await screen.findByText('Batch b1')).toBeTruthy();
    expect(screen.getByText('Steps')).toBeTruthy();
    expect(screen.getByText('Complete current step')).toBeTruthy();
  });
});
