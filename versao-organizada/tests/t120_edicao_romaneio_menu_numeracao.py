"""Celular: (1) aviso de peça em edição ao abrir romaneio traz "Cancelar edição e continuar" e abre o romaneio;
(2) Cancelar edição fica na barra fixa do formulário; (3) numeração do sistema (última peça) no formulário;
(4) menu do celular espelha o menu lateral do desktop."""
import re
from pathlib import Path
from playwright.sync_api import sync_playwright
url=(Path(__file__).resolve().parent.parent/'Cadastro de Pecas - abrir no Chrome.html').as_uri()
falhas=[]
def ok(c,m):
    print(('OK    ' if c else 'FALHA ')+m)
    if not c:falhas.append(m)
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge')
    # desktop: rótulos do menu lateral
    dk=b.new_page(viewport={'width':1400,'height':900});dk.goto(url);dk.wait_for_timeout(1200)
    lat=dk.eval_on_selector_all('#side nav.sn button span.sl','e=>e.map(x=>x.textContent.trim())')
    dk.close()
    pg=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.goto(url);pg.wait_for_timeout(1200)
    # (4) menu do celular espelha o lateral
    pg.locator('#mobileMenu summary').click();pg.wait_for_timeout(300)
    mob=pg.eval_on_selector_all('#mobileMenu .mobile-menu-panel > button[data-mobile] span','e=>e.map(x=>x.textContent.trim())')
    faltam=[r for r in lat if r not in mob and r!='Tabela e formulário']
    ok(not faltam,'menu do celular tem todos os itens do menu lateral do desktop (faltam: %s)'%faltam)
    ok(mob.index('Importar romaneio')<mob.index('Galvânicas e banhos')<mob.index('Padrões das colunas'),'mesma ordem de grupos do desktop')
    pg.locator('.mobile-menu-close').click()
    # criar uma peça
    pg.locator('#mobileMenu summary').click();pg.locator('[data-mobile="vis:lancar"]').click();pg.wait_for_timeout(600)
    pg.fill('#f-F','Brinco teste');pg.fill('#f-N','1');pg.fill('#f-P','2')
    ok(pg.locator('#numFormHost #nbTog').is_visible(),'(3) "Numeração do sistema" aparece no formulário do celular como botão expansível')
    ok(not pg.locator('#numFormHost #numbar').is_visible(),'(3) começa recolhida, como no desktop')
    pg.locator('#numFormHost #nbTog').click();pg.wait_for_timeout(300)
    ok(pg.locator('#numFormHost #numbar').is_visible() and pg.locator('#numFormHost [data-ult]').count()>=3,'(3) ao expandir mostra a última peça de cada prefixo')
    inp=pg.locator('#numFormHost [data-ult="BR"]');inp.fill('1700');inp.dispatch_event('change');pg.wait_for_timeout(400)
    ok('1701' in pg.locator('#numFormHost label[data-p="BR"] small').inner_text(),'(3) mudar a última peça muda a próxima referência')
    pg.fill('#f-F','Brinco teste');ok(pg.locator('#numFormHost #nbTog').is_visible(),'(3) a numeração sobrevive a refazer o formulário')
    bt=pg.locator('#form .z-end button').all_inner_texts()
    ok(len(bt)>=3 and bt[-3].strip().startswith('Adicionar') and 'limpar' in bt[-2] and bt[-1].strip()=='Cancelar','Cancelar fica à direita de Adicionar e limpar: %s'%bt)
    pg.locator('#form .z-end [data-act="cancel"]').click();pg.wait_for_timeout(500)
    ok(pg.input_value('#f-F')=='' and pg.input_value('#f-N')=='','Cancelar sem edição esvazia o formulário')
    pg.fill('#f-F','Brinco teste');pg.fill('#f-N','1');pg.fill('#f-P','2')
    pg.locator('#form [data-on]').first.check()
    if pg.locator('#f-ouro-W').count():pg.fill('#f-ouro-W','1')
    pg.locator('#form button[type=submit]').click();pg.wait_for_timeout(600)
    # entrar em edição
    pg.locator('#mobileMenu summary').click();pg.locator('[data-mobile="vis:planilha"]').click();pg.wait_for_timeout(600)
    pg.locator('[data-act="editar"]').first.click();pg.wait_for_timeout(600)
    ok(pg.locator('#form [data-act="cancel"]:visible').count()>=1,'(2) botão Cancelar edição visível na edição')
    box=pg.locator('#form .z-end [data-act="cancel"]').bounding_box()
    ok(box is not None and 0<box['y']<844 and box['y']+box['height']<=844,'(2) Cancelar edição fica na barra fixa, na tela, sem rolar (%s)'%box)
    # (1) tentar abrir romaneio com peça em edição
    pg.wait_for_timeout(1500)
    if pg.locator('#tFechar:visible').count():pg.locator('#tFechar').click()   # aviso de armazenamento do navegador, independente deste fluxo
    pg.locator('#mobileMenu summary').click();pg.locator('[data-mobile="act:rom-abrir"]').click();pg.wait_for_timeout(500)
    ok(pg.locator('#toast #tBtn:visible').count()==1 and 'Cancelar edição' in pg.locator('#tBtn').inner_text(),'(1) aviso de bloqueio traz botão para cancelar a edição')
    ok(pg.locator('#romWrap textarea').count()==0 or not pg.locator('#romWrap textarea').is_visible(),'romaneio ainda fechado antes de cancelar')
    pg.locator('#tBtn').click();pg.wait_for_timeout(800)
    ok(pg.locator('#romWrap textarea').is_visible(),'(1) depois de cancelar a edição o romaneio abre na hora')
    ok('Editando' not in pg.locator('#form .mfh').inner_text(),'edição encerrada')
    ok(not errs,'sem erros de JavaScript: %s'%errs[:2])
    # desktop: mesmo aviso, vindo do menu lateral
    d=b.new_page(viewport={'width':1400,'height':900});derr=[];d.on('pageerror',lambda e:derr.append(str(e)));d.on('dialog',lambda x:x.accept())
    d.goto(url);d.wait_for_timeout(1200)
    d.fill('#f-F','Brinco desk');d.fill('#f-N','1');d.fill('#f-P','2')
    d.locator('#form [data-on]').first.check()
    if d.locator('#f-ouro-W').count():d.fill('#f-ouro-W','1')
    d.locator('#form button[type=submit]').click();d.wait_for_timeout(600)
    d.locator('[data-act="editar"]').first.click();d.wait_for_timeout(500)
    ok(d.locator('#form [data-act="cancel"]:visible').count()>=1,'desktop: Cancelar edição visível durante a edição')
    d.wait_for_timeout(1500)
    if d.locator('#tFechar:visible').count():d.locator('#tFechar').click()
    d.locator('#side [data-go="act:rom-abrir"]').click();d.wait_for_timeout(500)
    ok(d.locator('#toast #tBtn:visible').count()==1,'desktop: aviso do menu lateral traz o botão Cancelar edição e continuar')
    d.locator('#tBtn').click();d.wait_for_timeout(800)
    ok(d.locator('#romWrap textarea').is_visible(),'desktop: romaneio abre depois de cancelar a edição')
    ok(not derr,'desktop sem erros: %s'%derr[:2])
    b.close()
print('\nFalhas:',len(falhas))
if falhas:raise SystemExit(1)
