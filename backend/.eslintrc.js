module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
    ],
    parserOptions: {
      ecmaVersion: 12, // ou 2021
      sourceType: 'module',
    },
    rules: {
      // Autorise les variables non utilisées en dev (utile pour placeholders)
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  
      // Tu peux ajouter d'autres règles personnalisées ici
    },
  };
  