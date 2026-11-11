from pathlib import Path
import os
from io import BytesIO
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1200,'height':900});errs=[];q.on('pageerror',lambda e:errs.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('[data-bh="0"] [data-bn="0"] [data-bnf="modo"]').select_option('fixo')
 for banho,cat,valor in [('0','Brincos','2'),('0','Colares','5'),('1','Brincos','3'),('1','Colares','6')]:
  x=q.locator(f'[data-bh="0"] [data-bmv="{banho}"][data-mcat="{cat}"]');x.fill(valor);x.press('Tab')
 q.wait_for_timeout(900);q.evaluate('document.activeElement.blur()');q.set_viewport_size({'width':390,'height':844});q.locator('#mobileMenu summary').click();q.locator('[data-mobile="act:rom-abrir"]').click()
 q.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54');q.locator('#romWrap [data-act="rom-ler"]').click();rc=q.locator('#romWrap .rc').first
 rc.locator('.rom-conjunto summary').click();rc.locator('[data-rcj="ativar"]').click()
 for i,(nome,peso,custo,cat) in enumerate([('Brinco','1','0,33','Brincos'),('Colar','2','0,67','Colares')]):
  item=rc.locator('[data-rcji]').nth(i);item.locator('[data-rcjf="desc"]').fill(nome);item.locator('[data-rcjf="qtd"]').fill(['3','2'][i]);item.locator('[data-rcjf="peso"]').fill(peso);item.locator('[data-rcjf="custo"]').fill(custo);item.locator('[data-rcjf="cat"]').select_option(cat)
 q.wait_for_timeout(1200);q.reload();q.locator('#mobileMenu summary').click();q.locator('[data-mobile="act:rom-abrir"]').click();rc=q.locator('#romWrap .rc').first
 assert rc.locator('[data-rcjf="cat"]').nth(0).input_value()=='Brincos';assert rc.locator('[data-rcjf="cat"]').nth(1).input_value()=='Colares'
 rc.locator('[data-act="rom-div"]').click();q.locator('[data-act="rom-criar"]').click();q.locator('[data-act="rev-ok"]').click();q.wait_for_timeout(500);q.locator('.rep [data-act="rel-fechar"]').click();q.locator('[data-act="ir-lista"]').first.click()
 with q.expect_download() as d:
  q.locator('#mbar > [data-act="xlsx"]').click()
  if q.locator('[data-act="exp-assim"]').is_visible():q.locator('[data-act="exp-assim"]').click()
 wb=load_workbook(BytesIO(Path(d.value.path()).read_bytes()),data_only=False);ws=wb.active;h=[c.value for c in ws[1]];rows=list(ws.iter_rows(min_row=2,values_only=True));assert len(rows)>=1;assert rows[0][h.index('Custo do Banho de Ouro')]==16,rows[0][h.index('Custo do Banho de Ouro')];assert rows[1][h.index('Custo do Banho de Prata')]==33,rows[1][h.index('Custo do Banho de Prata')]
 assert not errs,errs;wb.close();b.close();print('OK banho por categoria e quantidade em duas variações exportadas: fixo R$ 16 e por peso R$ 33')
