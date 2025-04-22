// eslint.config.js
import js from '@eslint/js';
import node from 'eslint-plugin-node';

export default [
  js.configs.recommended,
  {
    plugins: { node },
    rules: {
      'no-unused-vars': ['warn'],
      'no-console': 'off'
    },
  },
];
