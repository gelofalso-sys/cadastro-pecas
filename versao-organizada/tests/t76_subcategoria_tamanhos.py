"""Subcategoria digitada no formulário deve ligar a grade de tamanhos da categoria (Prata 925 › Anéis) e liberar as quantidades por tamanho;
nas outras subcategorias de Prata 925 e em Colares a quantidade simples continua disponível."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url)
    gi=lambda:pg.locator('[data-gi]').count()
    pg.fill('#f-I','Prata 925');pg.press('#f-I','Tab');pg.wait_for_timeout(400)
    assert gi()==0 and pg.locator('#f-ouro-W').is_enabled(),'sem subcategoria: quantidade simples'
    pg.click('#f-J');pg.keyboard.type('Anéis');pg.keyboard.press('Tab');pg.wait_for_timeout(600)
    assert gi()==15,('digitar a subcategoria Anéis deve mostrar os tamanhos',gi())
    for t in ('a12','a13'):pg.locator(f'label:has([data-gi="{t}"])').click()
    pg.fill('[data-qall="ouro"]','2');pg.fill('#f-F','Anel prata 925');pg.fill('#f-N','2');pg.fill('#f-P','10')
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    rows=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['I','J','K','W'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))")
    assert [r[2] for r in rows if r[3]=='2'][:2]==['12','13'],rows
    # outra subcategoria volta à quantidade simples
    pg.fill('#f-J','');pg.click('#f-J');pg.keyboard.type('Pulseiras');pg.keyboard.press('Tab');pg.wait_for_timeout(600)
    assert gi()==0 and pg.locator('#f-ouro-W').is_enabled()
    # Colares: quantidade simples em cada subcategoria
    pg.fill('#f-I','Colares');pg.press('#f-I','Tab');pg.wait_for_timeout(400)
    for sub in ('Chokers','Gargantilhas','Longos'):
        pg.fill('#f-J','');pg.click('#f-J');pg.keyboard.type(sub);pg.keyboard.press('Tab');pg.wait_for_timeout(400)
        assert pg.locator('#f-ouro-W').is_enabled(),sub
    assert not err,err
    b.close();print('OK subcategoria digitada liga a grade de tamanhos e as quantidades')
