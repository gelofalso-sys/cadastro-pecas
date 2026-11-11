"""Banho "sem cálculo" (ex.: Prata 925): letra, cor, cálculo e coluna opcionais na galvânica; categoria vendida por grama
(compra = peso × R$/g) que entra sem banho. Formulário e romaneio."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];dl=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:(dl.append(d.message),d.accept()));pg.goto(url)
    # 1) banho "Prata" da galvânica vira um banho sem letra, sem cor, sem cálculo e sem coluna
    row=lambda:pg.locator('[data-bh="0"] [data-bn="1"]')
    l=row().locator('[data-bnf="letra"]');l.fill('');l.press('Tab');pg.wait_for_timeout(200)
    row().locator('[data-bnf="cor"]').select_option('');pg.wait_for_timeout(200)
    row().locator('[data-bnf="modo"]').select_option('nenhum');pg.wait_for_timeout(200)
    row().locator('[data-bnf="coluna"]').select_option('');pg.wait_for_timeout(300)
    m=pg.locator('[data-bh="0"] [data-bmc="1"][data-mcat="__padrao"]');m.fill('');m.press('Tab');pg.wait_for_timeout(300)   # sem milésimos
    assert row().locator('[data-bnf="letra"]').input_value()=='' and row().locator('[data-bnf="modo"]').input_value()=='nenhum' and row().locator('[data-bnf="coluna"]').input_value()=='' and row().locator('[data-bnf="cor"]').input_value()==''
    # fica gravado na configuração
    pg.wait_for_timeout(1200)
    bn=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config.banhistas[0].banhos[1]");print('banho gravado',{k:bn.get(k) for k in ('letra','cor','modo','coluna')})
    assert bn['modo']=='nenhum' and not bn.get('coluna') and not bn.get('letra') and not bn.get('cor'),bn
    # 2) peça bruta com os dois banhos: Ouro calcula, o banho sem cálculo só marca a linha
    pg.fill('#f-F','Pingente');pg.fill('#f-N','2');pg.fill('#f-P','5');pg.fill('#f-ouro-W','1');pg.fill('#f-prata-W','1')
    assert pg.locator('[data-bo="prata"][data-k="_m"]').count()==0,'banho sem cálculo não pede valor por grama'
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    rows=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['E','L','O','R','S','T','U','W'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))");print(rows)
    assert len(rows)==2
    ouro=[r for r in rows if r[3]!=''];sem=[r for r in rows if r[3]=='']
    assert len(ouro)==1 and len(sem)==1,rows
    assert sem[0][4:7]==['','',''] and sem[0][1]=='' and sem[0][2]=='' ,('linha sem cálculo: sem banho, verniz, cor e milésimos',sem)
    assert not sem[0][0][-1].isalpha(),sem[0][0]
    # 3) categoria vendida por grama: Prata 925 sem banho, compra = peso × R$/g
    pg.locator('#side [data-go="sec:cat"]').click();pg.wait_for_timeout(600)
    CARD=lambda:pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Prata 925"]')).first
    if CARD().locator('.cx').count() and CARD().locator('.cx').first.inner_text().startswith('▾'):CARD().locator('.cx').first.click()
    CARD().locator('[data-cf="semBanho"]').check();pg.wait_for_timeout(300)
    x=CARD().locator('[data-cf="compraGrama"]');x.fill('12,5');x.press('Tab');pg.wait_for_timeout(400)
    pg.locator('#side [data-vis="tudo"]').click()
    pg.locator('[data-act="limpar"]').first.click();pg.wait_for_timeout(300)
    pg.fill('#f-I','Prata 925');pg.press('#f-I','Tab');pg.wait_for_timeout(500)
    assert pg.locator('[data-tipo="pronta"]').get_attribute('aria-pressed')=='true','sem banho: tipo Pronta'
    pg.fill('#f-F','Corrente prata');pg.fill('#f-N','2');pg.press('#f-N','Tab');pg.wait_for_timeout(400)
    assert pg.input_value('#f-P')=='25,00','compra = 2 g × 12,5: '+pg.input_value('#f-P')
    pg.fill('#f-N','3');pg.press('#f-N','Tab');pg.wait_for_timeout(300);assert pg.input_value('#f-P')=='37,50',pg.input_value('#f-P')
    pg.fill('#f-W','4');pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    r=pg.locator('tr[data-l]').evaluate_all("es=>es.map(e=>['E','I','N','P','R','S','T','U','W'].map(k=>e.querySelector('[data-c='+k+']').innerText.trim()))")[-1];print(r)
    assert r[3]=='37,50' and r[4:8]==['','','',''] and r[8]=='4' and not r[0][-1].isalpha(),r
    # 4) romaneio: categoria sem banho -> custo calculado e uma linha só
    pg.locator('[data-act="rom-abrir"]').first.click();pg.locator('#romWrap textarea').fill('Romaneio TESTE\nCorrente [#900001] R$ 0,00 R$ 0,00 3 R$ 0,00\nValor Produtos R$ 0,00');pg.locator('#romWrap [data-act="rom-ler"]').click();pg.wait_for_timeout(600)
    c=lambda:pg.locator('#romWrap .rc:not(.lote)').first
    c().locator('[data-rp="cat"]').select_option(label='Prata 925');pg.wait_for_timeout(400)
    c().locator('[data-rp="custo"]').fill('');c().locator('[data-rp="peso"]').fill('2');c().locator('[data-rp="peso"]').press('Tab');pg.wait_for_timeout(400)
    print('custo auto',c().locator('[data-rp="custo"]').input_value(),'| linhas',c().locator('.rc-pc .rch').count())
    assert c().locator('[data-rp="custo"]').input_value()=='25,00' and c().locator('.rc-pc .rch').count()==1,c().locator('.rc-vr').inner_text()
    assert not err,err
    b.close();print('OK banho sem cálculo/letra/cor/coluna e categoria por grama sem banho')
