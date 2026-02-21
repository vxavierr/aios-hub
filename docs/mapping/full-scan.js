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

function fullScan(wsUrl, url, pageName) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`📄 ${pageName}...`);
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url } }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());

      if (msg.id === 1) {
        // Wait for page load, then scroll and extract
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (async function() {
                  // Scroll down to load more content
                  window.scrollTo(0, document.body.scrollHeight);
                  await new Promise(r => setTimeout(r, 2000));
                  window.scrollTo(0, document.body.scrollHeight / 2);
                  await new Promise(r => setTimeout(r, 1000));

                  const result = {
                    pageName: '${pageName}',
                    databases: [],
                    allText: []
                  };

                  // Find ALL database-like structures
                  const dbSelectors = [
                    '[class*="collection_view"]',
                    '[class*="table-view"]',
                    '[class*="board-view"]',
                    '[class*="timeline-view"]',
                    '[class*="list-view"]',
                    '[class*="gallery-view"]',
                    '[data-block-type="collection_view"]'
                  ];

                  for (const sel of dbSelectors) {
                    document.querySelectorAll(sel).forEach(db => {
                      const info = {
                        selector: sel,
                        title: '',
                        properties: []
                      };

                      // Get title
                      const titleEl = db.querySelector('[class*="title"]');
                      if (titleEl) info.title = titleEl.textContent?.trim();

                      // Get properties/columns
                      db.querySelectorAll('[class*="header-cell"], [class*="property-name"], th').forEach(h => {
                        const text = h.textContent?.trim();
                        if (text && text.length < 50 && !info.properties.includes(text)) {
                          info.properties.push(text);
                        }
                      });

                      if (info.title || info.properties.length > 0) {
                        result.databases.push(info);
                      }
                    });
                  }

                  // Find section headers
                  const headers = document.querySelectorAll('h1, h2, h3, [class*="header"], [class*="heading"]');
                  headers.forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length < 100) {
                      result.allText.push({ type: 'header', text });
                    }
                  });

                  // Find callout/toggle blocks
                  const callouts = document.querySelectorAll('[class*="callout"], [class*="toggle"]');
                  callouts.forEach(c => {
                    const text = c.textContent?.trim()?.substring(0, 200);
                    if (text && (text.includes('Campanha') || text.includes('Otimiza') || text.includes('Background') || text.includes('Performance'))) {
                      result.allText.push({ type: 'callout', text });
                    }
                  });

                  return result;
                })()
              `,
              returnByValue: true
            }
          }));
        }, 5000);
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
  console.log('🔍 SCAN COMPLETO COM SCROLL\n');

  const wsUrl = await getPageWSUrl();

  const mainPages = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  const allResults = [];

  for (const page of mainPages) {
    const info = await fullScan(wsUrl, page.url, page.name);
    if (info) {
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`📄 ${page.name}`);
      console.log(`${'═'.repeat(50)}`);

      if (info.databases?.length > 0) {
        info.databases.forEach(db => {
          console.log(`\n  📊 ${db.title || 'Sem título'}`);
          console.log(`     Props: ${db.properties.slice(0, 15).join(', ')}`);
        });
      }

      if (info.allText?.length > 0) {
        console.log(`\n  📝 Seções encontradas:`);
        info.allText.slice(0, 20).forEach(t => {
          console.log(`     - ${t.text.substring(0, 60)}`);
        });
      }

      allResults.push(info);
    }
  }

  // Save
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/full-scan-results.json', JSON.stringify(allResults, null, 2));
  console.log('\n\n💾 Resultados em: full-scan-results.json');
})();
