from pathlib import Path
import os
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
from io import BytesIO
url=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':1200,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(url)
 page.locator('[data-tipo="conjunto"]').click();c=page.locator('#conj .conj-r[data-ci]');
 while c.count()<2:page.locator('#conj [data-act="comp-add"]').last.click()
 for i,(nome,qtd,peso,custo) in enumerate([('Brinco','3','1','2'),('Colar','2','2','3')]):
  row=c.nth(i);row.locator('[data-cp="desc"]').fill(nome);row.locator('[data-cp="qtd"]').fill(qtd);row.locator('[data-cp="peso"]').fill(peso);row.locator('[data-cp="custo"]').fill(custo)
 assert page.locator('#f-N').input_value()=='7' and page.locator('#f-P').input_value()=='12'
 c.first.locator('[data-cp="qtd"]').fill('0');page.locator('#form button[type="submit"]').first.click();assert 'quantidade' in page.locator('#gera').inner_text().lower();c.first.locator('[data-cp="qtd"]').fill('3')
 page.reload();page.wait_for_timeout(500);assert page.locator('#conj [data-cp="qtd"]').first.input_value()=='3';assert page.locator('#f-N').input_value()=='7';page.close()
 page=b.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(url);page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click();page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 12,00 R$ 12,00 2 R$ 24,00\nValor Produtos R$ 24,00');page.locator('#romWrap [data-act="rom-ler"]').click();rc=page.locator('#romWrap .rc').first;rc.locator('.rom-conjunto summary').click();rc.locator('[data-rcj="ativar"]').click()
 for i,(nome,qtd,peso,custo) in enumerate([('Brinco','3','1','2'),('Colar','2','2','3')]):
  row=rc.locator('[data-rcji]').nth(i);row.locator('[data-rcjf="desc"]').fill(nome);row.locator('[data-rcjf="qtd"]').fill(qtd);row.locator('[data-rcjf="peso"]').fill(peso);row.locator('[data-rcjf="custo"]').fill(custo)
 assert rc.locator('[data-rp="peso"]').input_value()=='7';assert rc.locator('[data-rp="custo"]').input_value()=='12';page.wait_for_timeout(1100);page.reload();page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click();rc=page.locator('#romWrap .rc').first;assert rc.locator('[data-rcjf="qtd"]').first.input_value()=='3';assert rc.locator('[data-rp="peso"]').input_value()=='7'
 rc.locator('[data-act="rom-div"]').click();page.locator('#romCriar').click();page.locator('[data-act="rev-ok"]').click();page.locator('.rep [data-act="rel-fechar"]').click();page.locator('[data-act="ir-lista"]').first.click()
 with page.expect_download() as d:
  page.locator('#mbar > [data-act="xlsx"]').click()
  if page.locator('[data-act="exp-assim"]').is_visible():page.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(Path(d.value.path()).read_bytes()),data_only=False);ws=wb.active;h=[x.value for x in ws[1]];assert ws.cell(2,h.index('Peso')+1).value==7;assert ws.cell(2,h.index('Custo de Compra')+1).value==12;wb.close();assert not errors,errors;b.close();print('OK quantidade manual e romaneio: validação, persistência e exportação')
