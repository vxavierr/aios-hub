const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

function getCDPInfo() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data);
          resolve(pages);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function navigateAndExtract(wsUrl, url, pageName) {
  return new Promise((resolve) => {
    const ws = new WebSocket(wsUrl);
    let step = 0;

    ws.on('open', () => {
      console.log('[INFO] Navegando para: ' + pageName);
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url } }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.id === 1) {
          // Page loaded, wait then scroll
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 2,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (async function() {
                    window.scrollTo(0, document.body.scrollHeight);
                    await new Promise(r => setTimeout(r, 2000));
                    window.scrollTo(0, document.body.scrollHeight / 2);
                    await new Promise(r => setTimeout(r, 1500));
                    return 'scrolled';
                  })()
                `,
                returnByValue: true
              }
            }));
          }, 4000);
        }

        if (msg.id === 2) {
          // Scrolled, now extract
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 3,
              method: 'Runtime.evaluate',
              params: {
                expression: `
                  (function() {
                    const result = {
                      pageName: '${pageName}',
                      url: location.href,
                      databases: [],
                      relations: [],
                      rollups: [],
                      sections: [],
                      links: []
                    };

                    // Find all database/collection structures
                    const dbSelectors = [
                      '[class*="collection"]',
                      '[class*="database"]',
                      '[class*="table-view"]',
                      '[class*="board-view"]',
                      '[class*="timeline-view"]',
                      '[data-block-type="collection_view"]'
                    ];

                    dbSelectors.forEach(sel => {
                      document.querySelectorAll(sel).forEach(db => {
                        const info = {
                          title: '',
                          type: 'database',
                          properties: []
                        };

                        // Get title
                        const titleEl = db.querySelector('[class*="title"], [class*="collection-title"], h2, h3');
                        if (titleEl) {
                          info.title = titleEl.textContent.trim();
                        }

                        // Get all property/column headers
                        const headers = db.querySelectorAll('[class*="header-cell"], th, [role="columnheader"], [class*="property-name"]');
                        headers.forEach(h => {
                          const text = h.textContent.trim();
                          const cls = (h.className || '') + ' ' + (h.parentElement?.className || '');

                          if (text && text.length > 0 && text.length < 50) {
                            let propType = 'text';

                            // Detect type from classes
                            if (cls.includes('relation') || h.querySelector('[class*="relation"]')) {
                              propType = 'relation';
                              // Try to get target database
                              const relEl = h.querySelector('[class*="relation"]');
                              if (relEl) {
                                info.properties.push({ name: text, type: 'relation', target: relEl.textContent.trim() });
                              } else {
                                info.properties.push({ name: text, type: 'relation', target: 'unknown' });
                              }
                            } else if (cls.includes('rollup')) {
                              propType = 'rollup';
                              info.properties.push({ name: text, type: 'rollup' });
                            } else if (cls.includes('formula')) {
                              propType = 'formula';
                              info.properties.push({ name: text, type: 'formula' });
                            } else if (cls.includes('multi-select') || cls.includes('multi_select')) {
                              propType = 'multi_select';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('select')) {
                              propType = 'select';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('number')) {
                              propType = 'number';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('date')) {
                              propType = 'date';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('person') || cls.includes('user')) {
                              propType = 'person';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('checkbox')) {
                              propType = 'checkbox';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('url')) {
                              propType = 'url';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('email')) {
                              propType = 'email';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('phone')) {
                              propType = 'phone';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('files')) {
                              propType = 'files';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('created_time') || cls.includes('created-time')) {
                              propType = 'created_time';
                              info.properties.push({ name: text, type: propType });
                            } else if (cls.includes('last_edited') || cls.includes('last-edited')) {
                              propType = 'last_edited';
                              info.properties.push({ name: text, type: propType });
                            } else {
                              info.properties.push({ name: text, type: 'text' });
                            }
                          }
                        });

                        if (info.title || info.properties.length > 0) {
                          // Check if already exists
                          const exists = result.databases.find(d => d.title === info.title);
                          if (!exists) {
                            result.databases.push(info);
                          }
                        }
                      });
                    });

                    // Extract relations
                    result.databases.forEach(db => {
                      db.properties.forEach(p => {
                        if (p.type === 'relation') {
                          result.relations.push({
                            from: db.title,
                            property: p.name,
                            to: p.target
                          });
                        }
                        if (p.type === 'rollup') {
                          result.rollups.push({
                            database: db.title,
                            property: p.name
                          });
                        }
                      });
                    });

                    // Find section headings
                    document.querySelectorAll('h1, h2, h3, [class*="heading"], [class*="header"]').forEach(h => {
                      const text = h.textContent.trim();
                      if (text && text.length > 0 && text.length < 100) {
                        if (!result.sections.find(s => s.text === text)) {
                          result.sections.push({ type: 'heading', text: text });
                        }
                      }
                    });

                    // Find sub-page links
                    document.querySelectorAll('a[href*="notion.so"]').forEach(link => {
                      const href = link.href;
                      const text = link.textContent.trim();
                      if (text && text.length > 0 && text.length < 100) {
                        if (!result.links.find(l => l.text === text)) {
                          result.links.push({ text: text, href: href });
                        }
                      }
                    });

                    return result;
                  })()
                `,
                returnByValue: true
              }
            }));
          }, 2000);
        }

        if (msg.id === 3) {
          ws.close();
          if (msg.result && msg.result.result && msg.result.result.value) {
            resolve(msg.result.result.value);
          } else {
            resolve(null);
          }
        }
      } catch (e) {
        console.log('[ERROR] Parse error: ' + e.message);
      }
    });

    ws.on('error', (err) => {
      console.log('[ERROR] WS error: ' + err.message);
      resolve(null);
    });

    setTimeout(() => {
      ws.close();
      resolve(null);
    }, 45000);
  });
}

function formatPropertyType(type) {
  const icons = {
    relation: '[REL]',
    rollup: '[ROLL]',
    formula: '[FORM]',
    select: '[SEL]',
    multi_select: '[MSEL]',
    date: '[DATE]',
    person: '[PERS]',
    number: '[NUM]',
    checkbox: '[CHK]',
    url: '[URL]',
    email: '[MAIL]',
    phone: '[TEL]',
    files: '[FILE]',
    created_time: '[CREATED]',
    last_edited: '[EDITED]',
    text: '[TXT]'
  };
  return icons[type] || '[TXT]';
}

(async () => {
  console.log('');
  console.log('============================================================');
  console.log('  NOTION DEEP STRUCTURE MAPPER');
  console.log('============================================================');
  console.log('');

  try {
    const pages = await getCDPInfo();
    const notionPage = pages.find(p => p.url && p.url.includes('notion.so'));

    if (!notionPage) {
      console.log('[ERROR] Nenhuma pagina do Notion encontrada no Comet');
      console.log('[INFO] Abra o Notion no Comet primeiro');
      process.exit(1);
    }

    console.log('[OK] Conectado ao Comet');
    console.log('[INFO] Pagina: ' + notionPage.title);
    console.log('[INFO] URL: ' + notionPage.url);
    console.log('');

    const wsUrl = notionPage.webSocketDebuggerUrl;

    const mainDatabases = [
      { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
      { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
      { name: 'CASA', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
    ];

    const allResults = [];

    for (const db of mainDatabases) {
      console.log('');
      console.log('------------------------------------------------------------');
      console.log(' MAPEANDO: ' + db.name);
      console.log('------------------------------------------------------------');

      const info = await navigateAndExtract(wsUrl, db.url, db.name);

      if (info) {
        console.log('');
        console.log('  DATABASES ENCONTRADAS: ' + info.databases.length);

        info.databases.forEach((d, i) => {
          console.log('');
          console.log('  [' + (i+1) + '] ' + (d.title || '(sem titulo)'));
          console.log('      Propriedades: ' + d.properties.length);

          d.properties.slice(0, 15).forEach(p => {
            const typeTag = formatPropertyType(p.type);
            let line = '      ' + typeTag + ' ' + p.name;
            if (p.target && p.target !== 'unknown') {
              line += ' -> ' + p.target;
            }
            console.log(line);
          });
        });

        if (info.relations.length > 0) {
          console.log('');
          console.log('  RELATIONS: ' + info.relations.length);
          info.relations.forEach(r => {
            console.log('    ' + r.from + ' [' + r.property + '] -> ' + r.to);
          });
        }

        if (info.rollups.length > 0) {
          console.log('');
          console.log('  ROLLUPS: ' + info.rollups.length);
          info.rollups.forEach(r => {
            console.log('    ' + r.database + ': ' + r.property);
          });
        }

        if (info.sections.length > 0) {
          console.log('');
          console.log('  SECOES: ' + info.sections.length);
          info.sections.slice(0, 10).forEach(s => {
            console.log('    - ' + s.text.substring(0, 50));
          });
        }

        if (info.links.length > 0) {
          console.log('');
          console.log('  LINKS: ' + info.links.length);
          info.links.slice(0, 10).forEach(l => {
            console.log('    - ' + l.text.substring(0, 40));
          });
        }

        allResults.push(info);
      } else {
        console.log('[ERROR] Falha ao extrair informacoes');
      }
    }

    // Save JSON
    fs.writeFileSync('D:/workspace/notion-deep-mapping.json', JSON.stringify(allResults, null, 2));
    console.log('');
    console.log('[SAVED] notion-deep-mapping.json');

    // Generate Mermaid
    let mermaid = 'graph TD\n';
    mermaid += '    subgraph Uhuru["Uhuru Comunicacao"]\n';

    allResults.forEach(result => {
      const safeId = result.pageName.replace(/[^a-zA-Z0-9]/g, '_');
      mermaid += '        ' + safeId + '["' + result.pageName + '"]\n';

      result.databases.forEach(db => {
        if (db.title) {
          const dbId = safeId + '_' + db.title.replace(/[^a-zA-Z0-9]/g, '_');
          mermaid += '        ' + dbId + '["' + db.title + '"]\n';
          mermaid += '        ' + safeId + ' --> ' + dbId + '\n';
        }
      });
    });

    mermaid += '    end\n';

    // Add relations
    allResults.forEach(result => {
      result.relations.forEach(rel => {
        if (rel.to && rel.to !== 'unknown') {
          const fromId = result.pageName.replace(/[^a-zA-Z0-9]/g, '_');
          // Try to find target database
          let targetId = rel.to.replace(/[^a-zA-Z0-9]/g, '_');
          mermaid += '    ' + fromId + ' -.->|' + rel.property + '| ' + targetId + '\n';
        }
      });
    });

    fs.writeFileSync('D:/workspace/notion-structure.mmd', mermaid);
    console.log('[SAVED] notion-structure.mmd');

    console.log('');
    console.log('============================================================');
    console.log('  MERMAID DIAGRAM');
    console.log('============================================================');
    console.log(mermaid);

  } catch (error) {
    console.log('[ERROR] ' + error.message);
    console.log(error.stack);
  }
})();
