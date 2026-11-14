from pathlib import Path
import os
from playwright.sync_api import sync_playwright

url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    browser = p.chromium.launch(channel=os.environ.get('CP_BROWSER','msedge'))
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url)
    assert not page.locator('header').is_visible()
    menu = page.locator('#mobileMenu')
    summary = menu.locator('summary')
    summary.click()
    assert page.locator('#mobileSettings #autorIn').is_visible()
    assert page.locator('#mobileSettings #modSel').is_visible()
    page.locator('.mobile-menu-close').click()
    assert menu.get_attribute('open') is None
    summary.click()
    page.locator('[data-mobile="sec:cat"]').click()
    assert page.locator('body').get_attribute('data-vis') == 'cad'
    assert menu.get_attribute('open') is None
    page.set_viewport_size({'width': 1200, 'height': 800})
    page.locator('#sideExp #autorIn').wait_for(state='attached')   # sem eval: a CSP da página não permite
    if not page.locator('#sideExp #autorIn').is_visible(): page.locator('#sideT').click()
    assert page.locator('#sideExp #autorIn').is_visible()
    page.set_viewport_size({'width': 390, 'height': 844})
    summary.click()
    assert page.locator('#mobileSettings #autorIn').is_visible()
    assert not errors, errors
    browser.close()
    print('OK menu mobile, fechar, cadastros e troca de tamanho')

