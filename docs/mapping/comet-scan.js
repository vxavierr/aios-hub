const WebSocket = require('ws');

// ASM_Controle de Orçamento page
const pageId = '31B223A7A5B70C4E6BAAFCEEAF5A73D9';

async function scanPage(pageId) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:9222/devtools/page/${pageId}`);
    const timeout = setTimeout(() => { ws.close(); reject(new Error('Timeout')); }, 10000);

    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 0, method: 'Runtime.enable' }));
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                const result = {
                  title: document.title,
                  url: location.href,
                  columns: []
                };

                document.querySelectorAll('[class*="header-cell"], th, [role="columnheader"]').forEach(h => {
                  const text = h.textContent?.trim();
                  if (text && text.length > 0 && text.length < 50 && !result.columns.includes(text)) {
                    result.columns.push(text);
                  }
                });

                result.body = document.body.innerText.substring(0, 3000);
                return JSON.stringify(result);
              })()
            `,
            returnByValue: true
          }
        }));
      }, 500);
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.id === 1 && msg.result?.result?.value) {
          clearTimeout(timeout);
          ws.close();
          resolve(JSON.parse(msg.result.result.value));
        }
      } catch (e) {}
    });

    ws.on('error', (err) => { clearTimeout(timeout); reject(err); });
  });
}

// First get the correct page ID
const http = require('http');
http.get('http://localhost:9222/json/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const pages = JSON.parse(data);
    const asmPage = pages.find(p => p.url.includes('ASM_Controle'));
    if (asmPage) {
      console.log('📊 Mapeando ASM_Controle de Orçamento...\n');
      const ws = new WebSocket(asmPage.webSocketDebuggerUrl);
      const timeout = setTimeout(() => { ws.close(); process.exit(1); }, 10000);

      ws.on('open', () => {
        ws.send(JSON.stringify({ id: 0, method: 'Runtime.enable' }));
        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: {
              expression: `
                (function() {
                  const result = { title: document.title, url: location.href, columns: [] };
                  document.querySelectorAll('[class*="header-cell"], th, [role="columnheader"]').forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length > 0 && text.length < 50 && !result.columns.includes(text)) {
                      result.columns.push(text);
                    }
                  });
                  result.body = document.body.innerText.substring(0, 2000);
                  return JSON.stringify(result);
                })()
              `,
              returnByValue: true
            }
          }));
        }, 500);
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id === 1 && msg.result?.result?.value) {
            clearTimeout(timeout);
            ws.close();
            const content = JSON.parse(msg.result.result.value);
            console.log('📄', content.title);
            console.log('🔗', content.url);
            console.log('\n📋 COLUNAS:', content.columns.join(' | '));
            console.log('\n📝 CONTEÚDO:\n', content.body);
            process.exit(0);
          }
        } catch (e) {}
      });

      ws.on('error', (err) => { clearTimeout(timeout); console.error(err); process.exit(1); });
    } else {
      console.log('❌ Página ASM_Controle não encontrada');
    }
  });
});
