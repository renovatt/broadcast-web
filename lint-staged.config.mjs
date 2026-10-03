import { relative, resolve } from 'node:path';

// Roda nos arquivos staged antes de cada commit (via .husky/pre-commit).
// O ESLint roda dentro de cada pacote (npm run executa na pasta do pacote), pois as regras
// de estrutura (check-file) usam caminhos relativos a ele.
const relativeTo = (dir, files) =>
  files.map((file) => `"${relative(resolve(dir), file).replaceAll('\\', '/')}"`).join(' ');

const lintIn = (pkg) => (files) => [
  `npm --prefix ${pkg} run lint:fix -- ${relativeTo(pkg, files)}`,
  `prettier --write ${relativeTo('.', files)}`,
];

export default {
  'web/**/*.{ts,tsx}': lintIn('web'),
  'functions/**/*.ts': lintIn('functions'),
  '*.{js,mjs,json,md,css,html}': 'prettier --write',
  'tests/**/*.ts': 'prettier --write',
};
