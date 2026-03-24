/* eslint-disable no-unused-vars */
import Hello from '../Hello';
import React from 'react';
import { render } from '@testing-library/react-native';

describe('Hello', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Hello />);
    expect(getByText('Hello, Brasse-Bouillon !')).toBeTruthy();
  });
});
