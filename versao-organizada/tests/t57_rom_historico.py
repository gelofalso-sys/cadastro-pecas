from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':390,'height':844});errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(url)
 page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click()
 page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nBrinco [#900002] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 37,08')
 page.locator('#romWrap [data-act="rom-ler"]').click();assert page.locator('#romWrap .rc').count()==2
 page.locator('#romWrap details.rom-bulk summary').click();page.locator('[data-rp="rb"][data-k="selmode"]').select_option('todas');page.locator('[data-act="rom-excluir-selecionadas"]').click()
 assert page.locator('#romWrap .rc').count()==0
 page.locator('#romWrap [data-act="rom-fechar"]').click();page.keyboard.press('Control+z');page.wait_for_timeout(700)
 page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-lista"]').click();page.locator('[data-act="rom-salvo-abrir"]').first.click();page.locator('#romWrap .rc').first.wait_for()
 assert page.locator('#romWrap .rc').count()==2
 page.keyboard.press('Control+y');page.wait_for_timeout(700);assert page.locator('#romWrap .rc').count()==0
 page.keyboard.press('Control+z');page.wait_for_timeout(700);assert page.locator('#romWrap .rc').count()==2
 page.locator('#romWrap [data-rp="desc"]').first.fill('Alteração posterior');page.locator('#romWrap [data-act="rom-fechar"]').focus();page.locator('#mobileMenu summary').click();page.keyboard.press('Control+y');page.wait_for_timeout(300)
 assert page.locator('#romWrap .rc').count()==2
 assert 'alterado depois' in page.locator('#toast').inner_text().lower()
 page.locator('.mobile-menu-close').click()
 page.locator('#romWrap [data-act="rom-fechar"]').click();page.reload();page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-lista"]').click();page.locator('[data-act="rom-salvo-abrir"]').first.click();page.locator('#romWrap .rc').first.wait_for()
 assert page.locator('#romWrap .rc').count()==2
 assert not errors,errors;b.close();print('OK desfazer e refazer exclusão após fechar; itens sem lançamento persistem')

