"""Qualquer item do romaneio pode virar lote (pesar peça por peça, numerado 1/N) e o lote pode ser desativado."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
def n(s):s=(s or '').strip();return float(s.replace('.','').replace(',','.')) if s else 0.0
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(800)
    pg.locator('[data-act="rom-abrir"]').first.click();pg.locator('#romWrap textarea').fill('Romaneio TESTE\nCorrente fina [#900001] R$ 10,00 R$ 10,00 4 R$ 40,00\nValor Produtos R$ 40,00');pg.locator('#romWrap [data-act="rom-ler"]').click();pg.wait_for_timeout(800)
    card=lambda:pg.locator('#romWrap .rc:not(.lote)')
    assert pg.locator('#romWrap .rc:not(.lote) [data-act="rom-lotear"]').count()==1,'botão em lote no cartão comum'
    pg.locator('#romWrap [data-act="rom-lotear"]').first.click();pg.wait_for_timeout(700)
    tags=pg.locator('#romWrap .lote-num').all_inner_texts();print('itens:',tags);assert tags==['1/4','2/4','3/4','4/4'],tags
    print('resumo:',pg.locator('#romWrap [data-lsum]').first.inner_text())
    cs=[n(card().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(4)];print('custos sem peso',cs);assert abs(sum(cs)-40)<0.005 and all(abs(c-10)<0.011 for c in cs),'sem pesos divide igual'
    for i,ps in enumerate(['1','1','2','4']):
        y=card().nth(i).locator('[data-rp="peso"]');y.fill(ps);y.press('Tab')
    pg.wait_for_timeout(300)
    cs=[n(card().nth(i).locator('[data-rp="custo"]').input_value()) for i in range(4)];print('custos por peso',cs);assert abs(sum(cs)-40)<0.005 and abs(cs[3]-20)<0.011 and abs(cs[0]-5)<0.011
    # desativar o lote volta ao cartão comum
    pg.locator('#romWrap [data-act="rom-lote-off"]').first.click();pg.wait_for_timeout(600)
    assert pg.locator('#romWrap .rc.lote').count()==0 and card().count()==1
    c=card().first;print('após desativar:',c.locator('[data-rp="custo"]').input_value(),c.locator('.rsum').inner_text().replace(chr(10),' ')[:60])
    assert c.locator('[data-rp="custo"]').input_value()=='10,00'
    assert not err,err
    b.close();print('OK qualquer item vira lote e pode ser desativado')
