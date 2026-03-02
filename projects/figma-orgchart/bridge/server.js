#!/usr/bin/env node
/**
 * Figma Org Chart Bridge Server
 * Roda em localhost:4242 como relay entre Claude Code e o plugin Figma.
 *
 * Uso:
 *   node bridge/server.js
 *
 * API:
 *   GET    /command   → retorna { command: null | { type, text, config } }
 *   POST   /command   → recebe o comando (JSON body)
 *   DELETE /command   → limpa após consumo pelo plugin
 *   GET    /health    → { ok: true, version: "1.0" }
 */

const http = require('http');
const PORT = 4242;

let pending = null;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }

  const url = req.url.split('?')[0];

  if (url === '/health' && req.method === 'GET') {
    return json(res, 200, { ok: true, version: '1.0', hasPending: !!pending });
  }

  if (url === '/command') {
    if (req.method === 'GET') {
      return json(res, 200, { command: pending });
    }

    if (req.method === 'POST') {
      try {
        const body = await readBody(req);
        pending = JSON.parse(body);
        console.log(`[bridge] ✓ Comando recebido: type=${pending.type}, nodes estimados: ~${(pending.text || '').split('\n').length}`);
        return json(res, 200, { ok: true });
      } catch (e) {
        return json(res, 400, { error: 'JSON inválido', detail: e.message });
      }
    }

    if (req.method === 'DELETE') {
      pending = null;
      return json(res, 200, { ok: true });
    }
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔══════════════════════════════════════════╗
║  🌉  Figma Org Chart Bridge              ║
║      http://localhost:${PORT}               ║
╠══════════════════════════════════════════╣
║  Envie um organograma:                   ║
║  node bridge/send.js "CEO\\n- Ops"       ║
║                                          ║
║  Com config:                             ║
║  node bridge/send.js "CEO\\n- Ops" \\    ║
║    --direction left-right \\             ║
║    --hspacing 60 --vspacing 80           ║
╚══════════════════════════════════════════╝
`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Porta ${PORT} já está em uso. O servidor já está rodando?`);
  } else {
    console.error('✗ Erro no servidor:', err.message);
  }
  process.exit(1);
});
