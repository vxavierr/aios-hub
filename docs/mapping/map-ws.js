const WebSocket = require('ws');
const http = require('http');

async function getWebSocketUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/version', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json.webSocketDebuggerUrl);
      });
    }).on('error', reject);
  });
}

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on('error', reject);
  });
}

async function navigatePage(pageId, url) {
  const pages = await getPages();
  const page = pages.find(p => p.id === pageId || p.url.includes('notion'));
  if (!page) throw new Error('Page not found');

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    ws.on('open', () => {
      console.log('✅ Conectado à página');

      // Navigate
      ws.send(JSON.stringify({
        id: 1,
        method: 'Page.navigate',
        params: { url }
      }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === 1) {
        console.log('📍 Navegando...');
        setTimeout(() => {
          // Get page content
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                ({
                  title: document.querySelector('h1, [class*="title"]')?.textContent || 'Sem título',
                  headers: Array.from(document.querySelectorAll('[class*="header-cell"], th, [role="columnheader"]')).map(h => h.textContent?.trim()).filter(t => t && t.length < 50),
                  content: document.body.innerText.substring(0, 2000)
                })
              `,
              returnByValue: true
            }
          }));
        }, 3000);
      } else if (msg.id === 2) {
        console.log('\n📄 RESULTADO:');
        console.log(JSON.stringify(msg.result?.result?.value, null, 2));
        ws.close();
        resolve(msg.result?.result?.value);
      }
    });

    ws.on('error', reject);
  });
}

(async () => {
  console.log('🔌 Conectando ao Comet via WebSocket direto...\n');

  const pages = await getPages();
  const notionPage = pages.find(p => p.url.includes('notion.so'));
  console.log('📄 Página Notion encontrada:', notionPage?.title);

  const dbs = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  for (const db of dbs) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📊 ${db.name}`);
    console.log(`${'═'.repeat(50)}`);
    await navigatePage(notionPage?.id, db.url);
  }
})();
