"""Lote por grama (81,440 g = R$ 1.197,17): a galvânica pesa junto o insumo; sem ele o lote pesa 77 g. O valor do lote não muda e o valor por grama sobe."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
EL=Path(sys.argv[1]) if len(sys.argv)>1 else Path.home()/'Downloads'/'Pedido_59830 (1).pdf'
if not EL.exists():print('PULADO: PDF não encontrado',EL);sys.exit(0)
def n(s):s=(s or '').strip();return float(s.replace('.','').replace(',','.')) if s else 0.0
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url)
    pg.locator('#impFile').set_input_files(str(EL));pg.wait_for_selector('#romWrap .rc',timeout=20000);pg.wait_for_timeout(1200)
    lot=pg.locator('#romWrap .rc.lote').first
    x=lot.locator('[data-rp="lotpr"]');x.fill('77');x.press('Tab');lot.locator('[data-lotn]').fill('3');lot.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(400)
    cards=lambda:pg.locator('#romWrap .rc:not(.lote)')
    taxa=1197.17/77
    for i,ps in enumerate(['30','30']):
        y=cards().nth(i).locator('[data-rp="peso"]');y.fill(ps);y.press('Tab')
    pg.wait_for_timeout(300)
    c=[n(cards().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(2)]
    print('com 2 itens (lote ainda aberto)',c,'esperado',round(30*taxa,2));assert all(abs(v-round(30*taxa,2))<0.011 for v in c),'enquanto o lote está aberto, cada item custa peso × valor por grama real'
    assert 'faltam' in pg.locator('#romWrap [data-lsum]').first.inner_text()
    y=cards().nth(2).locator('[data-rp="peso"]');y.fill('17');y.press('Tab');pg.wait_for_timeout(300)
    c=[n(cards().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(3)];resumo=pg.locator('#romWrap [data-lsum]').first.inner_text();print(c,round(sum(c),2));print(resumo)
    assert abs(sum(c)-1197.17)<0.005,'fechou o peso real: soma = valor do lote'
    assert '15,5477' in resumo and '14,7' in resumo and 'bate' in resumo,resumo
    for i in range(3):
        cards().nth(i).locator('[data-rp="cat"]').select_option(label='Masculinos');cards().nth(i).locator('[data-act="rom-div"]').click()
    pg.locator('#romCriar').click();pg.wait_for_timeout(700)
    pg.locator('[data-act="rev-ok"]').click();pg.wait_for_timeout(1500)
    rows=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['N','P'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))");print(rows)
    assert abs(sum(n(r[1]) for r in rows)-1197.17)<0.005,rows
    assert not err,err
    b.close();print('OK lote por grama com peso real: o valor por grama sobe e o lote continua R$ 1.197,17')
