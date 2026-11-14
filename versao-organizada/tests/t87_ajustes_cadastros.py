"""Fiscal de todas as categorias, galvânica rápida levando à página completa, Anel (migração + nome na planilha), padrão sem fornecedores/observações,
palavras da categoria/sub acima da descrição (com preenchimento automático), novo banho acima da tabela de milésimos."""
from pathlib import Path
from io import BytesIO
from playwright.sync_api import sync_playwright
from openpyxl import load_workbook
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge');pg=b.new_page(viewport={'width':1400,'height':1000});err=[];pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept());pg.goto(url);pg.wait_for_timeout(1000)
    cfg=lambda:pg.evaluate("()=>{pg=0;return JSON.parse(localStorage.getItem('cadpecas4')||'null')}") 
    pg.fill('#f-F','x');pg.wait_for_timeout(1500);pg.fill('#f-F','')
    C=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config")
    # 1) padrão sem fornecedores nem observações; categoria Anel
    assert C['fornecedores']==[] and C['observacoes']==[] and C['banhistas']==[],('padrão vazio',C['fornecedores'],C['observacoes'])
    assert 'Anel' in [c['nome'] for c in C['categorias']] and 'Anél' not in [c['nome'] for c in C['categorias']]
    # 2) migração de uma configuração antiga com "Anél" (gravada antes de a página abrir)
    import json
    d=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4'))")
    for c in d['config']['categorias']:
        if c['nome']=='Anel':c['nome']='Anél'
    d['form']['v']['I']='Anél'
    pg.close();pg=b.new_page(viewport={'width':1400,'height':1000});pg.on('pageerror',lambda e:err.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.add_init_script("if(!localStorage.getItem('jaPreparado')){localStorage.setItem('cadpecas4',%s);localStorage.setItem('jaPreparado','1')}"%json.dumps(json.dumps(d)))
    pg.goto(url);pg.wait_for_timeout(2500)
    C=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config");a=[c for c in C['categorias'] if c['nome']=='Anel']
    assert a and a[0].get('nomeExport')!='Anél' and not any(c['nome']=='Anél' for c in C['categorias']),'migrou Anél → Anel corrigindo o nome da planilha'
    # Dados controlados para os testes de lançamento, após verificar a instalação vazia.
    pg.evaluate("""()=>{const d=JSON.parse(localStorage.getItem('cadpecas4'));d.config.banhistas=[{id:'teste',nome:'Teste',verniz:'0',vernizOn:false,banhos:[{id:'ouro',nome:'Ouro',letra:'A',cor:'Ouro',mil:'1',modo:'peso',mult:'1',coluna:'R',sufixo:'',marcado:true},{id:'prata',nome:'Prata',letra:'B',cor:'Prata',mil:'1',modo:'peso',mult:'1',coluna:'T',sufixo:'',marcado:true}]}];d.form.banhista='teste';d.form.on={ouro:true,prata:true};localStorage.setItem('cadpecas4',JSON.stringify(d))}""")
    pg.reload();pg.wait_for_timeout(1000)
    # 3) palavras acima da descrição + preenchimento automático
    pg.fill('#f-F','')
    pg.fill('#f-I','Brincos');pg.press('#f-I','Tab');pg.wait_for_timeout(300)
    pg.click('#f-J');pg.keyboard.type('Argolas');pg.keyboard.press('Tab');pg.wait_for_timeout(500)
    chips=pg.locator('.banco-rapido [data-act="desc-palavra"]').all_inner_texts()[:2];print('chips',chips,'| descrição:',repr(pg.input_value('#f-F')))
    assert chips==['Argolinha','Click'] and pg.input_value('#f-F')=='',(chips,pg.input_value('#f-F'))   # a descrição não é mais preenchida sozinha: os complementos são sugestões
    pg.fill('#f-F','Brinco Argola ')
    pg.focus('#f-F');pg.wait_for_timeout(150);pg.keyboard.type('lisa fina');pg.fill('#f-N','1');pg.fill('#f-P','2');pg.fill('#f-ouro-W','1');pg.locator('#f-prata-W').fill('')
    pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    d=pg.locator('tr[data-l] [data-c="F"]').first.inner_text();print('descrição criada:',d);assert d.startswith('Brinco Argola lisa fina')
    # clicar na palavra
    pg.fill('#f-F','');palavra=pg.locator('.banco-rapido [data-act="desc-palavra"]').first.inner_text();pg.locator('.banco-rapido [data-act="desc-palavra"]').first.click();pg.wait_for_timeout(300);assert pg.input_value('#f-F').strip()==palavra
    # categoria Anel exporta como Anel
    pg.fill('#f-I','Anel');pg.press('#f-I','Tab');pg.wait_for_timeout(400);pg.fill('#f-F','Anel teste');pg.fill('#f-N','1');pg.fill('#f-P','2');pg.fill('#f-ouro-W','1')
    for t in ('a12','a13'):pg.locator(f'label:has([data-gi="{t}"])').click()
    pg.fill('[data-qall="ouro"]','1');pg.locator('button.btn.pri.big[type="submit"]').click();pg.wait_for_timeout(600)
    with pg.expect_download() as dl:
        pg.locator('[data-act="xlsx"]').first.click();pg.wait_for_timeout(500)
        if pg.locator('[data-act="exp-assim"]').count() and pg.locator('[data-act="exp-assim"]').is_visible():pg.locator('[data-act="exp-assim"]').click()
    ws=load_workbook(BytesIO(Path(dl.value.path()).read_bytes())).active;h=[c.value for c in ws[1]];cats=[r[h.index('Categoria')] for r in ws.iter_rows(min_row=2,values_only=True)];print('categorias na planilha',set(cats));assert 'Anel' in cats and 'Anél' not in cats
    # 4) fiscal de todas as categorias de uma vez
    pg.locator('#side [data-go="sec:cat"]').click();pg.wait_for_timeout(600)
    pg.locator('details[data-open="fiscall"] summary').click();pg.wait_for_timeout(200)
    pg.fill('[data-fall="ncm"]','71171900');pg.fill('[data-fall="cfop"]','5102');pg.locator('[data-act="fisc-aplicar"]').click();pg.wait_for_timeout(1500)
    C=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config");assert all(c.get('ncm')=='71171900' and c.get('cfop')=='5102' for c in C['categorias']),'aplicou em todas'
    x=pg.locator('[data-fc="2"][data-fk="fcp"]');x.fill('4');x.press('Tab');pg.wait_for_timeout(1500)
    C=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config");assert C['categorias'][2].get('fcp')=='4'
    pg.fill('[data-fall="ncm"]','123');pg.locator('[data-act="fisc-aplicar"]').click();pg.wait_for_timeout(500)
    assert pg.locator('[data-fc="0"][data-fk="ncm"]').input_value()=='71171900','NCM inválido não é aplicado'
    # 5) novo banho acima da tabela de milésimos
    pg.locator('#side [data-go="sec:banho"]').click();pg.wait_for_timeout(700)
    y_add=pg.locator('[data-bh="0"] [data-act="bn-pronto"]').first.evaluate("e=>e.getBoundingClientRect().top");y_mil=pg.locator('[data-bh="0"] details[data-open^="mc:"] summary').first.evaluate("e=>e.getBoundingClientRect().top")
    print('adicionar banho em',round(y_add),'milésimos em',round(y_mil));assert y_add<y_mil
    # 6) + Galvânica no lançamento leva à página da galvânica
    pg.locator('#side [data-vis="tudo"]').click();pg.wait_for_timeout(300)
    n0=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config.banhistas.length")
    pg.locator('[data-act="q"][data-q="bh"]').first.click();pg.wait_for_timeout(900)
    n1=pg.evaluate("()=>JSON.parse(localStorage.getItem('cadpecas4')).config.banhistas.length");assert n1==n0+1
    assert pg.locator('[data-bh="%d"] [data-bhf="nome"]'%n0).is_visible(),'a nova galvânica aparece na página completa'
    assert not err,err
    b.close();print('OK ajustes de cadastros')
