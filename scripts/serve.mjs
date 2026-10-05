import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
let host = '127.0.0.1';
let port = 8767;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--help' || args[i] === '-h') {
    console.log('Uso: npm run dev -- [--host 127.0.0.1] [--port 8767]');
    console.log('Para testar na rede local: npm run dev -- --host 0.0.0.0');
    process.exit(0);
  }
  if (args[i] === '--host' && args[i + 1]) host = args[++i];
  else if (args[i] === '--port' && args[i + 1]) port = Number(args[++i]);
  else {
    console.error(`Argumento inválido: ${args[i]}. Use --help para ver as opções.`);
    process.exit(1);
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('A porta deve ser um número de 1 a 65535.');
  process.exit(1);
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

// Only the website and its public assets are served, never editing archives or tools.
function publicPath(pathname) {
  const parts = pathname.split('/');
  if (parts.some(part => part === '..' || part.startsWith('.')) || pathname.includes('\\')) return false;
  const extension = extname(pathname).toLowerCase();
  if (parts[0] === 'assets') return Boolean(mime[extension]) && !['.html', '.js'].includes(extension);
  if (parts.length !== 1) return false;
  if (pathname === 'index.html' || pathname === 'robots.txt' || pathname === 'sitemap.xml') return true;
  return ['.css', '.js', '.pdf', '.ico'].includes(extension);
}

function withinRoot(filename) {
  const remainder = relative(root, filename);
  return !isAbsolute(remainder) && remainder !== '..' && !remainder.startsWith(`..${sep}`);
}

function reply(response, status, text, method) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  });
  response.end(method === 'HEAD' ? undefined : text);
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    reply(response, 405, 'Método não permitido.', request.method);
    return;
  }
  let pathname;
  try {
    // Decode before checking traversal; keep query strings separate from file names.
    pathname = decodeURIComponent((request.url || '/').split('?')[0]).replace(/^\/+/, '');
    if (!pathname) pathname = 'index.html';
    if (pathname.includes('\0') || !publicPath(pathname)) {
      reply(response, 404, 'Arquivo não encontrado.', request.method);
      return;
    }
  } catch {
    reply(response, 400, 'Endereço inválido.', request.method);
    return;
  }

  try {
    const filename = await realpath(resolve(root, pathname));
    if (!withinRoot(filename)) {
      reply(response, 404, 'Arquivo não encontrado.', request.method);
      return;
    }
    const info = await stat(filename);
    if (!info.isFile()) {
      reply(response, 404, 'Arquivo não encontrado.', request.method);
      return;
    }
    response.writeHead(200, {
      'Content-Type': mime[extname(filename).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    if (request.method === 'HEAD') response.end();
    else {
      const stream = createReadStream(filename);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    }
  } catch (error) {
    const missing = error.code === 'ENOENT' || error.code === 'ENOTDIR';
    reply(response, missing ? 404 : 500, missing ? 'Arquivo não encontrado.' : 'Não foi possível ler o arquivo.', request.method);
  }
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `A porta ${port} está ocupada. Escolha outra com --port.`
    : `Não foi possível iniciar o servidor: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  const displayHost = host === '0.0.0.0' ? '127.0.0.1' : host.includes(':') ? `[${host}]` : host;
  console.log(`Site disponível em http://${displayHost}:${port}/`);
  if (host === '0.0.0.0') console.log(`Na mesma rede, use o IP deste computador seguido de :${port}.`);
  console.log('Ctrl+C encerra o servidor. Os arquivos de edição não são expostos.');
});
