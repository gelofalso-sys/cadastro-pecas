from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('#impBar [data-act="rom-abrir"]').click();q.locator('#romWrap textarea').fill('Romaneio TESTE\nBrinco A [#900001] R$ 10,00 R$ 10,00 1 R$ 10,00\nBrinco B [#900002] R$ 10,00 R$ 10,00 1 R$ 10,00\nValor Produtos R$ 20,00');q.locator('#romWrap [data-act="rom-ler"]').click();q.wait_for_timeout(400)
 cards=lambda:q.locator('#romWrap .rc:not(.lote)')
 assert cards().count()==2;cards().nth(0).locator('[data-act="rom-div"]').click();cards().nth(1).locator('[data-act="rom-div"]').click();cards().nth(1).locator('[data-rp="use"]').uncheck();q.locator('#romCriar').click();q.locator('[data-act="rev-ok"]').click();q.locator('.rep [data-act="rom-salvo-abrir"]').click();q.wait_for_timeout(600)
 cards().nth(1).locator('[data-rp="use"]').check();q.locator('details.rom-ins summary').click();q.locator('[data-act="rins-add"]').click();q.locator('[data-rp="rins"][data-k="valor"]').fill('10');q.locator('[data-rp="rins"][data-k="valor"]').press('Tab');q.wait_for_timeout(400)
 q.locator('#romCriar').click();rev=q.locator('.rev');assert 'valor mudou' in rev.inner_text().lower(),rev.inner_text();assert q.locator('[data-act="rev-ok"]').is_disabled();q.locator('[data-act="rev-fechar"]').first.click();q.locator('[data-act="rom-refazer-todas"]').click();q.locator('#romCriar').click();rev=q.locator('.rev');assert q.locator('[data-act="rev-ok"]').is_enabled(),rev.inner_text();assert 'insumos aplicados R$ 10,00' in rev.inner_text(),rev.inner_text();q.locator('[data-act="rev-ok"]').click();q.wait_for_timeout(600)
 d=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4'))");assert len(d['lanc'])==2;assert all(float(str(x['v']['Q']).replace(',','.'))==5.5 for x in d['lanc']),[x['v'].get('Q') for x in d['lanc']]
 assert not errors,errors;b.close();print('OK rateio em etapas exige refazer anteriores e aplica total completo')

