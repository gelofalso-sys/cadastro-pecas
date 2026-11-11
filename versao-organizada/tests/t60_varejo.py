from pathlib import Path
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
from io import BytesIO
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':390,'height':844});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('#mobileMenu summary').click();q.locator('[data-mobile="act:rom-abrir"]').click();q.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
 q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54');q.locator('#romWrap [data-act="rom-ler"]').click();q.locator('#romWrap [data-act="rom-criar"]').click()
 txt=q.locator('.rev').inner_text();assert 'sem preço de varejo' not in txt and ('Sugestão' in txt or 'A definir' in txt),txt
 q.locator('[data-act="rev-ok"]').click();q.locator('.rep [data-act="rel-fechar"]').click();q.locator('[data-act="ir-lista"]').first.click()
 with q.expect_download() as d:
  q.locator('#mbar > [data-act="xlsx"]').click()
  if q.locator('[data-act="exp-assim"]').is_visible():q.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(d.value.path().read_bytes()),data_only=False);ws=wb.active;h=[c.value for c in ws[1]];assert ws.cell(2,h.index('Preço de Varejo')+1).value in (None,''), 'sugestão virou preço salvo';wb.close()
 assert not errors,errors;b.close();print('OK preço opcional: sugestão identificada e célula exportada vazia')
