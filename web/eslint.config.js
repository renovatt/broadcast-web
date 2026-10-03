import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import checkFile from 'eslint-plugin-check-file';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

// kebab-case, com "_" inicial opcional (ex.: _components), ou __tests__.
const FOLDER_NAME = '@(__tests__|?(_)+([a-z0-9])*(-+([a-z0-9])))';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'check-file': checkFile,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
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

      // Estrutura de pastas e nomes de arquivos.
      'check-file/filename-naming-convention': [
        'error',
        { '**/*.{ts,tsx}': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
      'check-file/folder-naming-convention': ['error', { 'src/**/': FOLDER_NAME }],
      'check-file/filename-blocklist': [
        'error',
        {
          // shared/ é para funções e hooks; componentes ficam em src/components ou _components.
          'src/shared/**/*.tsx': 'src/components/*.tsx',
          // Nada solto na raiz de uma feature: usar _components, hooks, api, schemas, types, utils...
          'src/features/*/*.{ts,tsx}': 'src/features/*/<pasta>/*.{ts,tsx}',
        },
      ],
    },
  },
);
