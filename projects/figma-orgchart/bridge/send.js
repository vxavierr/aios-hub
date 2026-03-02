#!/usr/bin/env node
/**
 * Envia um organograma para o Figma via bridge.
 *
 * Uso direto:
 *   node bridge/send.js "CEO\n- Ops\n  - Dev"
 *
 * Uso com arquivo:
 *   node bridge/send.js --file estrutura.txt
 *
 * Flags opcionais:
 *   --direction  top-down | left-right  (default: top-down)
 *   --hspacing   número em px           (default: 40)
 *   --vspacing   número em px           (default: 60)
 *   --update     atualiza org chart existente (não cria novo frame)
 *   --clear      limpa o organograma atual
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

// ─── Parse args ───────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

function getFlag(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultVal;
  return args[idx + 1] ?? defaultVal;
}

function hasFlag(name) { return args.includes(`--${name}`); }

const isUpdate = hasFlag('update');
const isClear  = hasFlag('clear');
const direction = getFlag('direction', 'top-down');
const hSpacing  = parseInt(getFlag('hspacing', '40'));
const vSpacing  = parseInt(getFlag('vspacing', '60'));
const filePath  = getFlag('file', null);

let text = '';

if (isClear) {
  // skip text
} else if (filePath) {
  text = fs.readFileSync(path.resolve(filePath), 'utf8');
} else {
  // First non-flag arg is the text
  text = args.find(a => !a.startsWith('--') && args.indexOf(a) === 0) ?? args[0] ?? '';
  if (!text || text.startsWith('--')) {
    console.error('✗  Uso: node bridge/send.js "CEO\\n- Ops\\n  - Dev" [flags]');
    console.error('   Ou:  node bridge/send.js --file estrutura.txt [flags]');
    console.error('   Ou:  node bridge/send.js --clear');
    process.exit(1);
  }
  // Expand literal \n in the argument
  text = text.replace(/\\n/g, '\n');
}

const payload = JSON.stringify({
  type: isClear ? 'clear' : isUpdate ? 'update' : 'generate',
  text: isClear ? undefined : text,
  config: isClear ? undefined : { direction, hSpacing, vSpacing, theme: 'light' },
});

// ─── Send ─────────────────────────────────────────────────────────────────────
const req = http.request(
  { hostname: '127.0.0.1', port: 4242, path: '/command', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
  res => {
    let body = '';
    res.on('data', d => (body += d));
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        if (result.ok) {
          console.log(`✓ Comando enviado para o Figma! (type=${isClear ? 'clear' : isUpdate ? 'update' : 'generate'})`);
          if (!isClear) console.log(`  Linhas de texto: ${text.split('\n').length}`);
        } else {
          console.error('✗ Erro do servidor:', result.error);
        }
      } catch {
        console.log('Resposta:', body);
      }
    });
  }
);

req.on('error', () => {
  console.error('✗  Bridge não está rodando. Inicie primeiro:');
  console.error('   node bridge/server.js');
  process.exit(1);
});

req.write(payload);
req.end();
