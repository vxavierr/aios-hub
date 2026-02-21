const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function navigateAndScan(wsUrl, url, dbName) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`📊 ${dbName}...`);
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
                    name: '${dbName}',
                    url: location.href,
                    title: document.title,
                    isDatabase: !!document.querySelector('[class*="collection"], [class*="database"], [class*="table-view"]'),
                    columns: [],
                    views: [],
                    sampleRows: [],
                    linkedDbs: []
                  };

                  // Get column headers
                  document.querySelectorAll('[class*="header-cell"], th, [role="columnheader"]').forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length > 0 && text.length < 50) {
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
                      if (!result.columns.find(c => c.name === text)) {
                        result.columns.push({ name: text, type });
                      }
                    }
                  });

                  // Get views
                  document.querySelectorAll('[role="tab"], [class*="view-tab"]').forEach(v => {
                    const text = v.textContent?.trim();
                    if (text && text.length < 30 && !result.views.includes(text)) {
                      result.views.push(text);
                    }
                  });

                  // Sample row data
                  const rows = document.querySelectorAll('[class*="row"], tr');
                  for (let i = 0; i < Math.min(3, rows.length); i++) {
                    const cells = Array.from(rows[i].querySelectorAll('td, [class*="cell"]'))
                      .map(c => c.textContent?.trim()?.substring(0, 40));
                    if (cells.length > 0) result.sampleRows.push(cells);
                  }

                  // Find linked databases
                  document.querySelectorAll('[class*="collection-title"], [class*="linked"]').forEach(d => {
                    const text = d.textContent?.trim();
                    if (text && text.length < 50) result.linkedDbs.push(text);
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
    setTimeout(() => { ws.close(); resolve(null); }, 15000);
  });
}

(async () => {
  console.log('🔍 MAPEANDO SUB-DATABASES\n');

  const pages = await getPages();
  const notionPage = pages.find(p => p.url.includes('notion.so'));
  const wsUrl = notionPage?.webSocketDebuggerUrl;

  // Sub-databases to map (with guessed URLs - may need adjustment)
  const subDatabases = [
    // OCP sub-databases
    { name: 'OCP_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Campanhas-' },
    { name: 'OCP_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Otimiza-es-' },

    // ASM sub-databases
    { name: 'ASM_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Campanhas-' },
    { name: 'ASM_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Otimiza-es-' },

    // CASA sub-databases
    { name: 'CASA_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Campanhas-' },

    // Common databases
    { name: 'Home da Mídia', url: 'https://www.notion.so/uhuru-comunicacao/Home-da-M-dia-4c1316fb406744538bb159ea13851cd2' },
    { name: 'Página da Uhuru', url: 'https://www.notion.so/uhuru-comunicacao/2f47c4525b1946d0beb940d793526bf7' },

    // Controle de Orçamento (from sidebar)
    { name: 'OCP_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Controle-de-Or-amento-1f6dc0a840ac42ecae54e19cc3d6da7b' },
    { name: 'ASM_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Controle-de-Or-amento-bac0e90c7b4c4bf9a86779767403ed07' }
  ];

  const results = [];

  for (const db of subDatabases) {
    const info = await navigateAndScan(wsUrl, db.url, db.name);
    if (info) {
      if (info.isDatabase && info.columns?.length > 0) {
        console.log(`   ✅ ${info.columns.length} colunas`);
        results.push(info);
      } else {
        console.log(`   📄 Página (não é database ou sem colunas)`);
      }
    } else {
      console.log(`   ⚠️ Erro/Timeout`);
    }
  }

  // Output results
  console.log(`\n${'═'.repeat(60)}`);
  console.log('📋 SUB-DATABASES ENCONTRADAS');
  console.log(`${'═'.repeat(60)}\n`);

  for (const r of results) {
    if (!r.isDatabase || r.columns?.length === 0) continue;

    console.log(`\nDATABASE: ${r.name}`);
    console.log(`├── Propriedades (${r.columns.length}):`);
    r.columns.forEach(c => console.log(`│   • ${c.name} (${c.type})`));
    if (r.views?.length > 0) {
      console.log(`├── Views: ${r.views.join(', ')}`);
    }
    console.log(`└──`);
  }

  // Save
  fs.writeFileSync('D:/workspace/subdbs-mapping.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Salvo em: subdbs-mapping.json');
})();
