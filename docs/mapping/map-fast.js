const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 FAST MAPPING STARTED\n');
  const start = Date.now();

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so')) || context.pages()[0];

  const dbs = [
    { name: 'Ocupacional', id: 'a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', id: '7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', id: '1d6dbafb030280c682a2ff8c758db28b' }
  ];

  const results = [];

  for (const db of dbs) {
    const url = `https://www.notion.so/uhuru-comunicacao/${db.name.replace(/\s/g, '-')}-${db.id}`;
    console.log(`📊 ${db.name}...`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});

    // Wait for content to load
    await page.waitForSelector('[class*="collection"], [class*="table"], [class*="database"], [class*="property"]', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000); // Small delay for Notion to render

    const data = await page.evaluate(() => {
      const props = [];

      // Multiple selectors for Notion property headers
      const selectors = [
        '.notion-table-view-header-cell',
        '.notion-collection-view-header-cell',
        '[class*="header-cell"]',
        '[class*="property-name"]',
        '[data-content-editable-leaf="true"]'
      ];

      const seen = new Set();

      // Try each selector
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => {
          const text = el.textContent?.trim();
          if (text && text.length > 0 && text.length < 50 && !seen.has(text)) {
            seen.add(text);

            // Detect type
            const cls = el.className || '';
            const parent = el.parentElement?.className || '';
            const combined = cls + ' ' + parent;

            let type = 'text';
            if (combined.includes('select') && !combined.includes('multi')) type = 'select';
            else if (combined.includes('multi-select') || combined.includes('multi_select')) type = 'multi-select';
            else if (combined.includes('number')) type = 'number';
            else if (combined.includes('date')) type = 'date';
            else if (combined.includes('person') || combined.includes('user')) type = 'person';
            else if (combined.includes('relation')) type = 'relation';
            else if (combined.includes('rollup')) type = 'rollup';
            else if (combined.includes('formula')) type = 'formula';
            else if (combined.includes('checkbox')) type = 'checkbox';
            else if (combined.includes('url')) type = 'url';
            else if (combined.includes('email')) type = 'email';
            else if (combined.includes('phone')) type = 'phone';
            else if (combined.includes('file')) type = 'files';
            else if (combined.includes('created')) type = 'created_time';
            else if (combined.includes('last_edited')) type = 'last_edited';

            props.push({ name: text, type });
          }
        });
      }

      // Find views
      const views = [];
      document.querySelectorAll('[role="tab"], [class*="view-tab"], [class*="tab-item"]').forEach(t => {
        const v = t.textContent?.trim();
        if (v && v.length > 0 && v.length < 30 && !views.includes(v)) views.push(v);
      });

      // Find database title
      const title = document.querySelector('[class*="collection-title"], [class*="page-title"], h1')?.textContent?.trim() || 'Unknown';

      return { props, views, title };
    }).catch(() => ({ props: [], views: [], title: 'Unknown' }));

    results.push({
      database: db.name,
      title: data.title,
      url,
      properties: data.props,
      views: data.views
    });

    console.log(`   ✅ ${data.props.length} properties, ${data.views.length} views`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n⏱️ Done in ${elapsed}s\n`);

  console.log('='.repeat(60));
  console.log('📋 MAPPING RESULTS');
  console.log('='.repeat(60));

  for (const r of results) {
    console.log(`\nDATABASE: ${r.database}`);
    console.log(`URL: ${r.url}`);
    console.log(`\n├── Properties:`);
    if (r.properties.length === 0) {
      console.log(`│   └── (none found - may need manual inspection)`);
    } else {
      r.properties.forEach(p => console.log(`│   ├── ${p.name} (${p.type})`));
    }
    console.log(`├── Views: ${r.views.length > 0 ? r.views.join(', ') : 'Default'}`);
  }

  fs.writeFileSync('D:/workspace/notion-databases-mapping.json', JSON.stringify(results, null, 2));
  console.log('\n💾 Saved to: notion-databases-mapping.json');
})();
