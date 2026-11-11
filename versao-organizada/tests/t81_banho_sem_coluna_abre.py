"""Configuração guardada com banho sem coluna (modo ainda 'Por grama') deve abrir normalmente (antes: 'reading opcoes' na abertura) e permitir lançar peças."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(1200)
    pg.fill('#f-F','x');pg.wait_for_timeout(1500)
    pg.evaluate("()=>{const d=JSON.parse(localStorage.getItem('cadpecas4'));d.config.banhistas[0].banhos[1].coluna='';d.config.banhistas[0].banhos[1].letra='';d.config.banhistas[0].banhos[1].cor='';localStorage.setItem('cadpecas4',JSON.stringify(d))}")
    pg.reload();pg.wait_for_timeout(2500)
    t=pg.locator('[role=alert]');assert t.count()==0 or 'Verificando' not in t.first.inner_text() and 'Não foi possível' not in t.first.inner_text(),t.first.inner_text()
    pg.fill('#f-F','Pingente');pg.fill('#f-N','2');pg.fill('#f-P','5');pg.fill('#f-ouro-W','1');pg.fill('#f-prata-W','1')
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(700)
    rows=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['E','R','T','U'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))");print(rows)
    assert len(rows)==2 and any(r[1]!='' for r in rows) and any(r[1]=='' and r[2]=='' for r in rows),rows
    pg.locator('[data-act="rom-abrir"]').first.click();pg.wait_for_timeout(600)
    assert not err,err
    b.close();print('OK banho sem coluna abre e lança')
