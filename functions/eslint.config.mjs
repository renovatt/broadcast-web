import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['lib'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: { globals: globals.node },
    rules: {
      // Paradigma funcional: sem classes.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ClassDeclaration',
          message: 'Use funções, não classes (paradigma funcional).',
        },
        { selector: 'ClassExpression', message: 'Use funções, não classes (paradigma funcional).' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
