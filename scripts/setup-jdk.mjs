// Baixa um JDK 21 portátil (Eclipse Temurin) para .tools/jdk-21.
// Nada é instalado no sistema: os emuladores do Firestore usam este Java via scripts/with-jdk.mjs.
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const TOOLS_DIR = join(import.meta.dirname, '..', '.tools');
const JDK_DIR = join(TOOLS_DIR, 'jdk-21');

const osName = { win32: 'windows', darwin: 'mac', linux: 'linux' }[process.platform];
const arch = { x64: 'x64', arm64: 'aarch64' }[process.arch];
const archiveExt = process.platform === 'win32' ? 'zip' : 'tar.gz';

const downloadArchive = async (url, target) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha no download (${response.status}): ${url}`);
  writeFileSync(target, Buffer.from(await response.arrayBuffer()));
};

// No Windows usa o tar.exe nativo (bsdtar, lê .zip); o tar do Git Bash não entende caminhos "C:\...".
const tarBinary =
  process.platform === 'win32'
    ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
    : 'tar';

const extractArchive = (archive, destination) => {
  mkdirSync(destination, { recursive: true });
  execFileSync(tarBinary, ['-xf', archive, '-C', destination], { stdio: 'inherit' });
};

const main = async () => {
  if (existsSync(JDK_DIR)) {
    console.log(`JDK já presente em ${JDK_DIR}`);
    return;
  }
  if (!osName || !arch)
    throw new Error(`Plataforma não suportada: ${process.platform}/${process.arch}`);

  const url = `https://api.adoptium.net/v3/binary/latest/21/ga/${osName}/${arch}/jdk/hotspot/normal/eclipse`;
  const archive = join(TOOLS_DIR, `jdk-21.${archiveExt}`);
  const staging = join(TOOLS_DIR, 'jdk-staging');

  mkdirSync(TOOLS_DIR, { recursive: true });
  console.log(`Baixando JDK 21 (${osName}/${arch})...`);
  await downloadArchive(url, archive);

  console.log('Extraindo...');
  extractArchive(archive, staging);
  const [extracted] = readdirSync(staging);
  const jdkRoot =
    process.platform === 'darwin'
      ? join(staging, extracted, 'Contents', 'Home')
      : join(staging, extracted);
  renameSync(jdkRoot, JDK_DIR);

  rmSync(staging, { recursive: true, force: true });
  rmSync(archive, { force: true });
  console.log(`JDK 21 pronto em ${JDK_DIR}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
