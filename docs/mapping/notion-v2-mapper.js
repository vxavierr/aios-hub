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
          resolve(JSON.parse(data));
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
    let currentStep = 0;
    const steps = [
      // Step 1: Navigate
      () => {
        console.log('  [1/5] Navegando para ' + pageName + '...');
        ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url } }));
      },
      // Step 2: Wait and expand toggles
      () => {
        console.log('  [2/5] Expandindo toggles...');
        ws.send(JSON.stringify({
          id: 2,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (async function() {
                // Wait for initial load
                await new Promise(r => setTimeout(r, 3000));

                // Find and click all toggle buttons to expand sections
                const toggles = document.querySelectorAll('[class*="toggle"]');
                let clicked = 0;

                for (const toggle of toggles) {
                  try {
                    // Check if it's collapsed
                    const content = toggle.querySelector('[class*="content"]');
                    if (content && content.offsetParent === null) {
                      const button = toggle.querySelector('button, [role="button"], [class*="toggle-button"]');
                      if (button) {
                        button.click();
                        clicked++;
                        await new Promise(r => setTimeout(r, 300));
                      }
                    }
                  } catch(e) {}
                }

                // Also try clicking summary/details elements
                document.querySelectorAll('details:not([open])').forEach(d => {
                  try {
                    d.click();
                    clicked++;
                  } catch(e) {}
                });

                // Click on callout headers that might hide content
                document.querySelectorAll('[class*="callout"]').forEach(c => {
                  try {
                    const header = c.querySelector('[class*="header"], h3, h2');
                    if (header && header.textContent.includes('Campanhas')) {
                      header.click();
                    }
                  } catch(e) {}
                });

                // Scroll to load lazy content
                window.scrollTo(0, document.body.scrollHeight);
                await new Promise(r => setTimeout(r, 2000));
                window.scrollTo(0, 0);
                await new Promise(r => setTimeout(r, 1000));

                return 'Expanded ' + clicked + ' toggles';
              })()
            `,
            returnByValue: true
          }
        }));
      },
      // Step 3: Extract full structure
      () => {
        console.log('  [3/5] Extraindo estrutura...');
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
                  structure: [],
                  linkedDatabases: []
                };

                // Get main content area only (exclude sidebar)
                const mainContent = document.querySelector('[class*="frame"], [class*="content"], main, [role="main"]') || document.body;

                // Find all database/collection blocks
                const dbSelectors = [
                  '[class*="collection"]',
                  '[class*="database"]',
                  '[class*="table-view"]',
                  '[class*="board-view"]',
                  '[class*="list-view"]',
                  '[class*="gallery-view"]',
                  '[class*="timeline-view"]',
                  '[data-block-type="collection_view"]'
                ];

                const seenDatabases = new Set();

                dbSelectors.forEach(sel => {
                  mainContent.querySelectorAll(sel).forEach(db => {
                    // Skip if in sidebar
                    if (db.closest('[class*="sidebar"], [class*="panel"], nav')) return;

                    const info = {
                      title: '',
                      type: 'database',
                      properties: [],
                      id: null
                    };

                    // Try to get database ID
                    const blockEl = db.closest('[data-block-id]');
                    if (blockEl) {
                      info.id = blockEl.dataset.blockId;
                    }

                    // Get title - try multiple selectors
                    const titleSelectors = [
                      '[class*="collection-title"]',
                      '[class*="database-title"]',
                      '[class*="title"]',
                      'h2', 'h3'
                    ];

                    for (const sel of titleSelectors) {
                      const titleEl = db.querySelector(sel);
                      if (titleEl && titleEl.textContent) {
                        const text = titleEl.textContent.trim();
                        // Avoid overly long or sidebar titles
                        if (text.length > 0 && text.length < 100) {
                          info.title = text;
                          break;
                        }
                      }
                    }

                    // Get properties/columns
                    const headerCells = db.querySelectorAll('[class*="header-cell"], th, [role="columnheader"]');
                    headerCells.forEach(h => {
                      const text = h.textContent?.trim();
                      if (!text || text.length === 0 || text.length > 50) return;

                      const allClasses = (h.className || '') + ' ' + (h.parentElement?.className || '');
                      const hasIcon = h.querySelector('[class*="icon"], svg');

                      let propType = 'text';

                      // Detect property type from class names and icons
                      if (allClasses.includes('relation') || h.querySelector('[class*="relation"]')) {
                        propType = 'relation';
                      } else if (allClasses.includes('rollup')) {
                        propType = 'rollup';
                      } else if (allClasses.includes('formula')) {
                        propType = 'formula';
                      } else if (allClasses.includes('multi-select') || allClasses.includes('multiSelect')) {
                        propType = 'multi_select';
                      } else if (allClasses.includes('select')) {
                        propType = 'select';
                      } else if (allClasses.includes('number')) {
                        propType = 'number';
                      } else if (allClasses.includes('date')) {
                        propType = 'date';
                      } else if (allClasses.includes('person') || allClasses.includes('user')) {
                        propType = 'person';
                      } else if (allClasses.includes('checkbox')) {
                        propType = 'checkbox';
                      } else if (allClasses.includes('url')) {
                        propType = 'url';
                      } else if (allClasses.includes('email')) {
                        propType = 'email';
                      } else if (allClasses.includes('phone')) {
                        propType = 'phone';
                      } else if (allClasses.includes('files')) {
                        propType = 'files';
                      } else if (allClasses.includes('created')) {
                        propType = 'created_time';
                      } else if (allClasses.includes('edited')) {
                        propType = 'last_edited';
                      }

                      info.properties.push({ name: text, type: propType });
                    });

                    // Create unique key to avoid duplicates
                    const key = info.title + '_' + info.properties.length;
                    if (!seenDatabases.has(key) && (info.title || info.properties.length > 0)) {
                      seenDatabases.add(key);
                      result.databases.push(info);
                    }
                  });
                });

                // Find linked database references
                mainContent.querySelectorAll('[class*="linked-database"], [class*="linked_view"]').forEach(link => {
                  const text = link.textContent?.trim();
                  if (text && text.length < 100) {
                    result.linkedDatabases.push(text);
                  }
                });

                // Extract relations and rollups from databases
                result.databases.forEach(db => {
                  db.properties.forEach(p => {
                    if (p.type === 'relation') {
                      result.relations.push({
                        from: db.title,
                        property: p.name
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

                // Find page structure - headings and sections
                mainContent.querySelectorAll('h1, h2, h3').forEach(h => {
                  // Skip sidebar
                  if (h.closest('[class*="sidebar"], [class*="panel"], nav')) return;

                  const text = h.textContent?.trim();
                  if (text && text.length > 0 && text.length < 100) {
                    result.structure.push({
                      type: 'heading',
                      level: h.tagName,
                      text: text
                    });
                  }
                });

                // Find clickable sub-pages/databases in the content
                mainContent.querySelectorAll('a[href*="notion.so"]').forEach(link => {
                  // Skip sidebar
                  if (link.closest('[class*="sidebar"], [class*="panel"], nav')) return;

                  const href = link.href;
                  const text = link.textContent?.trim();

                  if (text && text.length > 0 && text.length < 100) {
                    // Check if it looks like a database link
                    const dbPatterns = /Campanhas|Otimiza|Parametriza|Or-amento|Background|Performance|Vis-o|Experimentos/i;
                    if (dbPatterns.test(text)) {
                      result.structure.push({
                        type: 'database_link',
                        text: text,
                        href: href
                      });
                    }
                  }
                });

                // Find toggle/callout blocks
                mainContent.querySelectorAll('[class*="toggle"], [class*="callout"]').forEach(block => {
                  // Skip sidebar
                  if (block.closest('[class*="sidebar"], [class*="panel"], nav')) return;

                  const text = block.textContent?.trim()?.substring(0, 100);
                  if (text && (text.includes('Campanhas') || text.includes('Otimiza') || text.includes('Background'))) {
                    result.structure.push({
                      type: 'section',
                      text: text.substring(0, 60)
                    });
                  }
                });

                return result;
              })()
            `,
            returnByValue: true
          }
        }));
      },
      // Step 4: Scroll more and extract again
      () => {
        console.log('  [4/5] Segunda passagem (scroll)...');
        ws.send(JSON.stringify({
          id: 4,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (async function() {
                // Scroll through the page slowly
                const height = document.body.scrollHeight;
                for (let i = 0; i < height; i += 500) {
                  window.scrollTo(0, i);
                  await new Promise(r => setTimeout(r, 300));
                }
                window.scrollTo(0, 0);
                return 'scrolled ' + height + 'px';
              })()
            `,
            returnByValue: true
          }
        }));
      },
      // Step 5: Final extraction
      () => {
        console.log('  [5/5] Extracao final...');
        ws.send(JSON.stringify({
          id: 5,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              (function() {
                const result = {
                  extraDatabases: [],
                  extraStructure: []
                };

                const mainContent = document.querySelector('[class*="frame"], [class*="content"], main, [role="main"]') || document.body;

                // Look for any table-like structures we might have missed
                mainContent.querySelectorAll('table, [role="table"], [class*="table"]').forEach(t => {
                  // Skip sidebar
                  if (t.closest('[class*="sidebar"], nav')) return;

                  const info = { title: '', properties: [] };

                  // Get headers
                  t.querySelectorAll('th, [role="columnheader"]').forEach(h => {
                    const text = h.textContent?.trim();
                    if (text && text.length < 50) {
                      info.properties.push({ name: text, type: 'unknown' });
                    }
                  });

                  if (info.properties.length > 0) {
                    result.extraDatabases.push(info);
                  }
                });

                // Look for Kanban boards
                mainContent.querySelectorAll('[class*="kanban"], [class*="board"]').forEach(b => {
                  if (b.closest('[class*="sidebar"], nav')) return;

                  const columns = [];
                  b.querySelectorAll('[class*="column"], [class*="lane"]').forEach(col => {
                    const title = col.querySelector('[class*="title"], h3, h4')?.textContent?.trim();
                    if (title) columns.push(title);
                  });

                  if (columns.length > 0) {
                    result.extraStructure.push({
                      type: 'kanban',
                      columns: columns
                    });
                  }
                });

                return result;
              })()
            `,
            returnByValue: true
          }
        }));
      }
    ];

    let results = {};

    ws.on('open', () => {
      ws.send(JSON.stringify({ id: 0, method: 'Runtime.enable' }));
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.method === 'Runtime.executionContextCreated' || msg.id === 0) {
          currentStep = 1;
          steps[0]();
          return;
        }

        // Store result
        if (msg.result?.result?.value !== undefined) {
          results[msg.id] = msg.result.result.value;
        }

        // Move to next step
        if (msg.id === 1) {
          setTimeout(() => { currentStep = 2; steps[1](); }, 4000);
        } else if (msg.id === 2) {
          setTimeout(() => { currentStep = 3; steps[2](); }, 1000);
        } else if (msg.id === 3) {
          results.main = msg.result?.result?.value;
          setTimeout(() => { currentStep = 4; steps[3](); }, 500);
        } else if (msg.id === 4) {
          setTimeout(() => { currentStep = 5; steps[4](); }, 2000);
        } else if (msg.id === 5) {
          results.extra = msg.result?.result?.value;
          ws.close();
          resolve(results);
        }
      } catch (e) {
        console.log('  [WARN] Erro no processamento: ' + e.message);
      }
    });

    ws.on('error', (err) => {
      console.log('  [ERROR] WebSocket: ' + err.message);
      resolve(null);
    });

    setTimeout(() => {
      ws.close();
      resolve(results);
    }, 60000);
  });
}

