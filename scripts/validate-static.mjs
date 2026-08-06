import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const outputDirectory = path.join(process.cwd(), 'dist');
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.push(file);
  }
}

await walk(outputDirectory);

const missing = [];
for (const file of files.filter(candidate => candidate.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) {
    const url = match[1];
    const target = url === '/'
      ? path.join(outputDirectory, 'index.html')
      : url.endsWith('/')
        ? path.join(outputDirectory, url.slice(1), 'index.html')
        : path.join(outputDirectory, url.slice(1));
    if (!existsSync(target)) missing.push(`${path.relative(outputDirectory, file)} → ${url}`);
  }
}

if (missing.length > 0) {
  console.error(`Recursos o rutas faltantes:\n${missing.join('\n')}`);
  process.exit(1);
}

console.log(`Validación correcta: ${files.length} archivos y todas las referencias locales existen.`);
