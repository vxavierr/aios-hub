# -*- coding: utf-8 -*-
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML_PATH = Path(__file__).parent / "uhuru-squad-orgchart.html"
OUT_PATH  = Path(__file__).parent / "uhuru-orgchart-screenshot.png"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1500, "height": 1000})
        await page.goto(f"file:///{HTML_PATH.as_posix()}")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(1)
        await page.screenshot(path=str(OUT_PATH), full_page=True)
        await browser.close()
        print(f"OK: {OUT_PATH}")

asyncio.run(main())
