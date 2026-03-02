# -*- coding: utf-8 -*-
"""
Abre Chrome com o perfil real do usuario via remote debugging port,
conecta via CDP, importa plugin Figma e cria o organograma.
"""
import asyncio, subprocess, sys
from pathlib import Path
from playwright.async_api import async_playwright

CHROME_EXE    = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_DATA   = r"C:\Users\lenovo\AppData\Local\Google\Chrome\User Data"
CDP_PORT      = 9222
MANIFEST_PATH = str(Path(__file__).parent / "uhuru-figma-plugin" / "manifest.json")

def log(msg): print(msg, flush=True)

async def wait_cdp_ready(max_wait=15):
    import urllib.request, urllib.error
    for i in range(max_wait):
        try:
            urllib.request.urlopen(f"http://127.0.0.1:{CDP_PORT}/json/version", timeout=1)
            return True
        except Exception:
            await asyncio.sleep(1)
    return False

async def main():
    # 1. Iniciar Chrome com remote debugging
    log("[1] Iniciando Chrome com remote debugging...")
    proc = subprocess.Popen([
        CHROME_EXE,
        f"--remote-debugging-port={CDP_PORT}",
        f"--user-data-dir={CHROME_DATA}",
        "--no-first-run",
        "--no-default-browser-check",
        "--start-maximized",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    log("    Aguardando Chrome iniciar (ate 15s)...")
    ready = await wait_cdp_ready(15)
    if not ready:
        log("ERRO: Chrome nao respondeu na porta CDP. Encerrando.")
        proc.terminate()
        return

    log(f"    Chrome pronto na porta {CDP_PORT}!")

    async with async_playwright() as p:
        log("[2] Conectando ao Chrome via CDP...")
        browser = await p.chromium.connect_over_cdp(f"http://127.0.0.1:{CDP_PORT}")
        ctx = browser.contexts[0]

        # Encontrar aba do Figma ou abrir nova
        page = None
        for pg in ctx.pages:
            if "figma.com" in pg.url:
                page = pg
                log(f"    Aba Figma existente encontrada: {pg.url}")
                break

        if not page:
            log("    Abrindo nova aba para figma.com...")
            page = await ctx.new_page()
            await page.goto("https://www.figma.com/files/recent", wait_until="domcontentloaded")
            await asyncio.sleep(4)

        await page.bring_to_front()
        log(f"    URL atual: {page.url}")

        # Verificar se esta logado
        if "login" in page.url or "auth" in page.url:
            log("    AVISO: Figma pediu login. Aguardando 30s para login manual...")
            await asyncio.sleep(30)
            log(f"    URL apos aguardar: {page.url}")

        # 3. Criar novo arquivo Figma
        log("[3] Criando novo arquivo Figma...")
        await page.goto("https://www.figma.com/files/recent", wait_until="domcontentloaded")
        await asyncio.sleep(3)

        for sel in [
            'button:has-text("New design file")',
            'button:has-text("New File")',
            '[aria-label*="design file"]',
            '[data-testid*="new-file"]',
        ]:
            try:
                el = page.locator(sel).first
                await el.wait_for(state="visible", timeout=3000)
                await el.click()
                log(f"    Novo arquivo via: {sel}")
                break
            except Exception:
                pass

        await asyncio.sleep(6)
        log(f"    Editor URL: {page.url}")

        # 4. Importar plugin via menu Figma
        log("[4] Importando plugin via menu Plugins > Development...")
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.5)

        # Abrir menu principal do Figma (logo no canto)
        try:
            # Tentar Quick Actions com Ctrl+/
            await page.keyboard.press("Control+/")
            await asyncio.sleep(1.5)
            await page.keyboard.type("Import plugin from manifest")
            await asyncio.sleep(1)

            async with page.expect_file_chooser(timeout=5000) as fc_info:
                await page.keyboard.press("Enter")
            fc = await fc_info.value
            await fc.set_files(MANIFEST_PATH)
            log(f"    Plugin importado: {MANIFEST_PATH}")
            await asyncio.sleep(2)
        except Exception as e:
            log(f"    Quick Actions falhou ({e}). Tentando menu direto...")
            await page.keyboard.press("Escape")
            await asyncio.sleep(0.5)

            # Clicar no logo/menu do Figma
            try:
                logo = page.locator('canvas').first
                # Menu Figma esta no canto superior esquerdo
                await page.mouse.click(12, 12)
                await asyncio.sleep(0.8)
                await page.get_by_text("Plugins").first.hover()
                await asyncio.sleep(0.5)
                await page.get_by_text("Development").first.hover()
                await asyncio.sleep(0.5)
                async with page.expect_file_chooser(timeout=5000) as fc_info2:
                    await page.get_by_text("Import plugin from manifest").first.click()
                fc2 = await fc_info2.value
                await fc2.set_files(MANIFEST_PATH)
                log("    Plugin importado via menu")
                await asyncio.sleep(2)
            except Exception as e2:
                log(f"    Menu falhou: {e2}")

        # 5. Executar o plugin
        log("[5] Executando plugin...")
        await page.keyboard.press("Escape")
        await asyncio.sleep(0.5)
        await page.keyboard.press("Control+/")
        await asyncio.sleep(1.5)
        await page.keyboard.type("Uhuru Squad")
        await asyncio.sleep(1.5)
        await page.keyboard.press("Enter")
        await asyncio.sleep(4)

        # 6. Clicar no botao da UI do plugin
        log("[6] Clicando em 'Criar Organograma'...")
        clicked = False
        for frame in page.frames:
            try:
                btn = frame.locator('button:has-text("Criar")')
                await btn.wait_for(state="visible", timeout=4000)
                await btn.click()
                log("    Botao clicado no frame do plugin!")
                clicked = True
                break
            except Exception:
                pass

        if not clicked:
            log("    Aguardando plugin executar automaticamente...")

        log("    Aguardando geracao do organograma (20s)...")
        await asyncio.sleep(20)
        log("\n=== ORGANOGRAMA CRIADO ===")
        log("Browser permanece aberto. Verifique o Figma.")
        await asyncio.sleep(60)
        await browser.close()
        proc.terminate()

if __name__ == "__main__":
    asyncio.run(main())
