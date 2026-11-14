"""Regressões: limpar medidas da próxima peça e exportar relatório após recarregar."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1400,'height':900});err=[];q.on('pageerror',lambda e:err.append(str(e)));q.on('dialog',lambda d:d.accept());q.goto(url)
 q.locator('#f-F').fill('Primeira peça');q.locator('#f-N').fill('2');q.locator('#f-P').fill('10');q.locator('#f-ouro-W').fill('1');q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(900)
 assert q.locator('#f-N').input_value()=='' and q.locator('#f-P').input_value()=='', 'peso e compra vazaram para próxima peça'
 # Quando o usuário marca explicitamente Lembrar nas colunas, as duas escolhas são respeitadas.
 data=json.loads(q.evaluate("localStorage.getItem('cadpecas4')"));data['config']['colcfg']['N']['manter']=True;data['config']['colcfg']['P']['manter']=True
 q.evaluate("d=>localStorage.setItem('cadpecas4',JSON.stringify(d))",data);q.reload();q.wait_for_timeout(700)
 q.locator('#f-F').fill('Segunda peça');q.locator('#f-N').fill('3');q.locator('#f-P').fill('11');q.locator('#f-ouro-W').fill('1');q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(900)
 assert q.locator('#f-N').input_value().replace(',','.') in ('3','3.00') and float(q.locator('#f-P').input_value().replace(',','.'))==11,'opção Lembrar foi ignorada'
 q.locator('#impBar [data-act="rom-abrir"]').click();q.locator('#romWrap textarea').fill('Romaneio TESTE\nBrinco [#900001] R$ 10,00 R$ 10,00 2 R$ 20,00\nValor Produtos R$ 20,00');q.locator('#romWrap [data-act="rom-ler"]').click();q.wait_for_timeout(400)
 q.locator('#romWrap [data-act="rom-div"]').first.click();q.locator('#romCriar').click();q.locator('[data-act="rev-ok"]').click();q.wait_for_timeout(1500)
 q.reload();q.wait_for_timeout(1000);q.evaluate("document.querySelector('[data-act=rel-abrir]').click()");q.locator('.rep [data-act="rel-xlsx"]').wait_for()
 with q.expect_download(timeout=20000) as d:
  q.locator('.rep [data-act="rel-xlsx"]').click()
  if q.locator('[data-act="exp-assim"]').is_visible():q.locator('[data-act="exp-assim"]').click()
 assert d.value.suggested_filename.endswith('.xlsx');assert not err,err
 b.close();print('OK campos da próxima peça e relatório exportado após recarga')
