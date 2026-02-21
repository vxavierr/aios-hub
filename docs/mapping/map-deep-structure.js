const WebSocket = require('ws');
const http = require('fs');

// URLs das sub-databases ASM
const asmDatabases = [
  { name: 'ASM_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Campanhas-' },
  { name: 'ASM_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Otimiza-es-' },
  { name: 'ASM_Parametrização de URLs', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Parametriza-o-de-URLs-' },
  { name: 'ASM_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Controle-de-Or-amento-bac0e90c7b4c4bf9a86779767403ed07' },
  { name: 'ASM_Background', url: 'https://www.notion.so/uhuru-comunicacao/ASM_Background-' },
];

const ocpDatabases = [
  { name: 'OCP_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Campanhas-' },
  { name: 'OCP_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Otimiza-es-' },
  { name: 'OCP_Parametrização de URLs', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Parametriza-o-de-URLs-' },
  { name: 'OCP_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Controle-de-Or-amento-1f6dc0a840ac42ecae54e19cc3d6da7b' },
  { name: 'OCP_Background', url: 'https://www.notion.so/uhuru-comunicacao/OCP_Background-' },
];

const casaDatabases = [
  { name: 'CASA_Campanhas', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Campanhas-' },
  { name: 'CASA_Otimizações', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Otimiza-es-' },
  { name: 'CASA_Parametrização de URLs', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Parametriza-o-de-URLs-' },
  { name: 'CASA_Controle de Orçamento', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Controle-de-Or-amento-' },
  { name: 'CASA_Background', url: 'https://www.notion.so/uhuru-comunicacao/CASA_Background-' },
];

function getPageWSUrl() {
  return new Promise((resolve, reject) => {
    const http = require('http');
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const pages = JSON.parse(data);
        const notionPage = pages.find(p => p.url.includes('notion.so'));
        if (notionPage) {
          resolve(notionPage.webSocketDebuggerUrl);
        } else {
          reject(new Error('No Notion page found'));
        }
      });
    }).on('error', reject);
  });
}

function deepScanDatabase(wsUrl, url, dbName) {
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
                    found: true,
                    properties: [],
                    relations: [],
                    rollups: [],
                    formulas: [],
                    views: [],
                    linkedDatabases: []
                  };

                  // Check if database exists
                  const isDatabase = document.querySelector('[class*="collection"], [class*="database"], [class*="table-view"]');
                  if (!isDatabase) {
                    result.found = false;
                    return result;
                  }

                  // Get ALL property headers with their types
                  const allCells = document.querySelectorAll('[class*="header-cell"], th, [role="columnheader"], [class*="property-name"]');

                  allCells.forEach(cell => {
                    const text = cell.textContent?.trim();
                    if (!text || text.length === 0 || text.length > 50) return;

                    const cls = cell.className || '';
                    const parent = cell.parentElement?.className || '';
                    const allClasses = cls + ' ' + parent;

                    let type = 'text';

                    // Detect specific types
                    if (allClasses.includes('relation') || cell.querySelector('[class*="relation"]')) {
                      type = 'relation';
                      // Try to find the linked database name
                      const relEl = cell.querySelector('[class*="relation"]');
                      if (relEl) {
                        result.relations.push({ name: text, targetDb: relEl.textContent?.trim() || 'unknown' });
                      } else {
                        result.relations.push({ name: text, targetDb: 'unknown' });
                      }
                    } else if (allClasses.includes('rollup') || cell.querySelector('[class*="rollup"]')) {
                      type = 'rollup';
                      result.rollups.push(text);
                    } else if (allClasses.includes('formula') || cell.querySelector('[class*="formula"]')) {
                      type = 'formula';
                      result.formulas.push(text);
                    } else if (allClasses.includes('select') && !allClasses.includes('multi')) {
                      type = 'select';
                    } else if (allClasses.includes('multi-select') || allClasses.includes('multi_select')) {
                      type = 'multi-select';
                    } else if (allClasses.includes('number')) {
                      type = 'number';
                    } else if (allClasses.includes('date')) {
                      type = 'date';
                    } else if (allClasses.includes('person') || allClasses.includes('user')) {
                      type = 'person';
                    } else if (allClasses.includes('checkbox')) {
                      type = 'checkbox';
                    } else if (allClasses.includes('url')) {
                      type = 'url';
                    } else if (allClasses.includes('email')) {
                      type = 'email';
                    } else if (allClasses.includes('phone')) {
                      type = 'phone';
                    } else if (allClasses.includes('files')) {
                      type = 'files';
                    } else if (allClasses.includes('created')) {
                      type = 'created_time';
                    } else if (allClasses.includes('last_edited')) {
                      type = 'last_edited';
                    }

                    result.properties.push({ name: text, type });
                  });

                  // Get views
                  document.querySelectorAll('[role="tab"], [class*="view-tab"]').forEach(v => {
                    const text = v.textContent?.trim();
                    if (text && text.length < 30 && !result.views.includes(text)) {
                      result.views.push(text);
                    }
                  });

                  // Find linked database names in the page
                  document.querySelectorAll('[class*="linked-database"], [class*="collection-title"]').forEach(d => {
                    const text = d.textContent?.trim();
                    if (text && text.length < 50) {
                      result.linkedDatabases.push(text);
                    }
                  });

                  // Get page body sample
                  result.bodySample = document.body.innerText.substring(0, 1500);

                  return result;
                })()
              `,
              returnByValue: true
            }
          }));
        }, 4000); // Wait longer for page to fully load
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
  console.log('🔍 MAPEAMENTO PROFUNDO - Relations & Rollups\n');

  const wsUrl = await getPageWSUrl();
  console.log('✅ Conectado ao Notion\n');

  const allDatabases = [...asmDatabases, ...ocpDatabases, ...casaDatabases];
  const results = [];

  for (const db of allDatabases) {
    const info = await deepScanDatabase(wsUrl, db.url, db.name);
    if (info) {
      if (info.found) {
        console.log(`   ✅ ${info.properties?.length || 0} propriedades, ${info.relations?.length || 0} relations, ${info.rollups?.length || 0} rollups`);
      } else {
        console.log(`   📄 Página não-database ou não encontrada`);
      }
      results.push(info);
    } else {
      console.log(`   ⚠️ Timeout`);
      results.push({ name: db.name, found: false, error: 'timeout' });
    }
  }

  // Output structured results
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 RESULTADOS ESTRUTURADOS');
  console.log('='.repeat(70));

  for (const r of results) {
    if (!r?.found) {
      console.log(`\n❌ ${r?.name || 'Unknown'} - Não encontrado`);
      continue;
    }

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`DATABASE: ${r.name}`);
    console.log(`URL: ${r.url}`);
    console.log(`${'─'.repeat(50)}`);

    console.log(`\n📋 PROPRIEDADES (${r.properties?.length || 0}):`);
    r.properties?.forEach(p => {
      let icon = '📝';
      if (p.type === 'relation') icon = '🔗';
      else if (p.type === 'rollup') icon = '📊';
      else if (p.type === 'formula') icon = '🧮';
      else if (p.type === 'select') icon = '🏷️';
      else if (p.type === 'date') icon = '📅';
      else if (p.type === 'person') icon = '👤';
      else if (p.type === 'number') icon = '🔢';

      console.log(`   ${icon} ${p.name} (${p.type})`);
    });

    if (r.relations?.length > 0) {
      console.log(`\n🔗 RELATIONS:`);
      r.relations.forEach(rel => {
        console.log(`   → ${rel.name} → ${rel.targetDb}`);
      });
    }

    if (r.rollups?.length > 0) {
      console.log(`\n📊 ROLLUPS:`);
      r.rollups.forEach(roll => {
        console.log(`   ↗️ ${roll}`);
      });
    }

    if (r.formulas?.length > 0) {
      console.log(`\n🧮 FÓRMULAS:`);
      r.formulas.forEach(form => {
        console.log(`   fx ${form}`);
      });
    }

    if (r.views?.length > 0) {
      console.log(`\n👁️ VIEWS: ${r.views.join(', ')}`);
    }
  }

  // Save to JSON
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/deep-mapping-results.json', JSON.stringify(results, null, 2));
  console.log('\n\n💾 Salvo em: deep-mapping-results.json');
})();
