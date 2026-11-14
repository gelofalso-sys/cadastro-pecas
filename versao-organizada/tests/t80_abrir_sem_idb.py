"""Se o armazenamento IndexedDB do navegador não responde, a tela de recuperação mostra o detalhe técnico e permite "Abrir mesmo assim"."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1300,'height':900});err=[]
    pg.on('pageerror',lambda e:err.append(str(e)))
    pg.add_init_script("window.indexedDB.open=function(){const r={};setTimeout(()=>{if(r.onerror)r.onerror(new Event('error'))},0);return r}")
    pg.goto(url);pg.wait_for_timeout(1500)
    t=pg.locator('[role=alert]:visible').first.inner_text();print(t[:400])
    assert 'Detalhe técnico' in t and 'Abrir mesmo assim' in t and 'Tentar novamente' in t
    pg.get_by_text('Abrir mesmo assim').click();pg.wait_for_timeout(2500)
    assert pg.locator('[role=alert]:visible').count()==0 or 'Verificando' not in pg.locator('[role=alert]:visible').first.inner_text()
    pg.fill('#f-F','Peça teste');pg.fill('#f-N','1');pg.fill('#f-P','2');pg.fill('#f-ouro-W','1')
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    assert pg.locator('tr[data-l]').count()>=1,'o app funciona depois de abrir mesmo assim'
    b.close();print('OK abrir mesmo assim sem IndexedDB')
