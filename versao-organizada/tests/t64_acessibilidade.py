from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1200,'height':900});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(url)
 q.fill('#f-F','Foto teclado');q.fill('#f-N','2');q.fill('#f-P','10')
 for e in q.locator('[id^="f-"][id$="-W"]').all():
  if e.is_visible():e.fill('1')
 q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(800)
 data=q.evaluate("JSON.parse(localStorage.getItem('cadpecas4'))");assert data['lanc'];data['lanc'][0]['ftR']=png;q.evaluate("v=>localStorage.setItem('cadpecas4',JSON.stringify(v))",data);q.reload();q.wait_for_timeout(1000)
 f=q.locator('tr[data-l] .tf button[data-act="tab-foto"]').first;f.wait_for();f.focus();q.keyboard.press('Enter');assert q.locator('.lbox img').get_attribute('src').startswith('data:image/');q.locator('.lbox [data-z="x"]').click()
 assert not errors,errors;b.close();print('OK foto da tabela acessível por teclado')
