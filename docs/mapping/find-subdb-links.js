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

function extractLinks(wsUrl, url, pageName) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`📄 Extraindo links de ${pageName}...`);
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
                    links: []
                  };

                  // Find all links that might be database/page links
                  document.querySelectorAll('a[href*="notion.so"]').forEach(link => {
                    const href = link.href;
                    const text = link.textContent?.trim();

                    if (href && text && text.length < 100) {
                      // Filter to only include relevant database names
                      const relevantPatterns = [
                        /Campanhas/i, /Otimiza/i, /Parametriza/i,
                        /Or-amento/i, /Background/i, /Performance/i,
                        /Vis-o Geral/i, /Experimentos/i
                      ];

                      const isRelevant = relevantPatterns.some(p => p.test(text) || p.test(href));

                      if (isRelevant || text.includes('_')) {
                        result.links.push({ text, href });
                      }
                    }
                  });

                  // Also find clickable elements that might be database links
                  document.querySelectorAll('[class*="page"], [class*="collection"], [role="button"]').forEach(el => {
                    const text = el.textContent?.trim();
                    const onclick = el.onclick?.toString() || '';
                    const dataHref = el.dataset?.href || el.getAttribute('data-href') || '';

                    if (text && text.length < 100) {
                      const relevantPatterns = [
                        /Campanhas/i, /Otimiza/i, /Parametriza/i,
                        /Or-amento/i, /Background/i, /Performance/i
                      ];

                      if (relevantPatterns.some(p => p.test(text))) {
                        result.links.push({ text, href: dataHref || 'clickable' });
                      }
                    }
                  });

                  // Remove duplicates
                  result.links = result.links.filter((link, index, self) =>
                    index === self.findIndex(l => l.text === link.text && l.href === link.href)
                  );

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
  console.log('🔍 EXTRAINDO LINKS DAS SUB-DATABASES\n');

  const wsUrl = await getPageWSUrl();

  const mainPages = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  const allLinks = [];

  for (const page of mainPages) {
    const links = await extractLinks(wsUrl, page.url, page.name);
    if (links) {
      console.log(`\n📋 ${page.name}:`);
      links.links?.forEach(l => {
        console.log(`   ${l.text}`);
        console.log(`      → ${l.href}`);
        allLinks.push({ ...l, source: page.name });
      });
    }
  }

  // Save
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/subdb-links.json', JSON.stringify(allLinks, null, 2));
  console.log('\n\n💾 Links salvos em: subdb-links.json');
})();
