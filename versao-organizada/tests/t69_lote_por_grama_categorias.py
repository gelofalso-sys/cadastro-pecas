from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':1400,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(url)
 for cat,val in [('Brincos','2'),('Colares','5')]:
  x=page.locator(f'[data-bh="0"] [data-bmv="0"][data-mcat="{cat}"]');x.fill(val);x.press('Tab')
 page.locator('[data-act="rom-abrir"]').first.click();page.locator('#romWrap textarea').fill('Impressão de Pedido\nNº Pedido: 12345\nItem Código Descrição Und. Qtde. Unit. Total\n1 61 LOTE GR 6,000 10,000 60,00\nTotal Produtos: 60,00');page.locator('#romWrap [data-act="rom-ler"]').click();lot=page.locator('#romWrap .rc.lote').first;lot.wait_for();lot.locator('[data-lotn]').fill('2');lot.locator('[data-act="lote-add"]').click();cards=page.locator('#romWrap .rc:has(.lote-tag)');assert cards.count()==2
 for i,(cat,peso) in enumerate([('Brincos','1'),('Colares','5')]):
  cards=page.locator('#romWrap .rc:has(.lote-tag)');cards.nth(i).locator('[data-rp="cat"]').select_option(label=cat);cards=page.locator('#romWrap .rc:has(.lote-tag)');cards.nth(i).locator('[data-rp="peso"]').fill(peso)
  cards.nth(i).locator('[data-rp="q"][data-b="ouro"]').fill('1')
 page.wait_for_timeout(500);cards=page.locator('#romWrap .rc:has(.lote-tag)');print('resumo',lot.locator('.lote-sum').inner_text());print('pesos',cards.locator('[data-rp="peso"]').evaluate_all('(es)=>es.map(e=>e.value)'));print('compras',cards.locator('[data-rp="custo"]').evaluate_all('(es)=>es.map(e=>e.value)'));print('banhos',cards.locator('[data-cb="ouro"]').all_inner_texts());assert cards.locator('[data-cb="ouro"]').all_inner_texts()==['banho R$ 2,00','banho R$ 25,00'];assert '6,000 g' in lot.locator('.lote-sum').inner_text()
 # Quantidade maior que o número de itens físicos não pode passar pela conferência.
 cards.first.locator('[data-rp="q"][data-b="ouro"]').fill('2');page.locator('#romCriar').click();assert page.locator('[data-act="rev-ok"]').is_disabled();assert 'adicione outro item' in page.locator('.rev').inner_text().lower();page.locator('[data-act="rev-fechar"]').first.click();cards=page.locator('#romWrap .rc:has(.lote-tag)');cards.first.locator('[data-rp="q"][data-b="ouro"]').fill('1')
 page.locator('#romCriar').click();assert page.locator('[data-act="rev-ok"]').is_enabled();page.locator('[data-act="rev-ok"]').click();page.locator('.rep [data-act="rel-fechar"]').click();page.wait_for_timeout(300)
 with page.expect_download() as d:
  page.evaluate("document.querySelector('#sideExp [data-act=xlsx]').click()")
  if page.locator('[data-act="exp-assim"]').is_visible():page.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(Path(d.value.path()).read_bytes()),data_only=False);ws=wb.active;h=[x.value for x in ws[1]];forms=[(ws.cell(k,h.index('Categoria')+1).value,ws.cell(k,h.index('Peso')+1).value,ws.cell(k,h.index('Custo do Banho de Ouro')+1).value,ws.cell(k,h.index('Quantidade')+1).value) for k in range(2,ws.max_row+1)]
 print('linhas exportadas',forms);assert any(c=='Brincos' and peso==1 and '*2' in str(formula) and q==1 for c,peso,formula,q in forms);assert any(c=='Colares' and peso==5 and '*5' in str(formula) and q==1 for c,peso,formula,q in forms);assert not errors,errors;wb.close();b.close();print('OK lote por grama: duas peças, categorias, taxas e fórmulas de banho')
