const WebSocket = require('ws');
const http = require('http');

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function navigateAndEvaluate(wsUrl, url) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url } }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.id === 1) {
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  const result = {
                    pageTitle: document.querySelector('h1, [class*="title"]')?.textContent?.trim() || 'Sem título',
                    isDatabase: !!document.querySelector('[class*="collection"], [class*="database"], [class*="table-view"]'),
                    columns: [],
                    views: [],
                    linkedDatabases: [],
                    rawContent: document.body.innerText.substring(0, 3000)
                  };

                  // Find all column headers
                  document.querySelectorAll('[class*="header-cell"], [class*="column"], th, [role="columnheader"]').forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length > 0 && text.length < 50 && !result.columns.find(c => c.name === text)) {
                      const cls = h.className || '';
                      let type = 'text';
                      if (cls.includes('select')) type = 'select';
                      else if (cls.includes('multi')) type = 'multi-select';
                      else if (cls.includes('number')) type = 'number';
                      else if (cls.includes('date')) type = 'date';
                      else if (cls.includes('person')) type = 'person';
                      else if (cls.includes('relation')) type = 'relation';
                      else if (cls.includes('rollup')) type = 'rollup';
                      else if (cls.includes('formula')) type = 'formula';
                      else if (cls.includes('checkbox')) type = 'checkbox';
                      result.columns.push({ name: text, type });
                    }
                  });

                  // Find view tabs
                  document.querySelectorAll('[role="tab"], [class*="view-tab"]').forEach(v => {
                    const text = v.textContent?.trim();
                    if (text && text.length < 30 && !result.views.includes(text)) {
                      result.views.push(text);
                    }
                  });

                  // Find linked database names
                  document.querySelectorAll('[class*="collection-title"], [class*="database-title"]').forEach(d => {
                    const text = d.textContent?.trim();
                    if (text && text.length < 50 && !result.linkedDatabases.includes(text)) {
                      result.linkedDatabases.push(text);
                    }
                  });

                  return result;
                })()
              `,
              returnByValue: true
            }
          }));
        }, 3000);
      } else if (msg.id === 2) {
        ws.close();
        resolve(msg.result?.result?.value);
      }
    });

    ws.on('error', () => resolve(null));
    setTimeout(() => { ws.close(); resolve(null); }, 20000);
  });
}

(async () => {
  console.log('🔍 MAPEAMENTO COMPLETO\n');

  const pages = await getPages();
  const notionPage = pages.find(p => p.url.includes('notion.so'));
  const wsUrl = notionPage?.webSocketDebuggerUrl;

  // All databases found + suspected
  const databases = [
    // Already found
    { name: 'Home da Mídia', url: 'https://www.notion.so/uhuru-comunicacao/Home-da-M-dia-4c1316fb406744538bb159ea13851cd2' },
    { name: 'Página da Uhuru', url: 'https://www.notion.so/uhuru-comunicacao/2f47c4525b1946d0beb940d793526bf7' },

    // Performance tracking databases (from sidebar)
    { name: 'ORI - Acompanhamento', url: 'https://www.notion.so/uhuru-comunicacao/ORI-Acompanhamento-performance-' },
    { name: 'OCP - Acompanhamento', url: 'https://www.notion.so/uhuru-comunicacao/OCP-Acompanhamento-performance-' },
    { name: 'CIN - Acompanhamento', url: 'https://www.notion.so/uhuru-comunicacao/CIN-Acompanhamento-performance-' },
    { name: 'SER - Acompanhamento', url: 'https://www.notion.so/uhuru-comunicacao/SER-Acompanhamento-performance-' },

    // Other databases mentioned
    { name: 'Home - Dados & BI', url: 'https://www.notion.so/uhuru-comunicacao/Home-Dados-BI-' },
    { name: 'DASH COMERCIAL OCP', url: 'https://www.notion.so/uhuru-comunicacao/DASH-COMERCIAL-OCP-' },
    { name: 'Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/Campanhas-' },

    // From sidebar favorites
    { name: 'OCP_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Controle-de-Or-amento-1f6dc0a840ac42ecae54e19cc3d6da7b' },
    { name: 'ASM_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Controle-de-Or-amento-bac0e90c7b4c4bf9a86779767403ed07' }
  ];

  const results = [];

  for (const db of databases) {
    console.log(`📊 ${db.name}...`);
    const info = await navigateAndEvaluate(wsUrl, db.url);

    if (!info) {
      console.log(`   ⚠️ Timeout`);
      continue;
    }

    if (info.isDatabase) {
      console.log(`   ✅ DATABASE: ${info.columns?.length || 0} colunas`);
      results.push({ ...db, ...info });
    } else {
      console.log(`   📄 Página (não é database)`);
    }
  }

  // Full output
  console.log(`\n\n${'═'.repeat(70)}`);
  console.log('📋 MAPEAMENTO COMPLETO DAS DATABASES');
  console.log(`${'═'.repeat(70)}\n`);

  for (const r of results) {
    console.log(`\nDATABASE: ${r.name}`);
    console.log(`URL: ${r.url}`);
    console.log(`\n├── Propriedades:`);
    r.columns?.forEach(c => console.log(`│   ├── ${c.name} (${c.type})`));
    if (r.views?.length > 0) {
      console.log(`├── Views: ${r.views.join(', ')}`);
    }
    console.log(`└──`);
  }

  // Save to file
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/notion-mapping-full.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Salvo em: notion-mapping-full.json');
})();
