from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':1400,'height':900});errors=[];page.on('pageerror',lambda e: errors.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(url)
 for cat,val in [('Brincos','1'),('Colares','3')]:
  inp=page.locator(f'[data-bh="0"] [data-bmv="0"][data-mcat="{cat}"]');inp.fill(val);inp.press('Tab')
 page.locator('[data-act="rom-abrir"]').first.click();page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nPeça [#900001] R$ 10,00 R$ 10,00 2 R$ 20,00\nValor Produtos R$ 20,00');page.locator('#romWrap [data-act="rom-ler"]').click()
 r=page.locator('#romWrap .rc').first;r.locator('[data-rp="peso"]').fill('4');r.locator('[data-act="rom-div"]').click();r.locator('[data-act="rom-partir"]').click();r.locator('[data-act="rom-partir-ok"]').click();cards=page.locator('#romWrap .rc:not(.lote)');assert cards.count()==3
 cards.nth(0).locator('[data-rp="cat"]').select_option(label='Brincos');cards=page.locator('#romWrap .rc:not(.lote)');cards.nth(1).locator('[data-rp="cat"]').select_option(label='Colares');cards=page.locator('#romWrap .rc:not(.lote)');page.wait_for_timeout(700)
 print('cats',[x.input_value() for x in cards.locator('[data-rp="cat"]').all()]);print('qtds',[[x.input_value() for x in r.locator('[data-rp="q"]').all()] for r in cards.all()]);print('banho',cards.locator('[data-cb="ouro"]').all_inner_texts())
 assert cards.nth(0).locator('[data-cb="ouro"]').inner_text()=='banho R$ 1,33';assert cards.nth(1).locator('[data-cb="ouro"]').inner_text()=='banho R$ 4,00';assert all(any(float((x or '0').replace(',','.'))>0 for x in [el.input_value() for el in c.locator('[data-rp="q"]').all()]) for c in cards.all());assert not errors,errors
 page.locator('#romCriar').click();page.locator('[data-act="rev-ok"]').click();page.locator('.rep [data-act="rel-fechar"]').click();page.wait_for_timeout(500)
 rows=page.locator('tr[data-l]').evaluate_all("es=>es.map(e=>({cat:e.querySelector('[data-c=I]')?.innerText, banho:e.querySelector('[data-c=R]')?.innerText, peso:e.querySelector('[data-c=N]')?.innerText}))")
 print('linhas',rows);assert any(r['cat']=='Colares' and r['banho']=='4,00' and r['peso']=='1,333' for r in rows);assert any(r['cat']=='Brincos' and r['banho']=='1,33' for r in rows)
 from openpyxl import load_workbook
 from io import BytesIO
 with page.expect_download() as d:
  page.evaluate("document.querySelector('#sideExp [data-act=xlsx]').click()")
  if page.locator('[data-act="exp-assim"]').is_visible():page.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(Path(d.value.path()).read_bytes()),data_only=False);ws=wb.active;h=[x.value for x in ws[1]];i=h.index('Categoria')+1;j=h.index('Custo do Banho de Ouro')+1;forms=[(ws.cell(k,i).value,ws.cell(k,j).value) for k in range(2,ws.max_row+1)]
 assert any(c=='Colares' and isinstance(f,str) and '*3' in f for c,f in forms),forms
 assert any(c=='Brincos' and isinstance(f,str) and '*1' in f for c,f in forms),forms
 wb.close();b.close();print('OK divisão: fórmulas de banho por categoria no XLSX')
