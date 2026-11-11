from pathlib import Path
import os
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent / os.environ.get('CP_ARQUIVO_TESTE','Cadastro de Pecas - abrir no Chrome.html')).as_uri()
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge');q=b.new_page(viewport={'width':1200,'height':900});err=[];q.on('pageerror',lambda e:err.append(str(e)));q.goto(url);q.fill('#f-F','Descrição de teste');q.fill('#f-N','2');q.fill('#f-P','10')
 for x in q.locator('[id^="f-"][id$="-W"]').all():
  if x.is_visible():x.fill('1')
 q.locator('button.btn.pri.big[type="submit"]').click();q.wait_for_timeout(800)
 estado="""()=>{let s=document.querySelector('#sheet'),t=s.querySelector('table'),f=s.querySelector('tr[data-l] [data-c=F]'),g=s.querySelector('tr[data-l] [data-c=G]');return {sl:s.scrollLeft,width:t.offsetWidth,fx:f.getBoundingClientRect().x,gx:g.getBoundingClientRect().x,fy:f.getBoundingClientRect().y,gy:g.getBoundingClientRect().y,l:JSON.parse(localStorage.getItem('cadpecas4')).lanc}}"""
 for col in ('F','G'):
  q.locator('#sheet').evaluate('(e)=>e.scrollLeft=220');q.wait_for_timeout(100);before=q.evaluate(estado);q.locator(f'tr[data-l] [data-c="{col}"]').first.click();q.wait_for_timeout(150);after=q.evaluate(estado)
  assert before['sl']==after['sl'] and before['width']==after['width'] and abs(before['fx']-after['fx'])<1 and abs(before['gx']-after['gx'])<1 and abs(before['fy']-after['fy'])<1 and abs(before['gy']-after['gy'])<1,(col,before,after)
  assert before['l']==after['l'],col;q.locator('#celIn').press('Escape')
 q.locator('tr[data-l] [data-c="F"]').first.click();q.locator('#celIn').fill('Descrição alterada');q.locator('#celIn').press('Enter');q.wait_for_timeout(300);assert 'Descrição alterada' in q.locator('tr[data-l] [data-c="F"]').first.inner_text()
 assert not err,err;b.close();print('OK clique mantém posições e dados; edição explícita funciona')
