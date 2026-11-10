"""Navegação móvel e cartões de romaneio, com teste de busca e desktop."""
import functools, http.server, os, socketserver, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge')
    page = browser.new_page(viewport={'width':390, 'height':844})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(Path(root, 'Cadastro de Pecas - abrir no Chrome.html').as_uri())
    assert not page.locator('header').is_visible()
    assert not page.locator('#vis').is_visible()
    page.locator('#mobileMenu summary').click()
    assert page.locator('#mobileSettings #autorIn').is_visible()
    assert page.locator('#mobileSettings #modSel').is_visible()
    page.locator('[data-mobile="sec:cat"]').click()
    assert page.locator('body').get_attribute('data-vis') == 'cad'
    page.locator('#mobileMenu summary').click()
    page.locator('[data-mobile="act:rom-abrir"]').click()
    page.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
    page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nBrinco [#900002] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 37,08')
    page.locator('#romWrap [data-act="rom-ler"]').click()
    assert page.locator('#romWrap .rc').count() == 2
    page.locator('#romWrap [data-act="rom-criar"]').click()
    page.locator('[data-act="rev-ok"]').click()
    page.locator('[data-act="rel-fechar"]').click()
    page.wait_for_timeout(1200)
    page.locator('#mobileMenu summary').click()
    page.locator('[data-mobile="act:rom-lista"]').click()
    page.locator('[data-act="rom-salvo-abrir"]').first.click()
    page.locator('[data-act="rom-revogar"]').first.wait_for()
    page.locator('[data-act="rom-partir"]').first.click()
    page.locator('[data-act="rom-partir-ok"]').click()
    assert page.locator('#romWrap .rc').count() == 4
    page.locator('[data-act="rom-juntar"]').first.click()
    assert page.locator('#romWrap .rc').count() == 2
    assert page.locator('[data-act="rom-revogar"]').count() == 2
    page.on('dialog', lambda d: d.accept())
    page.locator('[data-act="rom-revogar"]').first.click()
    assert page.locator('[data-act="rom-revogar"]').count() == 1
    page.locator('#romWrap [data-act="rom-fechar"]').click()
    page.keyboard.press('Control+z')
    page.wait_for_timeout(700)
    page.locator('#mobileMenu summary').click()
    page.locator('[data-mobile="act:rom-lista"]').click()
    page.locator('[data-act="rom-salvo-abrir"]').first.click()
    page.locator('[data-act="rom-revogar"]').first.wait_for()
    assert page.locator('[data-act="rom-revogar"]').count() == 2
    page.locator('[data-act="rom-revogar"]').first.click()
    assert page.locator('[data-act="rom-revogar"]').count() == 1
    page.locator('[data-act="rom-revogar-todas"]').click()
    assert page.locator('[data-act="rom-revogar"]').count() == 0
    assert page.locator('#romWrap .rc').count() == 2
    page.locator('#romWrap details.rom-bulk summary').click()
    page.locator('[data-rp="rb"][data-k="selmode"]').select_option('todas')
    page.locator('[data-act="rom-excluir-selecionadas"]').click()
    assert page.locator('#romWrap .rc').count() == 0
    page.keyboard.press('Control+z')
    page.wait_for_timeout(300)
    assert page.locator('#romWrap .rc').count() >= 1
    assert page.locator('[data-act="rom-revogar"]').count() == 0
    assert not errors, errors
    print('OK    revogar e excluir todos os itens selecionados')
    browser.close()

