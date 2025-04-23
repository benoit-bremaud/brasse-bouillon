/* eslint-disable no-unused-vars */
import Layout from '../app/_layout';
import React from 'react';
/* eslint-enable no-unused-vars */
import { render } from '@testing-library/react-native';

describe('Root layout', () => {
  test('renders without crashing', () => {
    const screen = render(<Layout />);
    expect(screen).toBeTruthy();
  });
});
