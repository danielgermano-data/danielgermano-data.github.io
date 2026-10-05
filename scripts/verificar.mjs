import { createHash } from 'node:crypto';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pending = ['index.html'];
const inspected = new Set();
const errors = [];
const references = [];
const idsByFile = new Map();
const expectedPdfSha256 = '9b822d3ada1075aab8be05641d41bca6d875d8b10ebab365a72d1d6d1bcc9bae';

for (const script of ['scripts/serve.mjs', 'scripts/verificar.mjs']) {
  const syntax = spawnSync(process.execPath, ['--check', resolve(root, script)], { encoding: 'utf8' });
  if (syntax.status !== 0) errors.push(`${script}: erro de sintaxe JavaScript.\n${syntax.stderr?.trim() || syntax.error?.message || 'Não foi possível executar a verificação.'}`);
}

function localReference(value, source, offset, content) {
  value = value.trim().replace(/&amp;/g, '&');
  if (!value || value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return;
  const line = content.slice(0, offset).split('\n').length;
  const label = `${source}:${line}`;
  let pathname;
  let anchor;
  try {
    const url = new URL(value, `https://portfolio.local/${source.replaceAll('\\', '/')}`);
    pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    anchor = decodeURIComponent(url.hash.slice(1));
  } catch {
    errors.push(`${label}: referência inválida (${value}).`);
    return;
  }
  const file = resolve(root, pathname || 'index.html');
  const remainder = relative(root, file);
  if (isAbsolute(remainder) || remainder === '..' || remainder.startsWith(`..${sep}`)) {
    errors.push(`${label}: referência sai da pasta do site (${value}).`);
    return;
  }
  if (pathname.split('/').some(part => part.startsWith('.')) || ['edicao', 'scripts', 'docs'].includes(pathname.split('/')[0])) {
    errors.push(`${label}: arquivo interno referenciado pelo site (${value}).`);
    return;
  }
  references.push({ source: label, filename: pathname || 'index.html', anchor });
  pending.push(pathname || 'index.html');
}

while (pending.length) {
  const name = pending.shift();
  if (inspected.has(name)) continue;
  inspected.add(name);
  const filename = resolve(root, name);
  try {
    const target = await realpath(filename);
    const remainder = relative(root, target);
    if (isAbsolute(remainder) || remainder === '..' || remainder.startsWith(`..${sep}`)) {
      errors.push(`${name}: o arquivo aponta para fora da pasta do site.`);
      continue;
    }
    if (!(await stat(target)).isFile()) {
      errors.push(`${name}: a referência não aponta para um arquivo.`);
      continue;
    }
    const extension = extname(name).toLowerCase();
    if (!['.html', '.css', '.js', '.svg'].includes(extension)) continue;
    const content = await readFile(target, 'utf8');
    if (extension === '.html') {
      const ids = [...content.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map(match => match[1]);
      idsByFile.set(name, new Set(ids));
      if (new Set(ids).size !== ids.length) errors.push(`${name}: existem IDs HTML duplicados.`);
      for (const match of content.matchAll(/\b(?:src|href|poster)\s*=\s*(["'])(.*?)\1/gi)) {
        localReference(match[2], name, match.index, content);
      }
      for (const match of content.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi)) {
        for (const entry of match[2].split(',')) localReference(entry.trim().split(/\s+/)[0], name, match.index, content);
      }
    }
    if (extension === '.css' || extension === '.svg') {
      for (const match of content.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/gi)) {
        // SVG paint servers refer to the same document, not a disk asset.
        if (extension === '.svg' && match[2].startsWith('#')) continue;
        localReference(match[2], name, match.index, content);
      }
      for (const match of content.matchAll(/@import\s+(["'])(.*?)\1/gi)) localReference(match[2], name, match.index, content);
      if (extension === '.svg') {
        for (const match of content.matchAll(/\b(?:href|xlink:href)\s*=\s*(["'])(.*?)\1/gi)) {
          if (!match[2].startsWith('#')) localReference(match[2], name, match.index, content);
        }
      }
    }
    if (extension === '.js') {
      const syntax = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
      if (syntax.status !== 0) errors.push(`${name}: erro de sintaxe JavaScript.\n${syntax.stderr.trim()}`);
      // The site's canvas loads project illustrations from literal asset paths.
      for (const match of content.matchAll(/(["'`])((?:(?:\.\.?\/)?assets\/)[^"'`\r\n]+)\1/g)) {
        if (!match[2].includes('${')) localReference(match[2], name, match.index, content);
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      const origins = references.filter(ref => ref.filename === name).map(ref => ref.source);
      errors.push(`${name}: arquivo ausente${origins.length ? ` (usado em ${[...new Set(origins)].join(', ')})` : ''}.`);
    } else errors.push(`${name}: ${error.message}`);
  }
}

for (const reference of references) {
  if (reference.anchor && idsByFile.has(reference.filename) && !idsByFile.get(reference.filename).has(reference.anchor)) {
    errors.push(`${reference.source}: âncora #${reference.anchor} ausente em ${reference.filename}.`);
  }
}

try {
  const pdf = await readFile(resolve(root, 'curriculo-daniel-germano.pdf'));
  const actual = createHash('sha256').update(pdf).digest('hex');
  if (actual !== expectedPdfSha256) {
    console.log('Aviso: o currículo PDF mudou desde a versão preservada. Confirme se a atualização é intencional.');
    console.log(`SHA-256 atual do PDF: ${actual}`);
  } else console.log('Currículo PDF: corresponde à versão preservada.');
} catch {
  // Missing PDFs are already reported through their HTML references.
}

if (errors.length) {
  console.error(`Verificação falhou (${errors.length} problema${errors.length === 1 ? '' : 's'}):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Verificação concluída: ${inspected.size} arquivos, ${references.length} referências locais e âncoras válidas.`);
  console.log('HTML, CSS, fontes, imagens, ilustrações do canvas, PDF e sintaxe dos scripts conferidos.');
}
