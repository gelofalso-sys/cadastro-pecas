"""Lapidação: O que mudou, histórico legível, simulador de fator, passos/conferência/bulk/baixar do romaneio, conta das células de compra e varejo,
primeiros passos, validação inline, pendências agrupadas, arrastar categorias (ordem), baixar só deste romaneio."""
from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(1200)
    # primeiros passos (instalação nova)
    assert pg.locator('.primeiros').count()==1,'primeiros passos'
    pg.locator('[data-act="prim-ir"][data-p="banho"]').click();pg.wait_for_timeout(700)
    assert pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')||'{}').config&&1")!=None
    pg.locator('#side [data-vis="tudo"]').click();pg.wait_for_timeout(400)
    # O que mudou
    pg.locator('[data-act="novidades"]').first.click();pg.wait_for_timeout(300);assert 'Lote em qualquer cadastro' in pg.locator('.rep').inner_text();pg.locator('.rep [data-act="rel-fechar"]').click()
    # validação inline no campo de peso
    pg.locator('[data-act="tg-min"]').click() if 'Mostrar tudo' in pg.locator('[data-act="tg-min"]').inner_text() else None
    pg.fill('#f-F','Peça x');pg.fill('#f-N','abc');pg.wait_for_timeout(200)
    assert pg.locator('#f-N').get_attribute('aria-invalid')=='true' and pg.locator('.campo-msg').count()>=1,'erro no próprio campo'
    pg.fill('#f-N','2');pg.fill('#f-P','5');pg.wait_for_timeout(200);assert pg.locator('#f-N').get_attribute('aria-invalid') is None
    # simulador de fator
    pg.fill('#f-ouro-W','2');pg.locator('#f-prata-W').fill('')
    pg.locator('[data-act="simular-fator"]').click();pg.wait_for_timeout(300);t=pg.locator('.rep').inner_text();assert 'Simular fator' in t and 'Margem' in t,t[:200]
    pg.locator('.rep [data-act="sim-usar"][data-fator="3"]').first.click();pg.wait_for_timeout(300)
    assert pg.locator('[data-mk="ouro"]').first.input_value() in ('3','3,0'),pg.locator('[data-mk="ouro"]').first.input_value()
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    # conta das células de compra e varejo
    pg.locator('tr[data-l] [data-c="P"]').first.click();pg.wait_for_timeout(250);assert 'Compra:' in pg.locator('#selbar .sel-calculo').inner_text()
    pg.locator('tr[data-l] [data-c="V"]').first.click();pg.wait_for_timeout(250);assert 'varejo' in pg.locator('#selbar .sel-calculo').inner_text().lower()
    pg.keyboard.press('Escape');pg.wait_for_timeout(200)
    if pg.locator('form.lanc.editing').count():pg.locator('form.lanc.editing button:has-text("Cancelar")').first.click();pg.wait_for_timeout(300)
    # histórico legível
    pg.locator('[data-act="historico"]').click();pg.wait_for_timeout(500);h=pg.locator('.rep').inner_text();print('histórico:',h[:160].replace(chr(10),' | '));assert 'criou' in h and 'Voltar antes desta' in h
    pg.locator('.rep [data-act="rel-fechar"]').click();pg.wait_for_timeout(300)
    # romaneio: passos, bulk, conferência final, baixar deste romaneio
    pg.locator('#impBar [data-act="rom-abrir"]').first.click();pg.wait_for_timeout(600);print('romWrap:',repr(pg.locator('#romWrap').inner_text()[:80]),'| toast:',pg.locator('#toast').inner_text() if pg.locator('#toast').is_visible() else '-');pg.locator('#romWrap textarea').fill('Romaneio TESTE\nBrinco A [#900001] R$ 10,00 R$ 10,00 4 R$ 40,00\nBrinco B [#900002] R$ 5,00 R$ 5,00 2 R$ 10,00\nValor Produtos R$ 50,00');pg.locator('#romWrap [data-act="rom-ler"]').click();pg.wait_for_timeout(900)
    assert pg.locator('#romPassos li').count()==4,'passos do romaneio'
    pg.locator('#romWrap details.rom-bulk summary').click();pg.locator('[data-act="rom-bulk-div"]').click();pg.wait_for_timeout(300)
    assert [x for x in pg.locator('#romWrap [data-soma]').all_inner_texts()]==['4/4','2/2'],pg.locator('#romWrap [data-soma]').all_inner_texts()
    for i in range(2):
        y=pg.locator('#romWrap .rc').nth(i).locator('[data-rp="peso"]');y.fill('1');y.press('Tab')
    pg.locator('#romCriar').click();pg.wait_for_timeout(700)
    rev=pg.locator('.rev').inner_text();print('revisão:',[l for l in rev.split(chr(10)) if 'Lista' in l][:1]);assert 'Lista R$ 50,00' in rev and 'compra R$ 50,00' in rev
    pg.locator('[data-act="rev-ok"]').click();pg.wait_for_timeout(1300)
    with pg.expect_download() as dl:
        pg.locator('.rep [data-act="rel-xlsx"]').click();pg.wait_for_timeout(500)
        if pg.locator('[data-act="exp-assim"]').count() and pg.locator('[data-act="exp-assim"]').is_visible():pg.locator('[data-act="exp-assim"]').click()
    ws=load_workbook(BytesIO(Path(dl.value.path()).read_bytes())).active;rows=list(ws.iter_rows(min_row=2,values_only=True));print('linhas no xlsx desta criação',len(rows));assert len(rows)>=2
    # reordenar categorias por arrastar (ordem alterada)
    pg.locator('.rep [data-act="rel-fechar"]').click() if pg.locator('.rep [data-act="rel-fechar"]').count() else None
    pg.locator('#side [data-go="sec:cat"]').click();pg.wait_for_timeout(600)
    nomes=lambda:pg.locator('.card[data-cat] [data-cf="nome"]').evaluate_all("es=>es.map(e=>e.value)")[:3]
    n0=nomes();pg.locator('.card[data-cat="0"] [data-dk="cat"]').first.drag_to(pg.locator('.card[data-cat="2"]').first);pg.wait_for_timeout(1000)
    n1=nomes();print('ordem',n0,'→',n1);assert n1!=n0 and n1[2]==n0[0],(n0,n1)
    assert not err,err
    b.close();print('OK lapidação')
