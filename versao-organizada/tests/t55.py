"""Navegação móvel e cartões de romaneio, com teste de busca e desktop."""
from pathlib import Path
from playwright.sync_api import sync_playwright

url = (Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge')
    page = browser.new_page(viewport={'width':390, 'height':844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url)
    assert not page.locator('header').is_visible()
    assert not page.locator('#vis').is_visible()
    page.locator('#mobileMenu summary').click()
    assert page.locator('#mobileSettings #autorIn').is_visible()
    assert page.locator('#mobileSettings #modSel').is_visible()
    page.locator('[data-mobile="sec:cat"]').click()
    assert page.locator('body').get_attribute('data-vis') == 'cad'
    page.locator('#mobileMenu summary').click()
    page.locator('[data-mobile="act:rom-abrir"]').click()
    page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54')
    page.locator('#romWrap [data-act="rom-ler"]').click()
    assert page.locator('#romWrap .rc').count() == 1
    page.locator('#romWrap [data-act="rom-fechar"]').click()
    page.wait_for_timeout(1200)
    page.locator('#mobileMenu summary').click()
    page.locator('[data-mobile="act:rom-lista"]').click()
    row = page.locator('.rep .rom-lista tbody tr').first
    assert row.is_visible() and row.locator('[data-act="rom-salvo-abrir"]').is_visible()
    assert row.evaluate('(e)=>getComputedStyle(e).display') == 'grid'
    search = page.locator('.rep-busca')
    search.fill('sem correspondencia')
    assert not row.is_visible()
    search.fill('xangai')
    assert row.is_visible()
    page.set_viewport_size({'width':1200, 'height':800})
    page.wait_for_function("getComputedStyle(document.querySelector('.rep .rom-lista tbody tr')).display === 'table-row'")
    page.wait_for_function("!!document.querySelector('#sideExp #autorIn')")
    if not page.locator('#sideExp #autorIn').is_visible(): page.locator('#sideT').click()
    assert page.locator('#sideExp #autorIn').is_visible()
    assert not errors, errors
    print('OK    menu, cartões, busca e desktop')
    browser.close()
