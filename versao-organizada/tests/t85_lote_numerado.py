"""Criar em lote: N peças separadas numeradas i/N na tabela, pelo formulário e pelos itens de um lote por grama do romaneio."""
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
EL=Path.home()/'Downloads'/'Pedido_59830 (1).pdf'
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(800)
    # 1) formulário: Em lote de 4
    pg.fill('#f-F','Argola lote');pg.fill('#f-N','1');pg.fill('#f-P','2');pg.fill('#f-ouro-W','1');pg.locator('#f-prata-W').fill('')
    pg.locator('[data-f="loteN"]').fill('4');pg.locator('[data-f="loteN"]').press('Tab')
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(700)
    badges=pg.locator('#sheet tr[data-l] .loteN').all_inner_texts();print('selos:',badges)
    refs=pg.locator('#sheet tr[data-l] [data-c="E"]').all_inner_texts()
    nl=len([r for r in refs]);print('linhas',nl)
    assert [x for x in badges if x.endswith('/4')][:4]==['1/4','2/4','3/4','4/4'] or sorted(set(badges))==['1/4','2/4','3/4','4/4'],badges
    assert len(set(r.strip() for r in refs))==len(refs),'cada peça do lote tem referência própria'
    # sem lote (campo vazio) cria uma só
    pg.fill('#f-F','Peça simples');pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(500)
    assert pg.locator('#sheet tr[data-l] .loteN').count()==len(badges),'peça simples não ganha selo'
    # 2) romaneio por grama: itens do lote com i/N
    if EL.exists():
        pg.locator('#impFile').set_input_files(str(EL));pg.wait_for_selector('#romWrap .rc',timeout=20000);pg.wait_for_timeout(1000)
        lot=pg.locator('#romWrap .rc.lote').first;lot.locator('[data-lotn]').fill('3');lot.locator('[data-act="lote-add"]').click();pg.wait_for_timeout(400)
        tags=pg.locator('#romWrap .lote-num').all_inner_texts();print('cartões:',tags);assert tags[:3]==['1/3','2/3','3/3'],tags
        cards=lambda:pg.locator('#romWrap .rc:not(.lote)')
        for i in range(3):
            cards().nth(i).locator('[data-rp="cat"]').select_option(label='Masculinos');y=cards().nth(i).locator('[data-rp="peso"]');y.fill(str(10+i));y.press('Tab');cards().nth(i).locator('[data-act="rom-div"]').click()
        pg.locator('#romCriar').click();pg.wait_for_timeout(700);pg.locator('[data-act="rev-ok"]').click();pg.wait_for_timeout(1500)
        bd=pg.locator('#sheet tr[data-l] .loteN').all_inner_texts();print('selos após criar:',sorted(set(bd)));assert {'1/3','2/3','3/3'}<=set(bd)
    assert not err,err
    b.close();print('OK lote numerado i/N')
