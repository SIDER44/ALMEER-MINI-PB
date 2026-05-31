import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_DIR  = path.resolve(__dirname);
const DIST_DIR = path.resolve(__dirname, 'dist');

const COPY_AS_IS = [
  'node_modules', 'dist', 'auth_info', '.env',
  'package.json', 'package-lock.json', 'railway.json',
  '.gitignore', '.env.example', 'README.md',
];

const OBFUSCATOR_OPTIONS = [
  '--compact true',
  '--control-flow-flattening true',
  '--control-flow-flattening-threshold 0.75',
  '--dead-code-injection true',
  '--dead-code-injection-threshold 0.4',
  '--identifier-names-generator hexadecimal',
  '--rename-globals false',
  '--self-defending true',
  '--string-array true',
  '--string-array-encoding rc4',
  '--string-array-threshold 0.75',
  '--unicode-escape-sequence false',
  '--target node',
].join(' ');

function walkJS(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (COPY_AS_IS.includes(entry.name)) continue;
    if (entry.isDirectory()) out.push(...walkJS(full));
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full);
  }
  return out;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true });
ensureDir(DIST_DIR);

const COPY_ITEMS = [
  'package.json', 'package-lock.json', 'railway.json',
  '.gitignore', '.env.example', 'public', 'LICENSE',
];

for (const item of COPY_ITEMS) {
  const src = path.join(SRC_DIR, item);
  const dest = path.join(DIST_DIR, item);
  if (!fs.existsSync(src)) continue;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) copyDir(src, dest);
  else { ensureDir(path.dirname(dest)); fs.copyFileSync(src, dest); }
}

const jsFiles = walkJS(SRC_DIR);
let obfCount = 0;

for (const file of jsFiles) {
  const rel  = path.relative(SRC_DIR, file);
  const dest = path.join(DIST_DIR, rel);
  ensureDir(path.dirname(dest));

  try {
    execSync(
      `javascript-obfuscator "${file}" --output "${dest}" ${OBFUSCATOR_OPTIONS}`,
      { stdio: 'pipe' }
    );
    console.log(`✔  obfuscated  ${rel}`);
    obfCount++;
  } catch (e) {
    fs.copyFileSync(file, dest);
    console.warn(`⚠  copy-only   ${rel}  (obfuscator failed): ${e.message}`);
  }
}

console.log(`\n✅  Build complete → ${DIST_DIR}`);
console.log(`   Obfuscated: ${obfCount} / ${jsFiles.length} JS files`);
