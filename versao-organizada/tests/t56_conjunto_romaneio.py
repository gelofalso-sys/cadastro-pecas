from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent / 'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge'); page=b.new_page(viewport={'width':390,'height':844}); errors=[]
 page.on('pageerror',lambda e: errors.append(str(e)));page.goto(url)
 page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click()
 page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54')
 page.locator('#romWrap [data-act="rom-ler"]').click();rc=page.locator('#romWrap .rc').first
 rc.locator('.rom-conjunto summary').click();rc.locator('[data-rcj="ativar"]').click()
 for i,(nome,peso,custo) in enumerate([('Colar','0,334','0,33'),('Brinco','0,333','0,67')]):
  item=rc.locator('[data-rcji]').nth(i);item.locator('[data-rcjf="desc"]').fill(nome);item.locator('[data-rcjf="peso"]').fill(peso);item.locator('[data-rcjf="custo"]').fill(custo)
 rc.locator('[data-rcjf="banho"]').nth(1).select_option('-')
 assert rc.locator('[data-rp="peso"]').input_value()=='0,667'
 assert rc.locator('[data-rp="custo"]').input_value()=='1'
 assert rc.locator('[data-rp="peso"]').get_attribute('readonly') is not None
 page.wait_for_timeout(1200);page.reload();page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click();rc=page.locator('#romWrap .rc').first
 assert rc.locator('[data-rcjf="peso"]').first.input_value()=='0,334'
 assert rc.locator('[data-rp="peso"]').input_value()=='0,667'
 page.on('dialog',lambda d: d.accept())
 rc.locator('[data-act="rom-div"]').click()
 page.locator('[data-act="rom-criar"]').click()
 page.locator('[data-act="rev-ok"]').click()
 page.wait_for_timeout(500)
 assert '0,667 g' in page.locator('.rep').inner_text()
 assert '2,14' in page.locator('.rep').inner_text()
 page.locator('.rep [data-act="rel-fechar"]').click()
 page.locator('[data-act="ir-lista"]').first.click()
 with page.expect_download() as download:
  page.locator('#mbar > [data-act="xlsx"]').click()
  if page.locator('[data-act="exp-assim"]').is_visible(): page.locator('[data-act="exp-assim"]').click()
 from openpyxl import load_workbook
 wb=load_workbook(BytesIO(Path(download.value.path()).read_bytes()),data_only=False);ws=wb.active
 rows=list(ws.iter_rows(values_only=True));header=rows[0];data=rows[1:]
 col=lambda name:header.index(name)
 assert len(data)==2 and all(abs(row[col('Peso')]-0.667)<1e-9 for row in data)
 assert data[0][col('Custo de Compra')]==1
 assert data[0][col('Custo do Banho de Ouro')]==0.5
 assert data[1][col('Custo do Banho de Prata')]==0.51
 assert all(row[col('Custo do Banho de Verniz')]==0.14 for row in data)
 assert not errors,errors
 wb.close();b.close()
 print('OK conjunto em romaneio: componentes, totais e persistência')
