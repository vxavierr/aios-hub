const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting detailed database mapping...\n');

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find(p => p.url().includes('notion.so'));

  // The 3 favorites databases to map
  const favoritesToMap = [
    { name: 'Ocupacional', url: 'https://www.notion.so/uhuru-comunicacao/Ocupacional-a9adbad0564948369cbbaf0ec544f066' },
    { name: 'AssisteMed', url: 'https://www.notion.so/uhuru-comunicacao/AssisteMed-7f240474e6d048109947206900b0312b' },
    { name: 'C.A.S.A.', url: 'https://www.notion.so/uhuru-comunicacao/C-A-S-A-1d6dbafb030280c682a2ff8c758db28b' }
  ];

  const mappingResults = [];

  for (const fav of favoritesToMap) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 MAPPING: ${fav.name}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      await page.goto(fav.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Extract database structure
      const dbStructure = await page.evaluate(() => {
        const result = {
          name: document.title,
          url: window.location.href,
          properties: [],
          relations: [],
          rollups: [],
          formulas: [],
          views: []
        };

        // Try to find property headers in the database
        const propertySelectors = [
          '[class*="property"]',
          '[class*="column"]',
          '[class*="header-cell"]',
          '.notion-table-view-header-cell',
          '.notion-board-view-header-cell',
          '.notion-list-view-header-cell',
          '.notion-gallery-view-header-cell',
          '.notion-timeline-view-header-cell',
          '.notion-calendar-view-header-cell'
        ];

        // Find all property type indicators
        const typeIndicators = document.querySelectorAll('[class*="property-type"], [class*="type-icon"]');
        typeIndicators.forEach(el => {
          const parent = el.closest('[class*="header"]');
          if (parent) {
            const name = parent.textContent?.trim();
            if (name && !result.properties.includes(name)) {
              result.properties.push(name);
            }
          }
        });

        // Find table headers directly
        const headers = document.querySelectorAll('.notion-table-view-header-cell, [role="columnheader"], th');
        headers.forEach(h => {
          const text = h.textContent?.trim();
          if (text && text.length > 0 && text.length < 100) {
            // Try to identify property type
            const classList = h.className || '';
            let type = 'unknown';

            if (classList.includes('select') || h.querySelector('[class*="select"]')) type = 'select';
            else if (classList.includes('multi-select') || h.querySelector('[class*="multi-select"]')) type = 'multi-select';
            else if (classList.includes('number') || h.querySelector('[class*="number"]')) type = 'number';
            else if (classList.includes('date') || h.querySelector('[class*="date"]')) type = 'date';
            else if (classList.includes('person') || h.querySelector('[class*="person"]')) type = 'person';
            else if (classList.includes('relation') || h.querySelector('[class*="relation"]')) type = 'relation';
            else if (classList.includes('rollup') || h.querySelector('[class*="rollup"]')) type = 'rollup';
            else if (classList.includes('formula') || h.querySelector('[class*="formula"]')) type = 'formula';
            else if (classList.includes('checkbox') || h.querySelector('[class*="checkbox"]')) type = 'checkbox';
            else if (classList.includes('url') || h.querySelector('[class*="url"]')) type = 'url';
            else if (classList.includes('email') || h.querySelector('[class*="email"]')) type = 'email';
            else if (classList.includes('phone') || h.querySelector('[class*="phone"]')) type = 'phone';
            else if (classList.includes('files') || h.querySelector('[class*="files"]')) type = 'files';
            else if (classList.includes('created') || h.querySelector('[class*="created"]')) type = 'created_time';
            else if (classList.includes('last_edited') || h.querySelector('[class*="last_edited"]')) type = 'last_edited';

            if (!result.properties.find(p => p.name === text)) {
              result.properties.push({ name: text, type });
            }
          }
        });

        // Find view tabs
        const viewTabs = document.querySelectorAll('[class*="view-tab"], [role="tab"]');
        viewTabs.forEach(tab => {
          const viewName = tab.textContent?.trim();
          if (viewName && viewName.length > 0 && viewName.length < 50) {
            result.views.push(viewName);
          }
        });

        // Get all text that might indicate relation/rollup
        const allText = document.body.innerText;
        const relationPattern = /→\s*([^\n]+)/g;
        let match;
        while ((match = relationPattern.exec(allText)) !== null) {
          if (match[1] && !result.relations.includes(match[1].trim())) {
            result.relations.push(match[1].trim());
          }
        }

        return result;
      });

      // Take screenshot of database
      const screenshotPath = `D:/workspace/db-${fav.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`📸 Screenshot: ${screenshotPath}`);

      mappingResults.push(dbStructure);

      console.log(`📌 Name: ${dbStructure.name}`);
      console.log(`🔗 URL: ${dbStructure.url}`);
      console.log(`\n📋 Properties (${dbStructure.properties.length}):`);
      dbStructure.properties.forEach(p => {
        if (typeof p === 'string') {
          console.log(`   - ${p}`);
        } else {
          console.log(`   - ${p.name} (${p.type})`);
        }
      });
      console.log(`\n👁️ Views: ${dbStructure.views.join(', ') || 'Default'}`);
      console.log(`\n🔗 Relations: ${dbStructure.relations.slice(0, 5).join(', ') || 'None found'}`);

    } catch (err) {
      console.error(`❌ Error mapping ${fav.name}:`, err.message);
      mappingResults.push({ name: fav.name, error: err.message });
    }
  }

  // Save complete results
  const outputPath = 'D:/workspace/notion-databases-mapping.json';
  fs.writeFileSync(outputPath, JSON.stringify(mappingResults, null, 2));
  console.log(`\n\n💾 Complete mapping saved to: ${outputPath}`);

  console.log('\n✅ Database mapping complete!');
})();
