from pathlib import Path
import os
from playwright.sync_api import sync_playwright
u=(Path(__file__).resolve().parent.parent / ('publicar-netlify/index.html' if os.environ.get('CP_TESTAR_PACOTE')=='1' else 'Cadastro de Pecas - abrir no Chrome.html')).as_uri()
for w,h in [(1200,850),(390,844)]:
 with sync_playwright() as p:
  b=p.chromium.launch(channel='msedge');page=b.new_page(viewport={'width':w,'height':h});err=[];page.on('pageerror',lambda e:err.append(str(e)));page.on('dialog',lambda d:d.accept());page.goto(u)
  assert page.locator('.rom-atalho').is_visible()
  if w<900:
   page.locator('#mobileMenu summary').click();page.locator('[data-mobile="act:rom-abrir"]').click()
  else:page.locator('#impBar [data-act="rom-abrir"]').click()
  page.locator('#romWrap [data-act="rom-tipo"][data-v="pronta"]').click()
  page.locator('#romWrap textarea').fill('Romaneio do Link TESTE\nColar 45+5, [#900001] R$ 10,90 R$ 9,27 2 R$ 18,54\nValor Produtos R$ 18,54');page.locator('#romWrap [data-act="rom-ler"]').click();page.locator('#romWrap [data-act="rom-criar"]').click();page.locator('[data-act="rev-ok"]').click()
  report=page.locator('.rep');assert report.locator('[data-act="rom-salvo-abrir"]').is_visible();report.locator('[data-act="rom-salvo-abrir"]').click();page.locator('#romWrap .rc').first.wait_for(state='visible');assert page.locator('#romWrap .rc').count()==1
  page.locator('#romWrap [data-act="rom-fechar"]').click()
  if w<900:page.locator('#mbar [data-act="ir-lista"]').click()
  page.locator('.rom-atalho').click();page.locator('.rep [data-act="rom-salvo-abrir"]').first.click();page.locator('#romWrap .rc').first.wait_for(state='visible');assert not err,err
  print('OK acesso direto ao romaneio',w,'px',flush=True);b.close()
