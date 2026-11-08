import os,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8810),functools.partial(Q,directory=D));threading.Thread(target=srv.serve_forever,daemon=True).start()
f=[]
def ok(c,m):
    print(("OK    " if c else "FALHA ")+m)
    if not c:f.append(m)
AM=os.path.join(D,"tests","dados","rom_amostra.txt")
with sync_playwright() as p:
    b=p.chromium.launch(channel="msedge");pg=b.new_context(viewport={"width":1400,"height":900}).new_page()
    errs=[];pg.on("pageerror",lambda e:errs.append(str(e)));pg.on("dialog",lambda d:d.dismiss())
    pg.goto("http://127.0.0.1:8810/Cadastro%20de%20Pecas%20-%20abrir%20no%20Chrome.html");pg.wait_for_timeout(900)
    ok(pg.locator("#side").is_visible(),"menu lateral já aparece aberto")
    ok(not pg.locator("#vis").is_visible(),"sem barra de visões no desktop")
    ok(pg.locator("#vpal").count()==0 and pg.locator("#vside").count()==0,"sem botões Menu e Comandos")
    pg.click("#sideT");pg.wait_for_timeout(300)
    ok(pg.locator("#sideOpen").is_visible() and not pg.locator("#side").is_visible(),"recolhido: aparece botão Menu para expandir")
    pg.click("#sideOpen");pg.wait_for_timeout(300)
    ok(pg.locator("#side").is_visible(),"botão Menu expande de novo")
    # importação: topo do formulário
    ok(pg.locator('#impBar [data-act="rom-abrir"]').is_visible() and pg.locator('#impBar [data-act="imp-pick"]').is_visible(),"topo do formulário tem Romaneio e Importar arquivos")
    pg.set_input_files("#impFile",[AM,AM]);pg.wait_for_timeout(700)
    ok(pg.locator("#impBar .imp-q li").count()==2,"vários arquivos entram na fila")
    ok(pg.locator("#impBar .imp-q li.dup").count()==1,"repetido na fila é marcado")
    pg.click('#impBar [data-act="imp-down"] >> nth=0');pg.wait_for_timeout(200)
    ok(pg.locator("#impBar .imp-q li").count()==2,"ordem da fila ajustável")
    pg.click('#impBar [data-act="imp-abrir"] >> nth=0');pg.wait_for_timeout(1500)
    ok(pg.locator("#romWrap .rc").count()>0,"abrir da fila lê o romaneio (%d cartões)"%pg.locator("#romWrap .rc").count())
    # guarda e reapresenta o mesmo arquivo
    pg.evaluate("document.querySelector('[data-act=rom-fechar]')&&document.querySelector('[data-act=rom-fechar]').click()");pg.wait_for_timeout(800)
    pg.click('#impBar [data-act="imp-limpar"]');pg.wait_for_timeout(200)
    pg.set_input_files("#impFile",[AM]);pg.wait_for_timeout(700)
    ok(pg.locator("#impBar .imp-q li.dup").count()==1,"mesmo romaneio já importado é reconhecido")
    # fator por banho
    pg.click('#side [data-go="sec:banho"]');pg.wait_for_timeout(500)
    ok(pg.locator('#cfg [data-bnf="fator"]').count()>=1,"banhos têm coluna Fator ×")
    pg.fill('#cfg [data-bnf="fator"] >> nth=0',"2,5");pg.press('#cfg [data-bnf="fator"] >> nth=0',"Tab");pg.wait_for_timeout(300)
    pg.click('#side [data-vis="tudo"]');pg.wait_for_timeout(500)
    pg.select_option("#f-I","Brincos");pg.wait_for_timeout(300)
    ph=pg.eval_on_selector_all("[data-mk]","e=>e.map(x=>x.placeholder)")
    ok("2,5" in ph,"fator padrão do banho aparece no lançamento (%s)"%ph[:3])
    ok("anhista" not in pg.inner_text("#side")+pg.inner_text("#cfg"),"textos usam Galvânica")
    # categorias: palavra Expandir e subcategorias retas
    pg.click('#side [data-go="sec:cat"]');pg.wait_for_timeout(500)
    ok(pg.locator("#cfg .cx",has_text="Expandir").count()>=1 or pg.locator("#cfg .cx",has_text="Recolher").count()>=1,"botão com a palavra Expandir/Recolher")
    rad=pg.evaluate("(()=>{const e=document.querySelector('#cfg .chips .chip');return e?parseFloat(getComputedStyle(e).borderTopLeftRadius):0})()")
    ok(rad<=10,"subcategorias com acabamento reto padrão (raio %s)"%rad)
    print("erros",errs,"FALHAS",f)
    if errs:f.append("erros de página")
