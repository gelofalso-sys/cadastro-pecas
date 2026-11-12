"""Apelidos de categoria/subcategoria: digitar "argolinhas" no Categoria escolhe Brincos › Argolas (e o prefixo); "choker" escolhe Colares; no romaneio a descrição define a categoria."""
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(800)
    # cadastra o apelido da subcategoria Argolas (Cadastros › Categorias)
    pg.locator('#side [data-go="sec:cat"]').click();pg.wait_for_timeout(600)
    card=pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Brincos"]')).first
    if card.locator('.cx').count() and card.locator('.cx').first.inner_text().startswith('▾'):card.locator('.cx').first.click()
    x=pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Brincos"]')).first.locator('[data-sa="Argolas"]');x.fill('argolinhas; argola');x.press('Tab');pg.wait_for_timeout(300)
    card2=pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Colares"]')).first
    if card2.locator('.cx').count() and card2.locator('.cx').first.inner_text().startswith('▾'):card2.locator('.cx').first.click()
    pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Colares"]')).first.locator('[data-cf="apelidos"]').fill('colar');pg.locator('.card[data-cat]').filter(has=pg.locator('[data-cf="nome"][value="Colares"]')).first.locator('[data-cf="apelidos"]').press('Tab');pg.wait_for_timeout(300)
    pg.locator('#side [data-vis="tudo"]').click()
    # 1) subcategoria por apelido no campo Categoria
    pg.fill('#f-I','Colares');pg.press('#f-I','Tab');pg.wait_for_timeout(300)
    pg.fill('#f-I','argolinhas');pg.press('#f-I','Tab');pg.wait_for_timeout(600)
    print('categoria:',pg.input_value('#f-I'),'| sub:',pg.input_value('#f-J'),'| próxima',pg.locator('#proxRef').first.inner_text() if pg.locator('#proxRef').count() else '')
    assert pg.input_value('#f-I')=='Brincos' and pg.input_value('#f-J')=='Argolas'
    # 2) nome de subcategoria sem digitar a categoria (Choker) e plural/singular
    pg.fill('#f-I','choker');pg.press('#f-I','Tab');pg.wait_for_timeout(600)
    assert pg.input_value('#f-I')=='Colares' and pg.input_value('#f-J')=='Chokers',(pg.input_value('#f-I'),pg.input_value('#f-J'))
    # 3) apelido da categoria
    pg.fill('#f-I','colar');pg.press('#f-I','Tab');pg.wait_for_timeout(500);assert pg.input_value('#f-I')=='Colares'
    # 4) digitar o apelido direto na subcategoria
    pg.fill('#f-I','Brincos');pg.press('#f-I','Tab');pg.wait_for_timeout(300)
    pg.click('#f-J');pg.keyboard.type('argola');pg.keyboard.press('Tab');pg.wait_for_timeout(600)
    assert pg.input_value('#f-J')=='Argolas',pg.input_value('#f-J')
    # 5) romaneio: a descrição "argolinhas" define categoria e subcategoria
    pg.locator('[data-act="rom-abrir"]').first.click();pg.locator('#romWrap textarea').fill('Romaneio TESTE\nArgolinhas lisas [#900001] R$ 10,00 R$ 10,00 5 R$ 50,00\nValor Produtos R$ 50,00');pg.locator('#romWrap [data-act="rom-ler"]').click();pg.wait_for_timeout(800)
    c=pg.locator('#romWrap .rc:not(.lote)').first;print('romaneio:',c.locator('[data-rp="cat"]').input_value(),'/',c.locator('[data-rp="sub"]').input_value())
    assert c.locator('[data-rp="cat"]').input_value()=='Brincos' and c.locator('[data-rp="sub"]').input_value()=='Argolas'
    assert not err,err
    b.close();print('OK apelidos de categoria e subcategoria')
