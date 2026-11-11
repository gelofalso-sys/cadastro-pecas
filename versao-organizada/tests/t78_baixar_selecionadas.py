"""Baixar .xlsx só das peças selecionadas (barra de seleção em massa e barra da célula) e referência repetida como alerta, não bloqueio."""
from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
def baixa(pg,click):
    with pg.expect_download() as d:
        click()
        pg.wait_for_timeout(400)
        if pg.locator('[data-act="exp-assim"]').count() and pg.locator('[data-act="exp-assim"]').is_visible():pg.locator('[data-act="exp-assim"]').click()
    return d.value
def linhas(dl):
    ws=load_workbook(BytesIO(Path(dl.path()).read_bytes())).active;return list(ws.iter_rows(min_row=2,values_only=True)),[c.value for c in ws[1]]
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':900});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url)
    for i,nome in enumerate(['Brinco A','Brinco B','Brinco C']):
        pg.fill('#f-F',nome);pg.fill('#f-N','1');pg.fill('#f-P','2');pg.fill('#f-ouro-W','2');pg.locator('#f-prata-W').fill('')
        pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(500)
    assert pg.locator('tr[data-l]').count()>=3
    todos,_=linhas(baixa(pg,lambda:pg.locator('[data-act="xlsx"]').first.click()));print('linhas totais',len(todos))
    # seleciona 2 peças pelas caixas e baixa só elas
    pg.locator('tr[data-l] [data-sel]').nth(0).check();pg.locator('tr[data-l] [data-sel]').nth(2).check();pg.wait_for_timeout(300)
    assert pg.locator('#tools [data-act="b-xlsx"]').is_visible()
    sel,h=linhas(baixa(pg,lambda:pg.locator('#tools [data-act="b-xlsx"]').click()))
    desc=[r[h.index('Descrição')] for r in sel];print('selecionadas',desc);assert 0<len(sel)<len(todos),(len(sel),len(todos))
    assert not any('Brinco C' in str(x) for x in desc) and any('Brinco A' in str(x) for x in desc),desc
    # referência repetida vira alerta e o arquivo sai
    pg.locator('#tools [data-act="b-none"]').click()
    pg.locator('tr[data-l] [data-c="E"]').nth(1).click();ref0=pg.locator('tr[data-l] [data-c="E"]').nth(0).inner_text().strip()
    pg.locator('#celIn').fill(ref0);pg.locator('#celIn').press('Enter');pg.wait_for_timeout(400)
    todos2,_=linhas(baixa(pg,lambda:pg.locator('[data-act="xlsx"]').first.click()));print('com referência repetida saiu com',len(todos2),'linhas');assert len(todos2)==len(todos)
    assert not err,err
    b.close();print('OK baixar só selecionadas e referência repetida sem bloqueio')
