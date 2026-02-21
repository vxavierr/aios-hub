const { chromium } = require('playwright');

(async () => {
  console.log('🔌 Conectando ao Comet...\n');

  const browser = await chromium.connectOverCDP('http://localhost:9222', {
    timeout: 60000
  });

  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`📱 ${pages.length} páginas abertas`);
  pages.forEach((p, i) => console.log(`  ${i+1}. ${p.url().substring(0, 60)}...`));

  // Use the Notion page
  let page = pages.find(p => p.url().includes('notion.so'));
  if (!page) {
    page = await context.newPage();
  }

  // Databases to map
  const dbs = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  for (const db of dbs) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📊 DATABASE: ${db.name}`);
    console.log(`${'═'.repeat(50)}\n`);

    await page.goto(db.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Extract visible content
    const info = await page.evaluate(() => {
      // Page title
      const title = document.querySelector('h1, [class*="page-title"], [class*="title"]')?.textContent?.trim() || 'Sem título';

      // Get all column headers (database properties)
      const headers = [];
      document.querySelectorAll('[class*="header-cell"], [class*="column-header"], th, [role="columnheader"]').forEach(h => {
        const text = h.textContent?.trim();
        if (text && text.length > 0 && text.length < 50 && !headers.includes(text)) {
          headers.push(text);
        }
      });

      // Get property names from side panel if open
      const properties = [];
      document.querySelectorAll('[class*="property-name"], [class*="property-key"]').forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length < 50 && !properties.includes(text)) {
          properties.push(text);
        }
      });

      // Get view names
      const views = [];
      document.querySelectorAll('[role="tab"], [class*="view-tab"]').forEach(v => {
        const text = v.textContent?.trim();
        if (text && text.length < 30 && !views.includes(text)) {
          views.push(text);
        }
      });

      // Get first few rows content
      const rows = [];
      document.querySelectorAll('[class*="row"], tr').forEach((r, i) => {
        if (i < 5) {
          const cells = r.textContent?.trim().substring(0, 200);
          if (cells) rows.push(cells);
        }
      });

      // Check if it's a database or page
      const isDatabase = document.querySelector('[class*="collection"], [class*="database"], [class*="table-view"]');

      return { title, headers, properties, views, rows, isDatabase: !!isDatabase };
    });

    console.log(`📄 Título: ${info.title}`);
    console.log(`📁 Tipo: ${info.isDatabase ? 'DATABASE' : 'PAGE'}`);

    if (info.headers.length > 0) {
      console.log(`\n📋 COLUNAS/PROPRIEDADES:`);
      info.headers.forEach(h => console.log(`   • ${h}`));
    }

    if (info.properties.length > 0) {
      console.log(`\n⚙️ PROPRIEDADES (painel):`);
      info.properties.forEach(p => console.log(`   • ${p}`));
    }

    if (info.views.length > 0) {
      console.log(`\n👁️ VIEWS: ${info.views.join(', ')}`);
    }

    if (info.rows.length > 0) {
      console.log(`\n📝 PRIMEIRAS LINHAS:`);
      info.rows.forEach((r, i) => console.log(`   ${i+1}. ${r.substring(0, 80)}...`));
    }

    // Take screenshot
    await page.screenshot({ path: `D:/workspace/db-${db.name.replace(/[^a-z]/gi, '-')}.png` });
    console.log(`\n📸 Screenshot salvo`);
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log('✅ MAPEAMENTO COMPLETO');
  console.log(`${'═'.repeat(50)}`);

})();
