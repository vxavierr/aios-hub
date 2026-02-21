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

function evaluateOnPage(wsUrl, expression) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let resolved = false;

    ws.on('open', () => {
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression, returnByValue: true }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === 1 && !resolved) {
        resolved = true;
        ws.close();
        resolve(msg.result?.result?.value);
      }
    });

    ws.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        ws.close();
        resolve(null);
      }
    }, 15000);
  });
}

function navigateAndEvaluate(wsUrl, url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let step = 0;

    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url } }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.id === 1 && step === 0) {
        step = 1;
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
                    relations: [],
                    rollups: [],
                    formulas: [],
                    sampleData: []
                  };

                  // Find column headers
                  document.querySelectorAll('[class*="header-cell"], [class*="column"], th').forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length > 0 && text.length < 50 && !result.columns.find(c => c.name === text)) {
                      // Try to detect type
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
                      else if (cls.includes('url')) type = 'url';

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

                  // Get sample row data
                  document.querySelectorAll('[class*="row"], tr').forEach((row, i) => {
                    if (i < 3) {
                      const cells = Array.from(row.querySelectorAll('td, [class*="cell"]')).map(c => c.textContent?.trim()?.substring(0, 50));
                      if (cells.length > 0) result.sampleData.push(cells);
                    }
                  });

                  // Look for relation indicators in page
                  const pageText = document.body.innerText;
                  if (pageText.includes('→') || pageText.includes('→')) {
                    result.hasRelations = true;
                  }

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

    ws.on('error', reject);

    setTimeout(() => {
      ws.close();
      resolve(null);
    }, 20000);
  });
}

(async () => {
  console.log('🔍 MAPEAMENTO PROFUNDO DE DATABASES\n');

  const pages = await getPages();
  const notionPage = pages.find(p => p.url.includes('notion.so'));
  const wsUrl = notionPage?.webSocketDebuggerUrl;

  if (!wsUrl) {
    console.log('❌ Página Notion não encontrada');
    return;
  }

  // Databases to map - the actual data tables
  const databases = [
    { name: 'OCP_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Campanhas-' },
    { name: 'OCP_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Otimiza-es-' },
    { name: 'ASM_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Campanhas-' },
    { name: 'Home da Mídia', url: 'https://www.notion.so/uhuru-comunicacao/Home-da-M-dia-4c1316fb406744538bb159ea13851cd2' },
    { name: 'Página da Uhuru', url: 'https://www.notion.so/uhuru-comunicacao/2f47c4525b1946d0beb940d793526bf7' }
  ];

  const results = [];

  for (const db of databases) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📊 ${db.name}`);
    console.log(`${'═'.repeat(50)}`);

    const info = await navigateAndEvaluate(wsUrl, db.url);

    if (!info) {
      console.log('   ⚠️ Não conseguiu carregar');
      continue;
    }

    console.log(`\n📄 Página: ${info.pageTitle}`);
    console.log(`📁 É Database: ${info.isDatabase ? 'SIM' : 'NÃO'}`);

    if (info.columns?.length > 0) {
      console.log(`\n📋 COLUNAS (${info.columns.length}):`);
      info.columns.forEach(c => console.log(`   • ${c.name} (${c.type})`));
    }

    if (info.views?.length > 0) {
      console.log(`\n👁️ VIEWS: ${info.views.join(', ')}`);
    }

    if (info.sampleData?.length > 0) {
      console.log(`\n📝 DADOS DE EXEMPLO:`);
      info.sampleData.forEach((row, i) => {
        console.log(`   Linha ${i+1}: ${row.slice(0, 3).join(' | ')}`);
      });
    }

    results.push({ name: db.name, ...info });
  }

  // Summary
  console.log(`\n\n${'═'.repeat(60)}`);
  console.log('📋 RESUMO DO MAPEAMENTO');
  console.log(`${'═'.repeat(60)}\n`);

  for (const r of results) {
    if (r?.isDatabase) {
      console.log(`✅ ${r.name}: ${r.columns?.length || 0} colunas`);
    } else if (r) {
      console.log(`📄 ${r.name}: Página (não é database)`);
    }
  }
})();
