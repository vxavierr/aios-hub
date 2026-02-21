const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Notion mapping...\n');

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  // Find Notion page
  let page = pages.find(p => p.url().includes('notion.so'));
  if (!page) {
    page = await context.newPage();
    await page.goto('https://www.notion.so/uhuru-comunicacao/3d8168c8215947bd98eb2147c3710b2e');
  }

  console.log('📄 Page:', page.url());
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);

  // Take screenshot for debugging
  await page.screenshot({ path: 'D:/workspace/notion-state.png', fullPage: false });
  console.log('📸 Screenshot saved: notion-state.png\n');

  // Try to find sidebar/favorites
  console.log('🔍 Looking for sidebar and favorites...\n');

  // Get page content structure
  const sidebarContent = await page.evaluate(() => {
    const results = {
      favorites: [],
      databases: [],
      sidebar: []
    };

    // Try to find sidebar elements
    const sidebarSelectors = [
      '[class*="sidebar"]',
      '[class*="Sidebar"]',
      '[class*="favorite"]',
      '[class*="Favorite"]',
      'nav',
      '[role="navigation"]'
    ];

    for (const selector of sidebarSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          results.sidebar.push({
            selector,
            count: elements.length,
            texts: Array.from(elements).slice(0, 5).map(el => el.textContent?.substring(0, 100))
          });
        }
      } catch (e) {}
    }

    // Find all links that might be favorites
    const links = document.querySelectorAll('a');
    const notionLinks = Array.from(links).filter(link =>
      link.href?.includes('notion.so') &&
      link.textContent?.trim()
    );

    results.favorites = notionLinks.slice(0, 20).map(link => ({
      text: link.textContent?.trim(),
      href: link.href
    }));

    // Find database-like elements
    const dbElements = document.querySelectorAll('[class*="collection"], [class*="database"], [class*="table"]');
    results.databases = Array.from(dbElements).map(el => ({
      className: el.className,
      text: el.textContent?.substring(0, 200)
    }));

    return results;
  });

  console.log('📊 SIDEBAR FOUND:');
  sidebarContent.sidebar.forEach(s => {
    console.log(`  ${s.selector}: ${s.count} elements`);
  });

  console.log('\n⭐ POTENTIAL FAVORITES/LINKS:');
  sidebarContent.favorites.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.text} -> ${f.href}`);
  });

  console.log('\n📁 DATABASE ELEMENTS:');
  console.log(JSON.stringify(sidebarContent.databases, null, 2));

  // Save full results
  const fs = require('fs');
  fs.writeFileSync('D:/workspace/notion-mapping-results.json', JSON.stringify(sidebarContent, null, 2));
  console.log('\n💾 Full results saved to: notion-mapping-results.json');

  // Don't close browser - just disconnect
  // await browser.close();
  console.log('\n✅ Mapping complete. Comet still running.');
})();
