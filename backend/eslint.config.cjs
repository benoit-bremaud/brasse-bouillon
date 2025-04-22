// backend/eslint.config.cjs
const js = require('@eslint/js');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    }
  }
];
