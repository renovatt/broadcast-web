// Executa um comando com o JDK portátil (.tools/jdk-21) no PATH, se ele existir.
// Uso: node scripts/with-jdk.mjs <comando> [args...]
import { existsSync } from 'node:fs';
import { delimiter, join } from 'node:path';
import { spawn } from 'node:child_process';

const JDK_DIR = join(import.meta.dirname, '..', '.tools', 'jdk-21');

const withJdk = ({ Path, PATH, ...env }) => {
  const systemPath = PATH ?? Path ?? '';
  return existsSync(JDK_DIR)
    ? { ...env, JAVA_HOME: JDK_DIR, PATH: [join(JDK_DIR, 'bin'), systemPath].join(delimiter) }
    : { ...env, PATH: systemPath };
};

const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Uso: node scripts/with-jdk.mjs <comando> [args...]');
  process.exit(1);
}

const child = spawn(args.map(quote).join(' '), {
  stdio: 'inherit',
  shell: true,
  env: withJdk(process.env),
});
child.on('exit', (code) => process.exit(code ?? 1));
