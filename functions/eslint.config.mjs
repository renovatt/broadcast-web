import js from '@eslint/js';
import globals from 'globals';
import checkFile from 'eslint-plugin-check-file';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['lib'] },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: { globals: globals.node },
    plugins: { 'check-file': checkFile },
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

      // Nomes de arquivos e pastas em kebab-case.
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.ts': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': [
        'error',
        { 'src/**/': '@(__tests__|+([a-z0-9])*(-+([a-z0-9])))' },
      ],
    },
  },
);
