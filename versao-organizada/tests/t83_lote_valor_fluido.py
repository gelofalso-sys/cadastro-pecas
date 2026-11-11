"""Lote por grama sem informar peso real: o valor da grama é fluido. 1º item de 1 g custa o lote inteiro (R$ 1.197,17) e o valor se ajusta a cada item até o último fechar a conta."""
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
    lot=pg.locator('#romWrap .rc.lote').first;lot.locator('[data-lotn]').fill('3');lot.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(400)
    cards=lambda:pg.locator('#romWrap .rc:not(.lote)')
    custos=lambda k:[n(cards().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(k)]
    def peso(i,v):y=cards().nth(i).locator('[data-rp="peso"]');y.fill(v);y.press('Tab');pg.wait_for_timeout(250)
    peso(0,'1');c=custos(1);print('1 item de 1 g:',c);assert abs(c[0]-1197.17)<0.005
    peso(1,'36');c=custos(2);print('+36 g:',c);assert abs(sum(c)-1197.17)<0.005 and abs(c[0]-round(1197.17/37,2))<0.011
    peso(2,'40');c=custos(3);print('+40 g (77 g no total):',c,round(sum(c),2));assert abs(sum(c)-1197.17)<0.005 and abs(c[2]-round(40*1197.17/77,2))<0.011
    r=pg.locator('#romWrap [data-lsum]').first.inner_text();print(r);assert 'até agora' in r and 'muda a cada item' in r
    assert not err,err
    b.close();print('OK valor da grama fluido no lote')
