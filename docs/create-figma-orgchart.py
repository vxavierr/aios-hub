"""
Cria o organograma da Uhuru Squad no FigJam
usando a sessão existente do Chrome do usuário.
"""

import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

CHROME_USER_DATA = os.path.expandvars(
    r"%LOCALAPPDATA%\Google\Chrome\User Data"
)

HTML_FILE = str(Path(__file__).parent / "uhuru-squad-orgchart.html")
HTML_URL = f"file:///{HTML_FILE.replace(chr(92), '/')}"


async def main():
    async with async_playwright() as p:
        print("Abrindo Chrome com sessao existente...")

        browser = await p.chromium.launch_persistent_context(
            user_data_dir=CHROME_USER_DATA,
            channel="chrome",
            headless=False,
            args=["--start-maximized"],
            no_viewport=True,
        )

        page = browser.pages[0] if browser.pages else await browser.new_page()

        # Passo 1: Screenshot do organograma HTML
        print("Gerando screenshot do organograma...")
        ref_page = await browser.new_page()
        await ref_page.goto(HTML_URL)
        await ref_page.wait_for_load_state("networkidle")
        await asyncio.sleep(1)

        screenshot_path = str(Path(__file__).parent / "uhuru-orgchart-screenshot.png")
        await ref_page.screenshot(
            path=screenshot_path,
            full_page=True,
        )
        print(f"Screenshot salvo: {screenshot_path}")

        # Passo 2: Abrir FigJam
        print("Abrindo FigJam...")
        await page.bring_to_front()
        await page.goto("https://www.figma.com/figjam/")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(3)

        print("\nPronto! FigJam aberto. Screenshot do organograma disponivel.")
        print(f"Arquivo: {screenshot_path}")
        await asyncio.sleep(5)

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
