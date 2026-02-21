const WebSocket = require('ws');
const http = require('http');

function getPageWSUrl() {
  return new Promise((resolve, reject) => {
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

function explorePage(wsUrl, url, pageName) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`🔍 Explorando ${pageName}...`);
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
                    pageName: '${pageName}',
                    structure: []
                  };

                  // Find all linked database/collection elements
                  const collections = document.querySelectorAll('[class*="collection"], [class*="linked"], [class*="database"]');

                  collections.forEach((coll, i) => {
                    const info = {
                      index: i,
                      className: coll.className?.substring(0, 100),
                      title: '',
                      properties: [],
                      type: 'unknown'
                    };

                    // Try to find the title
                    const titleEl = coll.querySelector('[class*="title"], [class*="collection-title"], h2, h3');
                    if (titleEl) {
                      info.title = titleEl.textContent?.trim();
                    }

                    // Check if it's a table view
                    if (coll.querySelector('[class*="table-view"], [class*="table"]')) {
                      info.type = 'table';

                      // Get column headers
                      coll.querySelectorAll('[class*="header-cell"], th').forEach(h => {
                        const text = h.textContent?.trim();
                        if (text && text.length < 50) {
                          info.properties.push(text);
                        }
                      });
                    }

                    // Check if it's a board view
                    if (coll.querySelector('[class*="board-view"], [class*="kanban"]')) {
                      info.type = 'board';
                    }

                    // Check if it's a timeline
                    if (coll.querySelector('[class*="timeline"], [class*="calendar"]')) {
                      info.type = 'timeline';
                    }

                    // Check if it's a list
                    if (coll.querySelector('[class*="list-view"]')) {
                      info.type = 'list';
                    }

                    if (info.title || info.properties.length > 0) {
                      result.structure.push(info);
                    }
                  });

                  // Also find toggle/callout blocks that might contain databases
                  const toggles = document.querySelectorAll('[class*="toggle"], [class*="callout"]');
                  toggles.forEach((t, i) => {
                    const text = t.textContent?.trim()?.substring(0, 100);
                    if (text && (text.includes('Campanhas') || text.includes('Otimiza') || text.includes('Background'))) {
                      result.structure.push({
                        index: 100 + i,
                        type: 'toggle/callout',
                        title: text.substring(0, 50),
                        properties: []
                      });
                    }
                  });

                  return result;
                })()
              `,
              returnByValue: true
            }
          }));
        }, 4000);
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
  console.log('🔍 EXPLORANDO ESTRUTURA DAS PÁGINAS\n');

  const wsUrl = await getPageWSUrl();

  const mainPages = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  const allResults = [];

  for (const page of mainPages) {
    const info = await explorePage(wsUrl, page.url, page.name);
    if (info) {
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`📄 ${page.name}`);
      console.log(`${'═'.repeat(50)}`);

      info.structure?.forEach(s => {
        console.log(`\n  📊 ${s.title || 'Sem título'} (${s.type})`);
        if (s.properties.length > 0) {
          console.log(`     Propriedades: ${s.properties.slice(0, 10).join(', ')}`);
        }
      });

      allResults.push(info);
    }
  }

  // Save
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/page-structure.json', JSON.stringify(allResults, null, 2));
  console.log('\n\n💾 Estrutura salva em: page-structure.json');
})();
