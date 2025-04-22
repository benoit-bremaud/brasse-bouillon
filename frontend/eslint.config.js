import globals from 'globals';
// eslint.config.js
import js from '@eslint/js';
import react from 'eslint-plugin-react/configs/recommended.js';
import reactNative from 'eslint-plugin-react-native';

export default [
  js.configs.recommended,
  react,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // pas nécessaire avec React 17+
      'no-console': 'warn',
      'react-native/no-inline-styles': 'warn',
    },
  },
];