function formatType(type) {
  const map = {
    relation: '[REL]',
    rollup: '[RUP]',
    formula: '[FOR]',
    select: '[SEL]',
    multi_select: '[MSL]',
    date: '[DAT]',
    person: '[USR]',
    number: '[NUM]',
    checkbox: '[CHK]',
    url: '[URL]',
    text: '[TXT]',
    unknown: '[???]'
  };
  return map[type] || '[TXT]';
}

async function main() {
  console.log('');
  console.log('============================================================');
  console.log('  NOTION STRUCTURE MAPPER v2');
  console.log('============================================================');
  console.log('');

  try {
    const pages = await getCDPInfo();
    const notionPage = pages.find(p => p.url && p.url.includes('notion.so'));

    if (!notionPage) {
      console.log('[ERROR] Nenhuma pagina do Notion aberta no Comet');
      process.exit(1);
    }

    console.log('[OK] Conectado: ' + notionPage.title);
    console.log('');

    const wsUrl = notionPage.webSocketDebuggerUrl;

    const mainPages = [
      { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
      { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
      { name: 'CASA', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
    ];

    const allResults = [];

    for (const page of mainPages) {
      console.log('------------------------------------------------------------');
      console.log(' ' + page.name);
      console.log('------------------------------------------------------------');

      const results = await navigateAndExtract(wsUrl, page.url, page.name);

      if (results && results.main) {
        const data = results.main;

        console.log('');
        console.log('  DATABASES: ' + data.databases?.length);
        data.databases?.forEach((db, i) => {
          console.log('');
          console.log('    [' + (i+1) + '] ' + (db.title || '(sem titulo)'));
          db.properties?.forEach(p => {
            console.log('        ' + formatType(p.type) + ' ' + p.name);
          });
        });

        if (data.relations?.length > 0) {
          console.log('');
          console.log('  RELATIONS: ' + data.relations.length);
          data.relations.forEach(r => {
            console.log('    ' + r.from + ' -> [' + r.property + ']');
          });
        }

        if (data.rollups?.length > 0) {
          console.log('');
          console.log('  ROLLUPS: ' + data.rollups.length);
          data.rollups.forEach(r => {
            console.log('    ' + r.database + ': ' + r.property);
          });
        }

        console.log('');
        console.log('  ESTRUTURA:');
        data.structure?.slice(0, 20).forEach(s => {
          if (s.type === 'heading') {
            console.log('    ## ' + s.text.substring(0, 50));
          } else if (s.type === 'database_link') {
            console.log('    [DB] ' + s.text);
          } else if (s.type === 'kanban') {
            console.log('    [KANBAN] ' + s.columns?.join(' | '));
          }
        });

        allResults.push(data);
      }

      console.log('');
    }

    // Save results
    fs.writeFileSync('D:/workspace/notion-mapping-v2.json', JSON.stringify(allResults, null, 2));
    console.log('[SAVED] notion-mapping-v2.json');

    // Generate hierarchical output
    console.log('');
    console.log('============================================================');
    console.log('  ESTRUTURA HIERARQUICA');
    console.log('============================================================');

    allResults.forEach(r => {
      console.log('');
      console.log(r.pageName);
      console.log('|-- Links Externos');
      console.log('|   |-- Google Ads');
      console.log('|   |-- Meta Ads');
      console.log('|   |-- LinkedIn Ads');
      console.log('|-- Relatorios');
      console.log('|   |-- Performance');
      console.log('|-- Dia a Dia');

      r.databases?.forEach(db => {
        console.log('|   |-- ' + (db.title || 'Database'));
        db.properties?.slice(0, 10).forEach(p => {
          const rel = p.type === 'relation' ? ' (REL)' : '';
          const rup = p.type === 'rollup' ? ' (ROLLUP)' : '';
          console.log('|   |   |-- ' + p.name + rel + rup);
        });
      });

      console.log('|-- Sistema');
      console.log('|   |-- Background');
    });

    // Generate Mermaid
    let mermaid = 'graph TD\n';
    mermaid += '    subgraph Uhuru["Uhuru Comunicacao"]\n';

    allResults.forEach(r => {
      const id = r.pageName.replace(/[^a-zA-Z0-9]/g, '_');
      mermaid += '        ' + id + '["' + r.pageName + '"]\n';

      r.databases?.forEach(db => {
        if (db.title) {
          const dbId = id + '_' + db.title.replace(/[^a-zA-Z0-9]/g, '_');
          mermaid += '        ' + dbId + '["' + db.title + '"]\n';
          mermaid += '        ' + id + ' --> ' + dbId + '\n';
        }
      });
    });

    mermaid += '    end\n';

    fs.writeFileSync('D:/workspace/notion-structure-v2.mmd', mermaid);
    console.log('');
    console.log('[SAVED] notion-structure-v2.mmd');

  } catch (error) {
    console.log('[ERROR] ' + error.message);
    console.log(error.stack);
  }
}

main();
